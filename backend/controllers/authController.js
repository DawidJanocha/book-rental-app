// controllers/authController.js  

// ΕΙΣΑΓΩΓΗ ΜΟΝΤΕΛΩΝ ΚΑΙ ΒΟΗΘΗΤΙΚΩΝ ΕΡΓΑΛΕΙΩΝ
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';
import { getVerificationEmailHtml } from '../utils/verificationTemplate.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

// ΕΓΓΡΑΦΗ ΝΕΟΥ ΧΡΗΣΤΗ (CUSTOMER Η SELLER)
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // ΕΛΕΓΧΟΣ ΓΙΑ ΑΠΑΡΑΙΤΗΤΑ ΠΕΔΙΑ
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Λείπουν απαιτούμενα πεδία' });
    }

    // ΕΛΕΓΧΟΣ ΑΝ ΥΠΑΡΧΕΙ ΗΔΗ ΧΡΗΣΤΗΣ ΜΕ ΤΟ ΙΔΙΟ EMAIL
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Ο χρήστης υπάρχει ήδη' });
    }

    // ΚΡΥΠΤΟΓΡΑΦΗΣΗ ΚΩΔΙΚΟΥ
    const hashedPassword = await bcrypt.hash(password, 10);

    // ΔΗΜΙΟΥΡΓΙΑ TOKEN ΓΙΑ ΕΠΙΒΕΒΑΙΩΣΗ EMAIL
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // ΔΗΜΙΟΥΡΓΙΑ ΝΕΟΥ ΧΡΗΣΤΗ
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    });

    await newUser.save();

    // ΔΗΜΙΟΥΡΓΙΑ ΚΑΙ ΑΠΟΣΤΟΛΗ EMAIL ΕΠΙΒΕΒΑΙΩΣΗΣ
    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
    const html = getVerificationEmailHtml(username, verificationUrl);

    await sendEmail({
      to: newUser.email,
      subject: 'Επιβεβαίωση Email',
      html,
    });

    // ΑΠΟΚΡΙΣΗ ΣΤΟ FRONTEND
    res.status(201).json({
      message: 'Εγγραφή επιτυχής. Έχει σταλεί email επιβεβαίωσης.',
    });
  } catch (err) {
    console.error('Σφάλμα κατά την εγγραφή:', err);
    res.status(500).json({ message: 'Σφάλμα στον server' });
  }
};

// ΠΡΟΒΟΛΗ ΠΡΟΦΙΛ ΧΡΗΣΤΗ (ΜΕΤΑ ΑΠΟ LOGIN)
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

// ΕΠΙΒΕΒΑΙΩΣΗ EMAIL ΧΡΗΣΤΗ
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

    // ΕΠΙΒΕΒΑΙΩΣΗ ΧΡΗΣΤΗ
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Το email επιβεβαιώθηκε με επιτυχία' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης email:', err);
    res.status(400).json({ message: 'Σφάλμα κατά την επιβεβαίωση email' });
  }
};

// ΣΥΝΔΕΣΗ ΧΡΗΣΤΗ (CUSTOMER Η SELLER)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ΕΥΡΕΣΗ ΧΡΗΣΤΗ ΜΕ ΒΑΣΗ EMAIL
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Ο χρήστης δεν βρέθηκε' });
    }

    // ΕΛΕΓΧΟΣ ΚΩΔΙΚΟΥ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Λανθασμένος κωδικός' });
    }

    // ΠΡΟΑΙΡΕΤΙΚΟΣ ΕΛΕΓΧΟΣ ΕΠΙΒΕΒΑΙΩΣΗΣ EMAIL
    // if (!user.isVerified) {
    //   return res.status(403).json({ message: 'Το email δεν έχει επιβεβαιωθεί' });
    // }

    // ΔΗΜΙΟΥΡΓΙΑ JWT TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );  

    console.log(`🔐 Σύνδεση χρήστη: ${user.username} | Ρόλος: ${user.role} | Email: ${user.email}`);

    // ΕΠΙΣΤΡΟΦΗ ΣΤΟ FRONTEND
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Σφάλμα login:', err);
    return res.status(500).json({
      message: 'Σφάλμα διακομιστή κατά το login',
    });
  }
};



