// controllers/authController.js

// ΕΙΣΑΓΩΓΗ ΜΟΝΤΕΛΩΝ ΚΑΙ ΒΟΗΘΗΤΙΚΩΝ ΕΡΓΑΛΕΙΩΝ
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
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
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    });

    // ΔΗΜΙΟΥΡΓΙΑ ΚΑΙ ΑΠΟΣΤΟΛΗ EMAIL ΕΠΙΒΕΒΑΙΩΣΗΣ
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;
    const html = getVerificationEmailHtml(username, verificationUrl);

    await sendEmail({ to: newUser.email, subject: 'Επιβεβαίωση Email', html });

    // ΑΠΟΚΡΙΣΗ ΣΤΟ FRONTEND
    res.status(201).json({ message: 'Εγγραφή επιτυχής. Έχει σταλεί email επιβεβαίωσης.' });
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
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    verified: req.user.isVerified,
  });
});

// ΕΠΙΒΕΒΑΙΩΣΗ EMAIL ΧΡΗΣΤΗ
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Μη έγκυρο token' });
    }

    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Το token δεν είναι έγκυρο ή έχει ήδη χρησιμοποιηθεί' });
    }
    if (user.isVerified) {
      return res.status(200).json({ message: 'Ο λογαριασμός έχει ήδη επιβεβαιωθεί' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Το email επιβεβαιώθηκε με επιτυχία' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης email:', err);
    res.status(400).json({ message: 'Σφάλμα κατά την επιβεβαίωση email' });
  }
});

// ΣΥΝΔΕΣΗ ΧΡΗΣΤΗ (CUSTOMER, SELLER Η ADMIN)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ΕΥΡΕΣΗ ΧΡΗΣΤΗ ΜΕ ΒΑΣΗ EMAIL
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Ο χρήστης δεν βρέθηκε' });
    }

    // ✅ ΠΑΡΑΚΑΜΨΗ ΕΠΙΒΕΒΑΙΩΣΗΣ EMAIL ΜΟΝΟ ΓΙΑ ADMIN
    if (user.role !== 'admin' && !user.isVerified) {
      return res.status(403).json({ message: 'Ο λογαριασμός δεν έχει επιβεβαιωθεί μέσω email' });
    }

    // ΕΛΕΓΧΟΣ ΚΩΔΙΚΟΥ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Λανθασμένος κωδικός' });
    }

    // ✅ Ενημέρωση lastLogin
    user.lastLogin = new Date();
    await user.save();

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
        lastLogin: user.lastLogin, // optional: στείλτο στο frontend αν το χρειάζεσαι άμεσα
      },
    });
  } catch (err) {
    console.error('Σφάλμα login:', err);
    return res.status(500).json({
      message: 'Σφάλμα διακομιστή κατά το login',
    });
  }
};
// ------------------------------
// ΣΥΝΑΡΤΗΣΕΙΣ ΕΠΑΝΑΦΟΡΑΣ ΚΩΔΙΚΟΥ
// ------------------------------



export const passwordResend = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email απαιτείται' });

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond the same to avoid enumeration
  if (!user) {
    return res.status(200).json({ message: 'Αν υπάρχει ο λογαριασμός, θα λάβεις σύνδεσμο επαναφοράς.' });
  }

  // Invalidate previous unused tokens
  await PasswordResetToken.updateMany(
    { userId: user._id, used: false },
    { used: true }
  );

  // Generate and hash token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresInMs = 1000 * 60 * 60; // 1 hour

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + expiresInMs),
  });

const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const resetUrl = `${frontend}/password-reset?token=${encodeURIComponent(rawToken)}&userId=${user._id}`;

  const emailHtml = `
    <p>Γεια σου ${user.username},</p>
    <p>Ζητήθηκε επαναφορά κωδικού. Κάνε κλικ στον παρακάτω σύνδεσμο για να τον αλλάξεις. Ο σύνδεσμος λήγει σε 1 ώρα.</p>
    <p><a href="${resetUrl}">Επαναφορά Κωδικού</a></p>
    <p>Αν δεν το ζήτησες εσύ, αγνόησε αυτό το email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Επαναφορά κωδικού - E-Book Platform',
    html: emailHtml
  });

  return res.status(200).json({ message: 'Αν υπάρχει ο λογαριασμός, θα λάβεις σύνδεσμο επαναφοράς.' });
});



//2
// ) Τελική υποβολή νέου κωδικού
// POST /auth/resetPassword
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, userId } = req.body;
  if (!token || !newPassword || !userId) {
    return res.status(400).json({ message: 'Λείπουν δεδομένα' });
  }

  const record = await PasswordResetToken.findOne({ userId, used: false });
  if (!record || record.isExpired()) {
    return res.status(400).json({ message: 'Μη έγκυρο ή ληγμένο token' });
  }

  const incomingHash = crypto.createHash('sha256').update(token).digest('hex');
  if (incomingHash !== record.tokenHash) {
    return res.status(400).json({ message: 'Μη έγκυρο token' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'Χρήστης δεν βρέθηκε' });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  record.used = true;
  await record.save();

  await sendEmail({
    to: user.email,
    subject: 'Ο κωδικός άλλαξε',
    html: `<p>Γεια σου ${user.username},</p><p>Ο κωδικός σου άλλαξε επιτυχώς. Αν δεν το έκανες εσύ, επικοινώνησε με υποστήριξη.</p>`
  });

  return res.json({ message: 'Ο κωδικός ενημερώθηκε επιτυχώς' });
});





