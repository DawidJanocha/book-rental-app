// src/routes/salesRoutes.js
import express from 'express';
import { getSalesStats } from '../controllers/salesController.js';  // Σωστή εισαγωγή του controller
import authMiddleware from '../middleware/authMiddleware.js';  // Εισαγωγή του middleware για την αυθεντικοποίηση

const router = express.Router();

// Ορισμός του route για τα στατιστικά πωλήσεων
router.get('/stats', authMiddleware.protect, getSalesStats);

export default router;
