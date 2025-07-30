// src/routes/salesRoutes.js
import express from 'express';
import { getSalesStats } from '../controllers/salesController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { attachStoreToRequest } from '../middleware/storeMiddleware.js'; // ΝΕΟ

const router = express.Router();
/**
 * @swagger
 * /sales/stats:
 *   get:
 *     summary: Λήψη στατιστικών πωλήσεων για τον συνδεδεμένο πωλητή
 *     description: Επιστρέφει συνολικά στατιστικά πωλήσεων για το κατάστημα που ανήκει στον τρέχοντα συνδεδεμένο πωλητή.
 *     tags: [Πωλήσεις]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Στατιστικά πωλήσεων πωλητή
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *                   example: 1199.99
 *                 totalOrders:
 *                   type: integer
 *                   example: 24
 *       400:
 *         description: Δεν βρέθηκε κατάστημα για τον χρήστη
 *       401:
 *         description: Μη εξουσιοδοτημένος
 *       500:
 *         description: Σφάλμα κατά την ανάκτηση των στατιστικών
 */

// Χρήση του middleware για να περάσουμε το store στον controller
router.get('/stats', authMiddleware.protect, attachStoreToRequest, getSalesStats);

export default router;
