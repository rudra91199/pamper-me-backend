import express from "express";
import { getOrder, postOrder } from "../controllers/orders.contoller.js";

const router = express.Router();

router.post("/create", postOrder);
router.get("/getOrder", getOrder);

export default router;