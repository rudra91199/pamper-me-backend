import express from "express";
import { getServices } from "../controllers/services.controller.js";

const router = express.Router();

router.get("/all", getServices);

export default router;
