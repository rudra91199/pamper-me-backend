import express from "express";
import {
  addReview,
  getAllProducts,
  getProductsByCategory,
  getProductsByQuery,
  updateProduct,
} from "./products.controller.js";

const router = express.Router();

router.get("/all", getAllProducts);

router.get("/getProductsByCategory", getProductsByCategory);

router.get("/getProductsByQuery", getProductsByQuery);

router.put("/update/:id", updateProduct);

router.put("/addReview/:id", addReview);

export const ProductRoutes = router;
