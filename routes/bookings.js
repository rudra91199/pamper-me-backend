import express from "express";
import { getBookingByEmail } from "../controllers/bookings.controller.js";

const router = express.Router();

router.get("/bookingsByEmail/:email", getBookingByEmail);

export default router;