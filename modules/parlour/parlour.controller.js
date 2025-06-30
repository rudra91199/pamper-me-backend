import mongoose from "mongoose";
import cloudinary from "../../lib/cloudinary.config.js";
import SendResponse from "../../utils/sendResponse.js";
import { Parlour } from "./parlour.model.js";
import { parlourSearchableFields } from "./parlour.constants.js";
import { DashboardUser } from "../dashBoardUser/dashboardUser.model.js";
import Services from "../services/services.model.js";
import Employees from "../employee/employees.model.js";

const createParlour = async (req, res) => {
  const { title, ownerId, image, address } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { secure_url, public_id } = await cloudinary.uploader.upload(image, {
      upload_preset: "parlour_image",
      resource_type: "image",
    });
    if (!secure_url || !public_id) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }
    const parlourData = {
      title,
      image: {
        url: secure_url,
        public_id: public_id,
      },
      ownerId,
      address,
      status: req.body.status || "active",
    };
    const newParlour = await Parlour.create([parlourData], { session });
    if (!newParlour.length) {
      await cloudinary.uploader.destroy(public_id);
      return res.status(400).json({
        success: false,
        message: "Failed to create parlour",
      });
    }
    const addParlourToOwner = await DashboardUser.findByIdAndUpdate(
      ownerId,
      {
        parlourId: newParlour[0]._id,
      },
      { session, new: true }
    );
    await session.commitTransaction();
    await session.endSession();
    SendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Parlour created successfully.",
      data: newParlour,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return res
      .status(400)
      .json({ success: false, message: "Failed to create parlour" });
  }
};

const getAllParlours = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const searchTerm = req?.query?.searchTerm || "";
  try {
    const isObjectId = mongoose.isValidObjectId(searchTerm);
    const objectId = isObjectId
      ? new mongoose.Types.ObjectId(searchTerm)
      : null;

    const parlours = await Parlour.aggregate([
      {
        $lookup: {
          from: "dashboardusers",
          localField: "ownerId",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: "$ownerDetails",
      },
      {
        $addFields: {
          owner: {
            name: "$ownerDetails.name",
            email: "$ownerDetails.email",
          },
        },
      },
      { $project: { ownerDetails: 0 } },
      {
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { "owner.name": { $regex: searchTerm, $options: "i" } },
            ...(isObjectId ? [{ _id: objectId }, { ownerId: objectId }] : []),
          ],
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const count = await Parlour.countDocuments();

    SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Parlours fetched successfully.",
      data: { parlours, count },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Failed to fetch parlours" });
  }
};

const getSingleParlour = async (req, res) => {
  const { parlourId } = req.params;
  try {
    const parlour = await Parlour.findById(parlourId)
      .populate("ownerId", "name email")
      .populate({
        path: "services",
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate({
        path: "employees",
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate({
        path: "bookings",
        populate: {
          path: "serviceId employee",
        },
        options: {
          sort: { createdAt: -1 },
        },
      });

    SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Parlour fetched successfully.",
      data: parlour,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Failed to fetch parlour" });
  }
};

const handleDeleteParlour = async (req, res) => {
  const id = req.params.parlourId;
  console.log(id);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await Services.deleteMany({ parlourId: id }, { session });
    await Employees.deleteMany({ parlourId: id }, { session });
    await DashboardUser.findOneAndUpdate(
      { parlourId: id },
      {
        $unset: { parlourId: "" },
      },
      { session }
    );
    await Parlour.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    await session.endSession();
    SendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Parlour deleted successfully.",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    res
      .status(500)
      .json({ success: false, message: "Failed to delete parlour." });
  }
};

export const ParlourControllers = {
  createParlour,
  getAllParlours,
  getSingleParlour,
  handleDeleteParlour,
};
