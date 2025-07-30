// routes/user.js
import express from 'express';
import {
  saveUserDetails,
  getUserDetails,
  changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';



const router = express.Router();

/**
 * @swagger
 * /user/details:
 *   post:
 *     summary: Αποθήκευση ή ενημέρωση στοιχείων χρήστη
 *     description: Ο συνδεδεμένος χρήστης μπορεί να αποθηκεύσει ή να ενημερώσει τα προσωπικά του στοιχεία (διεύθυνση, τηλέφωνο, κ.λπ.).
 *     tags: [Χρήστης]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - street
 *               - region
 *               - postalCode
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Γιάννης
 *               lastName:
 *                 type: string
 *                 example: Παπαδόπουλος
 *               street:
 *                 type: string
 *                 example: Ερμού 12
 *               region:
 *                 type: string
 *                 example: Αθήνα
 *               postalCode:
 *                 type: string
 *                 example: 10563
 *               phone:
 *                 type: string
 *                 example: 2101234567
 *               floor:
 *                 type: string
 *                 example: 2ος
 *               doorbell:
 *                 type: string
 *                 example: Παπαδόπουλος
 *     responses:
 *       200:
 *         description: Τα στοιχεία αποθηκεύτηκαν επιτυχώς
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetails'
 *       400:
 *         description: Μη έγκυρα δεδομένα
 *       401:
 *         description: Μη εξουσιοδοτημένος
 */
// Αποθήκευση / ενημέρωση στοιχείων χρήστη
router.post('/details', protect, saveUserDetails);
/**
 * @swagger
 * /user/details:
 *   get:
 *     summary: Ανάκτηση στοιχείων χρήστη
 *     description: Επιστρέφει τα αποθηκευμένα προσωπικά στοιχεία του συνδεδεμένου χρήστη.
 *     tags: [Χρήστης]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Στοιχεία χρήστη
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetails'
 *       401:
 *         description: Μη εξουσιοδοτημένος
 *       404:
 *         description: Δεν βρέθηκαν αποθηκευμένα στοιχεία
 */
// Ανάκτηση στοιχείων χρήστη
router.get('/details', protect, getUserDetails);

/**
 * @swagger
 * /user/password:
 *   put:
 *     summary: Αλλαγή κωδικού πρόσβασης
 *     description: Ο χρήστης μπορεί να αλλάξει τον κωδικό πρόσβασής του παρέχοντας τον τρέχοντα και τον νέο κωδικό.
 *     tags: [Χρήστης]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: myOldPass123
 *               newPassword:
 *                 type: string
 *                 example: myNewSecurePass456
 *     responses:
 *       200:
 *         description: Ο κωδικός άλλαξε επιτυχώς
 *       400:
 *         description: Λανθασμένα στοιχεία ή μη έγκυρος νέος κωδικός
 *       401:
 *         description: Μη εξουσιοδοτημένος
 */
// Αλλαγή κωδικού πρόσβασης
router.put('/password', protect, changePassword);

export default router;
