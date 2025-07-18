// routes/storeRoutes.js
import express from 'express';
import { createStore, getMyStore } from '../controllers/storeController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, isSeller, createStore); // δηλαδή POST /api/stores
router.get('/my', protect, isSeller, getMyStore);

export default router; // ΠΡΟΣΟΧΗ: default export
