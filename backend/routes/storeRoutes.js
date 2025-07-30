// routes/storeRoutes.js
import express from 'express';
import { createStore, getMyStore } from '../controllers/storeController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import { getStoreById } from '../controllers/storeController.js';


const router = express.Router();
/**
 * @swagger
 * /store:
 *   post:
 *     summary: Δημιουργία καταστήματος από πωλητή
 *     description: Ο πωλητής δημιουργεί το κατάστημά του με όλα τα απαιτούμενα στοιχεία. Κάθε πωλητής μπορεί να έχει μόνο **ένα** κατάστημα.
 *     tags: [Καταστήματα]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeName
 *               - afm
 *               - address
 *               - postalCode
 *               - region
 *               - phone
 *               - email
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: "Βιβλιοπωλείο Η Γνώση"
 *               afm:
 *                 type: string
 *                 example: "123456789"
 *               address:
 *                 type: string
 *                 example: "Ερμού 12"
 *               postalCode:
 *                 type: string
 *                 example: "10563"
 *               region:
 *                 type: string
 *                 example: "Αθήνα"
 *               phone:
 *                 type: string
 *                 example: "2101234567"
 *               email:
 *                 type: string
 *                 example: "contact@gnosi.gr"
 *               bookCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Λογοτεχνία", "Επιστήμη", "Ιστορία"]
 *     responses:
 *       201:
 *         description: Το κατάστημα δημιουργήθηκε επιτυχώς
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📚 Το κατάστημα δημιουργήθηκε με επιτυχία!"
 *                 store:
 *                   $ref: '#/components/schemas/Store'
 *       400:
 *         description: Σφάλμα δεδομένων ή το κατάστημα υπάρχει ήδη
 *       401:
 *         description: Μη εξουσιοδοτημένος
 */
// Δημιουργία καταστήματος (μόνο για seller)
// Προβολή καταστήματος του seller (μόνο για seller)
router.post('/', protect, isSeller, createStore); 
/**
 * @swagger
 * /store/my:
 *   get:
 *     summary: Επιστροφή καταστήματος του συνδεδεμένου πωλητή
 *     description: Λαμβάνει τα στοιχεία του καταστήματος που ανήκει στον τρέχοντα συνδεδεμένο πωλητή.
 *     tags: [Καταστήματα]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Επιτυχής επιστροφή στοιχείων καταστήματος
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       401:
 *         description: Μη εξουσιοδοτημένος
 *       404:
 *         description: Δεν βρέθηκε κατάστημα
 */

// Προβολή καταστήματος του seller
router.get('/my', protect, isSeller, getMyStore);
/**
 * @swagger
 * /store/{id}:
 *   get:
 *     summary: Δημόσια προβολή στοιχείων καταστήματος
 *     description: Επιστρέφει τα δημόσια στοιχεία ενός καταστήματος με βάση το ID του. Δεν απαιτείται σύνδεση.
 *     tags: [Καταστήματα]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Το ID του καταστήματος
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Επιτυχής επιστροφή στοιχείων καταστήματος
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       404:
 *         description: Δεν βρέθηκε κατάστημα
 */

// Προβολή καταστήματος από ID (δημόσια)
router.get('/:id', getStoreById);



export default router; // ΠΡΟΣΟΧΗ: default export
