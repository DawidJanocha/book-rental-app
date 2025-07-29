// routes/auth.js
import express from 'express';
import { register, login, verifyEmail, getProfile } from '../controllers/authController.js';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

// Route για εγγραφή
router.post('/register', register);

// Route για Verification Token
router.get('/verify/:token', verifyEmail);

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

// Προφίλ χρήστη (με token)
router.get('/profile', protect, getProfile);


// Route για login
router.post('/login', login);

router.get('/test', (req, res) => {
  res.send('✅ API OK from book rental!');
});

export default router;
