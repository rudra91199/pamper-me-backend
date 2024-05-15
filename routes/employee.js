import express from "express"
import { getAllEmployees } from "../controllers/employee.controller.js";

const router = express.Router();

router.get("/getAll", getAllEmployees)

export default router;