import express from 'express';
import { getAdminAnalytics, getAdminCustomers } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Lock all analytics paths
router.use(admin);   // Require Admin role validation

router.get('/', getAdminAnalytics);
router.get('/customers', getAdminCustomers);

export default router;
