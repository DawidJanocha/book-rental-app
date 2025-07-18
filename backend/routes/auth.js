// routes/auth.js
import express from 'express';
import { register, login, verifyEmail, getProfile } from '../controllers/authController.js';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

// Route για εγγραφή
router.post('/register', register);

// Route για Verification Token
router.get('/verify/:token', verifyEmail);

//Route για Verification email
router.get('/verify-email', verifyEmail);

// ✅ Προφίλ χρήστη (με token)
router.get('/profile', protect, getProfile);


// Route για login
router.post('/login', login);

router.get('/test', (req, res) => {
  res.send('✅ API OK from book rental!');
});

export default router;
