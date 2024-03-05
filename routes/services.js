import express from "express";
import { getServiceByQuery, getServices } from "../controllers/services.controller.js";

const router = express.Router();

router.get("/all", getServices);

router.get("/getServicesByQuery",getServiceByQuery)

export default router;
