import express from "express";
import { createBooking, getBookingByEmail } from "../controllers/bookings.controller.js";

const router = express.Router();

//get booking by email
router.get("/bookingsByEmail/:email", getBookingByEmail);
//create booking
router.post("/create", createBooking);

export default router;