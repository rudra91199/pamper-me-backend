import express from "express";
import {
  createBooking,
  getAllBookedSlots,
  getAllBookings,
} from "./bookings.controller.js";

const router = express.Router();

//get booking by email
router.get("/get/all", getAllBookings);
//create booking
router.post("/create", createBooking);

router.get("/getAllBookedSlots", getAllBookedSlots);

export const BookingRoutes = router;
