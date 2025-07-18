// routes/bulkImportRoutes.js
import express from 'express';
import { upload, bulkImportBooks } from '../controllers/bulkImportController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Route για μαζική εισαγωγή αρχείου βιβλίων (μόνο για seller)
router.post('/upload', protect, isSeller, upload, bulkImportBooks);

export default router;
