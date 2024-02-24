import express from "express";
const router = express.Router();
import { creatUser, getUserByEmail, updateUser } from "../controllers/users.controller.js";

router.get("/:email",getUserByEmail);

router.put("/:email",creatUser);

router.put("/user/:email",updateUser);

export default router;
