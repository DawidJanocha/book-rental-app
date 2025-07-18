// controllers/authController.js  
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';
import { getVerificationEmailHtml } from '../utils/verificationTemplate.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
/**
 * @desc Εγγραφή νέου χρήστη (customer ή seller)
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Λείπουν απαιτούμενα πεδία' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Ο χρήστης υπάρχει ήδη' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    });

    await newUser.save();

    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
    const html = getVerificationEmailHtml(username, verificationUrl);

    await sendEmail({
      to: newUser.email,
      subject: '📧 Επιβεβαίωση Email',
      html,
    });

    res.status(201).json({
      message: '✅ Εγγραφή επιτυχής. Έχει σταλεί email επιβεβαίωσης.',
    });
  } catch (err) {
    console.error('❌ Σφάλμα κατά την εγγραφή:', err);
    res.status(500).json({ message: '❌ Σφάλμα στον server' });
  }
};

export const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(200).json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    verified: req.user.verified,
  });
});




/**
 * @desc Επιβεβαίωση email χρήστη
 * @route GET /api/auth/verify-email?token=...
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Μη έγκυρο token' });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Το token δεν είναι έγκυρο ή έχει ήδη χρησιμοποιηθεί' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: '✅ Το email επιβεβαιώθηκε με επιτυχία' });
  } catch (err) {
    console.error('❌ Σφάλμα επιβεβαίωσης email:', err);
    res.status(400).json({ message: '❌ Σφάλμα κατά την επιβεβαίωση email' });
  }
};

/**
 * @desc Σύνδεση χρήστη (customer ή seller)
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Ο χρήστης δεν βρέθηκε' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Λανθασμένος κωδικός' });
    }

    // Προαιρετικά: μπλοκάρεις login αν δεν είναι verified
    // if (!user.isVerified) {
    //   return res.status(403).json({ message: 'Το email δεν έχει επιβεβαιωθεί' });
    // }

    // Π.χ. login
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);


    console.log(`🔐 Σύνδεση χρήστη: ${user.username} | Ρόλος: ${user.role} | Email: ${user.email}`);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Σφάλμα login:', err);
    return res.status(500).json({
      message: 'Σφάλμα διακομιστή κατά το login',
    });
  }
};
