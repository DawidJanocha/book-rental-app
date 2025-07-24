import { getSellerStats, getCustomerStats,getMonthlyStatsForSeller } from '../controllers/statsController.js';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Στατιστικά για τον seller
router.get('/stats/seller', protect, getSellerStats);

// Στατιστικά πελατών
router.get('/stats/customer', protect, getCustomerStats);

// Εξαγωγή στατιστικών ανα μηνα
router.get('/stats/seller/monthly', protect, getMonthlyStatsForSeller);




export default router;