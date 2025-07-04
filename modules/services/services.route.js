import express from "express";
import {
  addReview,
  getServiceByQuery,
  getServices,
  ServiceControllers,
  updateAllService,
} from "./services.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.post("/create", verifyToken, isAdmin, ServiceControllers.createService);

router.get("/all", getServices);

router.get(
  "/getAllServiceByParlour/:parlourId",
  ServiceControllers.getAllServiceByParlour
);

router.patch(
  "/update/:id",
  verifyToken,
  isAdmin,
  ServiceControllers.updateService
);

router.get("/getServicesByQuery", getServiceByQuery);

router.put("/updateAllServices", updateAllService);

router.put("/addReview/:id", addReview);

export const ServiceRoutes = router;
