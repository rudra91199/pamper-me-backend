import express from "express";
import { addReview, getServiceByQuery, getServices, updateAllService } from "../controllers/services.controller.js";

const router = express.Router();

router.get("/all", getServices);

router.get("/getServicesByQuery",getServiceByQuery)

router.put("/updateAllServices", updateAllService)

router.put("/addReview/:id", addReview);


export default router;
