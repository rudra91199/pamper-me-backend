import express from "express";
import { getOrder, postOrder } from "./orders.contoller.js";

const router = express.Router();

router.post("/create", postOrder);
router.get("/getOrder", getOrder);

export const OrderRoutes = router;
