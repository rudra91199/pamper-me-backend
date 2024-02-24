import express from 'express';
import { getAllProducts, getProductsByCategory, getProductsByQuery } from '../controllers/products.controller.js';

const router = express.Router();

router.get("/all", getAllProducts)

router.get("/getProductsByCategory",getProductsByCategory)

router.get("/getProductsByQuery",getProductsByQuery)

export default router;