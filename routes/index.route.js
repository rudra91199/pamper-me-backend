import { dashboardRoutes } from "../modules/dashBoardUser/dashboardUser.route.js";
import { EmployeeRoutes } from "../modules/employee/employee.routes.js";
import { ServiceRoutes } from "../modules/services/services.route.js";
import { ParlourRoutes } from "../modules/parlour/parlour.route.js";
import { BookingRoutes } from "../modules/bookings/bookings.route.js";
import { UserRoutes } from "../modules/users/users.route.js";
import { OrderRoutes } from "../modules/orders/orders.route.js";
import { ProductRoutes } from "../modules/products/products.routes.js";
import { Router } from "express";

const router = Router();

const moduleRoutes = [
  {
    path: "/services",
    route: ServiceRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/bookings",
    route: BookingRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/employees",
    route: EmployeeRoutes,
  },
  {
    path: "/dashboard",
    route: dashboardRoutes,
  },
  {
    path: "/parlour",
    route: ParlourRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
