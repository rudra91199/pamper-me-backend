import express from 'express';
import { getAllProducts, getProductsByCategory } from '../controllers/products.controller.js';

const router = express.Router();

router.get("/all", getAllProducts)

router.get("/getProductsByCategory",getProductsByCategory)

export default router;