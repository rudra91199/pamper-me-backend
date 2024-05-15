import express from 'express';
import { addReview, getAllProducts, getProductsByCategory, getProductsByQuery, postProduct, updateProduct } from '../controllers/products.controller.js';

const router = express.Router();

router.get("/all", getAllProducts)

router.get("/getProductsByCategory",getProductsByCategory)

router.get("/getProductsByQuery",getProductsByQuery)

router.put("/update/:id",updateProduct);

router.put("/addReview/:id", addReview);

router.post("/postProduct", postProduct);

export default router;