import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  uploadImages
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/upload')
  .post(protect, admin, upload.array('images', 5), uploadImages);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Protected User Review Route
router.route('/:id/reviews')
  .post(protect, createProductReview);

export default router;
