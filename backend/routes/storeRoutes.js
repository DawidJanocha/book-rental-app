// routes/storeRoutes.js
import express from 'express';
import { createStore, getMyStore } from '../controllers/storeController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import { getStoreById } from '../controllers/storeController.js';
const router = express.Router();

router.post('/', protect, isSeller, createStore); 
router.get('/my', protect, isSeller, getMyStore);
router.get('/:id', getStoreById);
export default router; // ΠΡΟΣΟΧΗ: default export
