// middleware/protect.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
// Επαλήθευση token και αποθήκευση χρήστη στο req.user
const protect = async (req, res, next) => {
  let token;

  // Έλεγχος για header Authorization με Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Επαλήθευση του token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Φόρτωση του χρήστη χωρίς τον κωδικό
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (err) {
      console.error('❌ Token verification failed:', err);
      res.status(401).json({ message: 'Μη εξουσιοδοτημένος χρήστης' });
    }
  } else {
    res.status(401).json({ message: 'Δεν υπάρχει token στο αίτημα' });
  }
};

export default protect;
