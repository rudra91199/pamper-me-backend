import express from "express";
import {
  createEmployeeBookings,
  EmployeeControllers,
  getAllEmployees,
} from "./employees.controller.js";

const router = express.Router();

router.get("/getAll", getAllEmployees);

router.put("/createBooking/:id", createEmployeeBookings);

router.post("/create", EmployeeControllers.createEmployee);

router.get("/getAvailableEmployees", EmployeeControllers.getAvailableEmployees);

export const EmployeeRoutes = router;
