// routes/auth.js
import express from 'express';
import { register, login, verifyEmail, getProfile } from '../controllers/authController.js';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Εγγραφή νέου χρήστη (Customer ή Seller)
 *     tags: [Αυθεντικοποίηση]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mySecurePass123
 *               role:
 *                 type: string
 *                 enum: [customer, seller]
 *                 example: customer
 *     responses:
 *       201:
 *         description: Εγγραφή επιτυχής - Έχει σταλεί email επιβεβαίωσης
 *       400:
 *         description: Σφάλμα εισαγωγής ή χρήστης υπάρχει ήδη
 */
// Route για εγγραφή
router.post('/register', register);
/**
 * @swagger
 * /auth/verify/{token}:
 *   get:
 *     summary: Επιβεβαίωση email μέσω token στη διαδρομή
 *     tags: [Αυθεντικοποίηση]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token επιβεβαίωσης email
 *     responses:
 *       200:
 *         description: Επιτυχής επιβεβαίωση email
 *       404:
 *         description: Token δεν βρέθηκε ή έχει λήξει
 */
// Route για Verification Token
router.get('/verify/:token', verifyEmail);
/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Επιβεβαίωση email χρήστη μέσω token
 *     tags: [Αυθεντικοποίηση]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token επιβεβαίωσης email
 *     responses:
 *       200:
 *         description: Επιτυχής επιβεβαίωση email
 *       400:
 *         description: Token λείπει ή είναι μη έγκυρο
 */
//Route για Verification email
router.get('/verify-email', async (req, res) => {
 const { token } = req.query;
  

  if (!token) {
    return res.status(400).json({ message: 'Missing verification token' });
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // optional
    await user.save();

    // ✅ Redirect to frontend after success
    return res.redirect('http://localhost:3000/?loginModal=open');
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Λήψη στοιχείων προφίλ του συνδεδεμένου χρήστη
 *     tags: [Αυθεντικοποίηση]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Στοιχεία χρήστη που έχει συνδεθεί
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Μη εξουσιοδοτημένος - Απαιτείται token
 */
// Προφίλ χρήστη (με token)
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Σύνδεση χρήστη (Customer, Seller ή Admin)
 *     tags: [Αυθεντικοποίηση]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mySecurePass123
 *     responses:
 *       200:
 *         description: Επιτυχής σύνδεση - Επιστροφή JWT token και στοιχείων χρήστη
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Μη εξουσιοδοτημένος - Λανθασμένα στοιχεία
 */
// Route για login
router.post('/login', login);

/**
 * @swagger
 * /auth/test:
 *   get:
 *     summary: Έλεγχος λειτουργίας API Auth
 *     tags: [Αυθεντικοποίηση]
 *     responses:
 *       200:
 *         description: ✅ API λειτουργεί σωστά
 */
router.get('/test', (req, res) => {
  res.send('✅ API OK from book rental!');
});

export default router;
