// routes/bulkImportRoutes.js
import express from 'express';
import { upload, bulkImportBooks } from '../controllers/bulkImportController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';

const router = express.Router();
/**
 * @swagger
 * /bulk/upload:
 *   post:
 *     summary: Μαζική εισαγωγή βιβλίων (Excel ή JSON)
 *     description: Επιτρέπει σε πωλητές να εισάγουν μαζικά βιβλία μέσω αρχείου τύπου **Excel (.xlsx)** ή **JSON**.
 *     tags: [Μαζική Εισαγωγή]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Το αρχείο Excel ή JSON που περιέχει τα βιβλία
 *     responses:
 *       200:
 *         description: Τα βιβλία εισήχθησαν με επιτυχία
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Εισήχθησαν 15 βιβλία επιτυχώς."
 *       400:
 *         description: Σφάλμα κατά την εισαγωγή ή μη έγκυρο αρχείο
 *       401:
 *         description: Μη εξουσιοδοτημένος
 *       500:
 *         description: Εσωτερικό σφάλμα διακομιστή
 */

// Route για μαζική εισαγωγή αρχείου βιβλίων (μόνο για seller)
router.post('/upload', protect, isSeller, upload, bulkImportBooks);

export default router;
