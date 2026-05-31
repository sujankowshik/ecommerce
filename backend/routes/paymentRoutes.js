import express from 'express';
import { createStripePaymentIntent, verifyPayPalTransaction } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure payment endpoints for logged in buyers

router.post('/stripe/create-intent', createStripePaymentIntent);
router.post('/paypal/verify', verifyPayPalTransaction);

export default router;
