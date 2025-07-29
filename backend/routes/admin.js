import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/isAdmin.js';
import {getAllUsers, getSystemStats } from '../controllers/adminController.js';
import { getAllBooksDetailed } from '../controllers/adminBookController.js';
import { getAllUsersDetailed } from '../controllers/adminController.js';
import { getPlatformStats } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getAllUsersDetailed);
router.get('/stats', protect, isAdmin, getSystemStats);



// Προσθήκη νέου endpoint για detailed books
router.get('/books', protect, isAdmin, getAllBooksDetailed);


// Προσθήκη νέου endpoint για detailed users
router.get('/users-detailed', protect, isAdmin, getAllUsersDetailed);

// Προσθήκη νέου endpoint για platform stats
router.get('/stats/platform', protect, isAdmin, getPlatformStats);

export default router;
