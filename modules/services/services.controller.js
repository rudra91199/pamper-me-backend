import mongoose from "mongoose";
import cloudinary from "../../lib/cloudinary.config.js";
import SendResponse from "../../utils/sendResponse.js";
import { Parlour } from "../parlour/parlour.model.js";
import Services from "./services.model.js";

const createService = async (req, res) => {
  const { serviceImages } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    let images = [];
    if (serviceImages && serviceImages.length > 0) {
      for (let i = 0; i < serviceImages.length; i++) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          serviceImages[i],
          {
            upload_preset: "service_images",
            // transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
          }
        );
        images.push({ url: secure_url, public_id });
      }
    }

    if (images.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const serviceData = {
      ...req.body,
      images: images,
    };

    const newService = await Services.create([serviceData], { session });
    if (!newService.length) {
      for (let i = 0; i < images.length; i++) {
        await cloudinary.uploader.destroy(images[i].public_id);
      }
      return res.status(400).json({
        success: false,
        message: "Failed to create service",
      });
    }
    const addServiceIntoParlour = await Parlour.findByIdAndUpdate(
      newService[0].parlourId,
      {
        $push: {
          services: newService[0]._id,
        },
      },
      { session }
    );
    await session.commitTransaction();
    await session.endSession();
    SendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Service created successfully.",
      data: newService,
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create service",
    });
  }
};

export const getServices = async (req, res) => {
  const query = {};
  const result = await Services.find(query);
  res.send(result);
};

export const getServiceByQuery = async (req, res) => {
  const query = req.query;
  const filter = {
    ...(query.search && {
      title: { $regex: query.search, $options: "i" },
    }),
  };
  const result = await Services.find(filter);
  res.send(result);
};

export const updateAllService = async (req, res) => {
  const body = req.body;
  const result = await Services.updateMany(
    {},
    {
      $set: body,
    },
    {
      upsert: true,
    }
  );
  res.send(result);
};

export const addReview = async (req, res) => {
  const id = req.params.id;
  const result = await Services.findByIdAndUpdate(id, {
    $push: { reviews: req.body },
  });
  res.send(result);
};

export const ServiceControllers = {
  createService,
};
