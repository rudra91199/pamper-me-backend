import mongoose from "mongoose";
import SendResponse from "../../utils/sendResponse.js";
import employeesModel from "../employee/employees.model.js";
import { Parlour } from "../parlour/parlour.model.js";
import bookingsModel from "./bookings.model.js";
import Bookings from "./bookings.model.js";

export const getAllBookings = async (req, res) => {
  try {
    const { search, status, bookingId } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const filters = [];

    if (status) {
      filters.push({ status });
    }

    if (bookingId && mongoose.isValidObjectId(bookingId)) {
      filters.push({ _id: new mongoose.Types.ObjectId(bookingId) });
    }

    const pipeline = [
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: {
          path: "$service",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      {
        $unwind: {
          path: "$employeeInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Parlours",
          localField: "parlourId",
          foreignField: "_id",
          as: "parlour",
        },
      },
      {
        $unwind: {
          path: "$parlour",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          serviceDetails: {
            title: "$service.title",
            duration: "$service.duration",
            category: "$service.category",
            price: "$service.price",
          },
          employeeDetails: {
            name: "$employeeInfo.name",
            image: { $ifNull: ["$employeeInfo.image.url", null] },
          },
          parlourDetails: {
            title: "$parlour.title",
            address: "$parlour.address",
          },
        },
      },
      {
        $project: { service: 0, employeeInfo: 0, parlour: 0 },
      },
    ];

    if (search) {
      const regex = new RegExp(search, "i");
      filters.push({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { "parlourDetails.title": regex },
          { "serviceDetails.title": regex },
        ].filter(Boolean),
      });
    }

    if (filters.length > 0) {
      pipeline.push({
        $match: { $and: filters },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const bookings = await Bookings.aggregate(pipeline);
    const count = await Bookings.countDocuments();

    SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bookings fetched successfully.",
      data: { bookings, count },
    });
  } catch (err) {
    console.error("Error fetching filtered bookings:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createBooking = async (req, res) => {
  const booking = new Bookings(req.body);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const newBooking = await booking.save({ session });
    if (newBooking) {
      const addNewBookingToParlour = await Parlour.findByIdAndUpdate(
        req.body.parlourId,
        {
          $push: {
            bookings: newBooking._id,
          },
        },
        { session }
      );
    }
    if (newBooking.employee) {
      const bookings = req.body.bookingDates.map((booking) => ({
        ...booking,
        bookingId: newBooking._id,
      }));
      const addNewBookingToEmployee = await employeesModel.findByIdAndUpdate(
        newBooking.employee,
        {
          $push: {
            bookings: {
              $each: bookings,
            },
          },
        },
        {
          session,
        }
      );
    }
    await session.commitTransaction();
    await session.endSession();
    SendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully.",
      data: newBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const getAllBookedSlots = async (req, res) => {
  const { parlourId, date } = req.query;

  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  try {
    const employees = await employeesModel.find({ parlourId }).select("_id");
    const totalEmployees = employees.length;
    const employeeIds = employees.map((e) => e._id);

    const bookings = await bookingsModel.aggregate([
      { $match: { employee: { $in: employeeIds } } },
      { $unwind: "$bookingDates" },
      {
        $match: {
          "bookingDates.date": {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $project: {
          start: "$bookingDates.startTimeInMinutes",
          end: "$bookingDates.endTimeInMinutes",
          employee: 1,
        },
      },
    ]);

    const events = [];
    for (const b of bookings) {
      events.push({
        time: b.start,
        type: "start",
        employee: b.employee.toString(),
      });
      events.push({
        time: b.end,
        type: "end",
        employee: b.employee.toString(),
      });
    }

    events.sort((a, b) => a.time - b.time || (a.type === "start" ? -1 : 1));

    let result = [];
    let activeEmployees = new Set();
    let intervalStart = null;

    for (const e of events) {
      if (e.type === "start") activeEmployees.add(e.employee);
      else activeEmployees.delete(e.employee);

      if (activeEmployees.size === totalEmployees && intervalStart === null) {
        intervalStart = e.time;
      }

      if (activeEmployees.size < totalEmployees && intervalStart !== null) {
        result.push({ start: intervalStart, end: e.time });
        intervalStart = null;
      }
    }

    const minutesToHHMM = (m) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
        2,
        "0"
      )}`;

    const fullyBookedSlots = result.map(
      ({ start, end }) => ({
        start,
        end,
      })
      // `${minutesToHHMM(start)} - ${minutesToHHMM(end)}`
    );

    res.status(200).json({ fullyBookedSlots });
  } catch (error) {
    console.error("Error getting fully booked slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
