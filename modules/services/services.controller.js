import mongoose from "mongoose";
import cloudinary from "../../lib/cloudinary.config.js";
import SendResponse from "../../utils/sendResponse.js";
import { Parlour } from "../parlour/parlour.model.js";
import Services from "./services.model.js";

const createService = async (req, res) => {
  const { serviceImages, ...remainingData } = req.body;
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
      ...remainingData,
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

export const getAllServiceByParlour = async (req, res) => {
  const { parlourId } = req.params;
  try {
    const services = await Services.find({ parlourId });
    SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Services retrieved successfully.",
      data: services,
    });
  } catch (error) {
    SendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Failed to retrived services.",
      data: null,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      shortDescription,
      description,
      price,
      discount,
      duration,
      status,
      removedItems = {},
      newItems = {},
    } = req.body;

    const service = await Services.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (title) service.title = title;
    if (category) service.category = category;
    if (shortDescription) service.shortDescription = shortDescription;
    if (description) service.description = description;
    if (price !== undefined) service.price = price;
    if (discount !== undefined) service.discount = discount;
    if (duration !== undefined) service.duration = duration;
    if (status) service.status = status;

    if (removedItems.images?.length > 0) {
      const publicIdsToRemove = removedItems.images.map((img) => img.public_id);
      service.images = service.images.filter((img) => {
        const shouldRemove = publicIdsToRemove.includes(img.public_id);
        if (shouldRemove) {
          cloudinary.uploader.destroy(img.public_id);
        }
        return !shouldRemove;
      });
    }

    if (removedItems.steps?.length > 0) {
      const stepsToRemove = removedItems.steps.map((item) => item.step);
      service.steps = service.steps.filter(
        (step) => !stepsToRemove.includes(step)
      );
    }

    if (removedItems.benefits?.length > 0) {
      const benefitsToRemove = removedItems.benefits.map(
        (item) => item.benefit
      );
      service.benefits = service.benefits.filter(
        (ben) => !benefitsToRemove.includes(ben)
      );
    }

    if (newItems.steps?.length > 0) {
      const stepsToAdd = newItems.steps.map((item) => item.step);
      service.steps.push(...stepsToAdd);
    }

    if (newItems.benefits?.length > 0) {
      const benefitsToAdd = newItems.benefits.map((item) => item.benefit);
      service.benefits.push(...benefitsToAdd);
    }

    if (newItems.images?.length > 0) {
      for (const image of newItems.images) {
        const result = await cloudinary.uploader.upload(image.url, {
          upload_preset: "service_images",
        });
        service.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    await service.save();
    return SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Service updated.",
      data: service,
    });
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const ServiceControllers = {
  createService,
  getAllServiceByParlour,
  updateService,
};
