// routes/storeRoutes.js
import express from 'express';
import { createStore, getMyStore } from '../controllers/storeController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import { getStoreById } from '../controllers/storeController.js';


const router = express.Router();

// Δημιουργία καταστήματος (μόνο για seller)
// Προβολή καταστήματος του seller (μόνο για seller)
router.post('/', protect, isSeller, createStore); 

// Προβολή καταστήματος του seller
router.get('/my', protect, isSeller, getMyStore);

// Προβολή καταστήματος από ID (δημόσια)
router.get('/:id', getStoreById);



export default router; // ΠΡΟΣΟΧΗ: default export
