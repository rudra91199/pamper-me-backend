import express from "express";
import {
  assignEmployee,
  createBooking,
  getAllBookedSlots,
  getAllBookings,
  getAllBookingsByParlourId,
  getSingleBooking,
  statusUpdate,
} from "./bookings.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import verifyRole from "../../middlewares/verifyRole.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

//get booking by email
router.get("/get/all", verifyToken, isAdmin, getAllBookings);
// get bookings by parlourId
router.get(
  "/getAllByParlourId",
  verifyToken,
  verifyRole,
  getAllBookingsByParlourId
);
//create booking
router.post("/create", createBooking);

router.get("/getAllBookedSlots", getAllBookedSlots);

router.patch(
  "/assignEmployee/:bookingId",
  verifyToken,
  verifyRole,
  assignEmployee
);

router.get(
  "/getSingleBooking/:bookingId",
  verifyToken,
  verifyRole,
  getSingleBooking
);

router.patch("/updateStatus/:bookingId", verifyToken, verifyRole, statusUpdate);

export const BookingRoutes = router;
