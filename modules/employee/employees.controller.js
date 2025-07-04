import mongoose from "mongoose";
import SendResponse from "../../utils/sendResponse.js";
import bookingsModel from "../bookings/bookings.model.js";
import { Parlour } from "../parlour/parlour.model.js";
import Employees from "./employees.model.js";
import cloudinary from "../../lib/cloudinary.config.js";

const createEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.body.profileImage,
      {
        upload_preset: "employee_image",
        resource_type: "image",
      }
    );
    if (!secure_url || !public_id) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }
    const employeeData = {
      ...req.body,
      image: {
        url: secure_url,
        public_id: public_id,
      },
    };
    const newEmployee = await Employees.create([employeeData], { session });
    if (!newEmployee.length) {
      await cloudinary.uploader.destroy(public_id);
      return res.status(400).json({
        success: false,
        message: "Failed to create parlour",
      });
    }
    const addEmployeeToParlour = await Parlour.findByIdAndUpdate(
      newEmployee[0].parlourId,
      { $push: { employees: newEmployee[0]._id } },
      { session }
    );

    await session.commitTransaction();
    await session.endSession();

    SendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Employee created successfully.",
      data: newEmployee,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create employee",
    });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const result = await Employees.find();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

export const createEmployeeBookings = async (req, res) => {
  const id = req.params.id;
  const result = await Employees.findByIdAndUpdate(id, {
    $push: { bookings: req.body },
  });
  res.send(result);
};

export const getAvailableEmployees = async (req, res) => {
  const { parlourId, date, requestedStart, requestedEnd } = req.query;

  try {
    const startMin = Number(requestedStart);
    const endMin = Number(requestedEnd);

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedEmployees = await Employees.aggregate([
      { $match: { parlourId: new mongoose.Types.ObjectId(parlourId) } },
      { $unwind: "$bookings" },
      {
        $match: {
          "bookings.date": { $gte: startOfDay, $lte: endOfDay },
          "bookings.startTimeInMinutes": { $lt: endMin },
          "bookings.endTimeInMinutes": { $gt: startMin },
        },
      },
      { $group: { _id: "$_id" } },
    ]);

    const bookedIds = bookedEmployees.map((e) => e._id.toString());

    const availableEmployees = await Employees.find({
      parlourId,
      _id: { $nin: bookedIds },
    });

    res.status(200).json({ availableEmployees });
  } catch (err) {
    console.error("Error fetching available employees:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const EmployeeControllers = {
  createEmployee,
  getAvailableEmployees,
};
