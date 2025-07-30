import { getSellerStats, getCustomerStats,getMonthlyStatsForSeller } from '../controllers/statsController.js';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
/**
 * @swagger
 * /stats/seller:
 *   get:
 *     summary: Στατιστικά πωλητή
 *     description: Επιστρέφει αναλυτικά στατιστικά για τον συνδεδεμένο πωλητή, συμπεριλαμβανομένων πωλήσεων, εσόδων, best sellers και στοιχείων πελατών.
 *     tags: [Στατιστικά]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Επιτυχής επιστροφή στατιστικών πωλητή
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderCount:
 *                   type: integer
 *                   example: 125
 *                 booksSold:
 *                   type: integer
 *                   example: 540
 *                 totalRevenue:
 *                   type: number
 *                   example: 3490.75
 *                 bestSellers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Το Όνομα του Ρόδου"
 *                       sold:
 *                         type: integer
 *                         example: 42
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 dailyRevenue:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         example: "2025-07-25"
 *                       revenue:
 *                         type: number
 *                         example: 120.50
 *                 lastOrder:
 *                   type: object
 *                   properties:
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     totalPrice:
 *                       type: number
 *                     productName:
 *                       type: string
 *                 topOrders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Μη εξουσιοδοτημένος χρήστης
 */

// Στατιστικά για τον seller
router.get('/stats/seller', protect, getSellerStats);
/**
 * @swagger
 * /stats/customer:
 *   get:
 *     summary: Στατιστικά πελάτη
 *     description: Επιστρέφει στατιστικά για τον συνδεδεμένο πελάτη, όπως αριθμός παραγγελιών, συνολικά έξοδα και πιο συχνά αγορασμένα βιβλία.
 *     tags: [Στατιστικά]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Επιτυχής επιστροφή στατιστικών πελάτη
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderCount:
 *                   type: integer
 *                   example: 28
 *                 booksBought:
 *                   type: integer
 *                   example: 95
 *                 totalSpent:
 *                   type: number
 *                   example: 1120.40
 *                 uniqueStores:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "64f1a2b1234567890abcd321"
 *                 mostBoughtBooks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Το Κορίτσι με το Τατουάζ"
 *                       bought:
 *                         type: integer
 *                         example: 5
 *       401:
 *         description: Μη εξουσιοδοτημένος χρήστης
 */

// Στατιστικά πελατών
router.get('/stats/customer', protect, getCustomerStats);
/**
 * @swagger
 * /stats/seller/monthly:
 *   get:
 *     summary: Μηνιαία στατιστικά πωλητή
 *     description: Επιστρέφει συγκεντρωτικά στατιστικά ανά μήνα για τον συνδεδεμένο πωλητή (πωλήσεις, έσοδα, αριθμός παραγγελιών).
 *     tags: [Στατιστικά]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Επιτυχής επιστροφή μηνιαίων στατιστικών πωλητή
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                     example: "2025-06"
 *                   totalRevenue:
 *                     type: number
 *                     example: 2450.50
 *                   booksSold:
 *                     type: integer
 *                     example: 180
 *                   orderCount:
 *                     type: integer
 *                     example: 32
 *       401:
 *         description: Μη εξουσιοδοτημένος χρήστης
 */
// Εξαγωγή στατιστικών ανα μηνα
router.get('/stats/seller/monthly', protect, getMonthlyStatsForSeller);




export default router;