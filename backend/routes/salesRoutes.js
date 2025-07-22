// src/routes/salesRoutes.js
import express from 'express';
import { getSalesStats } from '../controllers/salesController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { attachStoreToRequest } from '../middleware/storeMiddleware.js'; // ΝΕΟ

const router = express.Router();

// Χρήση του middleware για να περάσουμε το store στον controller
router.get('/stats', authMiddleware.protect, attachStoreToRequest, getSalesStats);

export default router;
