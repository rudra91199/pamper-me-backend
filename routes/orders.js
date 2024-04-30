import express from "express";
import { postOrder } from "../controllers/orders.contoller.js";

const router = express.Router();

router.post("/create", postOrder);

export default router;