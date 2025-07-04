import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { DashboardUserControllers } from "./dashboardUser.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = Router();

//create user
router.post("/user/create", DashboardUserControllers.createUser);

//login
router.post("/user/admin/login", DashboardUserControllers.adminLogin);
router.post("/user/parlour/login", DashboardUserControllers.parlourLogin);

//check auth
router.get(
  "/check-auth/admin",
  verifyToken,
  DashboardUserControllers.checkAuth
);

router.get(
  "/user/get/all",
  verifyToken,
  isAdmin,
  DashboardUserControllers.getAllUsers
);

export const dashboardRoutes = router;
