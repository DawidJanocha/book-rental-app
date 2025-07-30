import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/isAdmin.js';
import {getAllUsers, getSystemStats } from '../controllers/adminController.js';
import { getAllBooksDetailed } from '../controllers/adminBookController.js';
import { getAllUsersDetailed } from '../controllers/adminController.js';
import { getPlatformStats } from '../controllers/adminController.js';

const router = express.Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Επιστροφή όλων των χρηστών με πλήρεις λεπτομέρειες
 *     tags: [Διαχειριστής]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Λίστα χρηστών με αναλυτικές πληροφορίες
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetailedUser'
 */

router.get('/users', protect, isAdmin, getAllUsersDetailed);

/**
 * @swagger
 * /admin/books:
 *   get:
 *     summary: Επιστροφή όλων των βιβλίων με στοιχεία πωλήσεων
 *     tags: [Διαχειριστής]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Λίστα βιβλίων με αναλυτικές πληροφορίες πωλήσεων
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetailedBook'
 */

router.get('/books', protect, isAdmin, getAllBooksDetailed);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Λήψη συνολικών στατιστικών συστήματος
 *     tags: [Διαχειριστής]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Συνοπτικά στατιστικά συστήματος
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: integer
 *                   example: 120
 *                 stores:
 *                   type: integer
 *                   example: 15
 *                 orders:
 *                   type: integer
 *                   example: 350
 *                 revenue:
 *                   type: number
 *                   example: 1540.75
 */
router.get('/stats', protect, isAdmin, getSystemStats);

/**
 * @swagger
 * /admin/stats/platform:
 *   get:
 *     summary: Λήψη στατιστικών κερδών πλατφόρμας
 *     tags: [Διαχειριστής]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Φίλτρο ανά περιοχή
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Ημερομηνία έναρξης φίλτρου
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Ημερομηνία λήξης φίλτρου
 *     responses:
 *       200:
 *         description: Στατιστικά πλατφόρμας ανά κατάστημα
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPlatformProfit:
 *                   type: number
 *                   example: 250.50
 *                 percentage:
 *                   type: number
 *                   example: 12
 *                 regionFilter:
 *                   type: string
 *                   example: Αθήνα
 *                 dateFrom:
 *                   type: string
 *                   format: date
 *                   example: 2025-07-01
 *                 dateTo:
 *                   type: string
 *                   format: date
 *                   example: 2025-07-30
 *                 stores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       storeId:
 *                         type: string
 *                         example: 64f1a2b1234567890abcd456
 *                       storeName:
 *                         type: string
 *                         example: Βιβλιοπωλείο Η Γνώση
 *                       region:
 *                         type: string
 *                         example: Αθήνα
 *                       totalIncome:
 *                         type: number
 *                         example: 1000.50
 *                       platformProfit:
 *                         type: number
 *                         example: 120.06
 */
// Προσθήκη νέου endpoint για platform stats
router.get('/stats/platform', protect, isAdmin, getPlatformStats);


// Προσθήκη νέου endpoint για detailed users
router.get('/users-detailed', protect, isAdmin, getAllUsersDetailed);






export default router;
