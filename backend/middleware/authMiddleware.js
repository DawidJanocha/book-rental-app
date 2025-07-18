// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 🔐 Επαλήθευση token & αποθήκευση user στο req.user
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '🚫 Δεν υπάρχει token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Αποθήκευση ρόλου & ID απευθείας από το token
    req.user = {
      _id: decoded.id || decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error('❌ Λάθος token:', err.message);
    return res.status(401).json({ message: '❌ Μη έγκυρο token' });
  }
};

// ✅ Μόνο για seller
export const isSeller = (req, res, next) => {
  if (req.user?.role !== 'seller') {
    return res.status(403).json({ message: '🚫 Πρόσβαση μόνο για sellers' });
  }
  next();
};

// ✅ Μόνο για customer
export const isCustomer = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ message: '🚫 Πρόσβαση μόνο για πελάτες' });
  }
  next();
};

export default { protect, isSeller, isCustomer };
