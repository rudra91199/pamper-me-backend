import { Router } from "express";
import { ParlourControllers } from "./parlour.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = Router();

router.post("/create", verifyToken, isAdmin, ParlourControllers.createParlour);

router.get("/get/all", verifyToken, isAdmin, ParlourControllers.getAllParlours);

router.get(
  "/get/:parlourId",
  verifyToken,
  isAdmin,
  ParlourControllers.getSingleParlour
);

router.delete(
  "/delete/:parlourId",
  verifyToken,
  isAdmin,
  ParlourControllers.handleDeleteParlour
);

export const ParlourRoutes = router;
