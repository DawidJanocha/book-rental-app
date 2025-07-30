

import express from 'express';
import { handleSupportRequest } from '../controllers/supportController.js';
const router = express.Router();
/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Αποστολή αιτήματος υποστήριξης ή μηνύματος επικοινωνίας
 *     description: Ο χρήστης μπορεί να στείλει μήνυμα επικοινωνίας στην υποστήριξη. Το μήνυμα αποστέλλεται και στον διαχειριστή, αλλά και αντίγραφο στον αποστολέα.
 *     tags: [Επικοινωνία]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Γιάννης Παπαδόπουλος
 *               email:
 *                 type: string
 *                 example: giannis@example.com
 *               message:
 *                 type: string
 *                 example: Καλησπέρα, θα ήθελα πληροφορίες για την παραγγελία μου.
 *     responses:
 *       200:
 *         description: Το μήνυμα στάλθηκε με επιτυχία
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Το μήνυμά σας εστάλη με επιτυχία.
 *       400:
 *         description: Ελλιπή ή μη έγκυρα δεδομένα
 *       500:
 *         description: Σφάλμα κατά την αποστολή του μηνύματος
 */
router.post('/', handleSupportRequest);

export default router;
