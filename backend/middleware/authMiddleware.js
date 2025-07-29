// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Store from '../models/Store.js';

// Επαλήθευση token & αποθήκευση user στο req.user
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '🚫 Δεν υπάρχει token' });
    }
    // Επαλήθευση token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Ανάκτηση user από τη βάση δεδομένων
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) {
      return res.status(401).json({ message: '❌ Ο χρήστης δεν βρέθηκε' });
    }

    req.user = {
      _id: user._id,
      role: user.role,
    };

    // Αν είναι seller, φέρε το storeId
    if (user.role === 'seller') {
      const store = await Store.findOne({ user: user._id }).select('_id');
      if (store) {
        req.user.storeId = store._id;
      } else {
        console.warn('⚠️ Ο χρήστης είναι seller αλλά δεν έχει κατάστημα');
      }
    }

    next();
  } catch (err) {
    console.error('❌ Λάθος token:', err.message);
    return res.status(401).json({ message: '❌ Μη έγκυρο token' });
  }
};

//  Μόνο για seller
export const isSeller = (req, res, next) => {
  if (req.user?.role !== 'seller') {
    return res.status(403).json({ message: '🚫 Πρόσβαση μόνο για sellers' });
  }
  next();
};

//  Μόνο για customer
export const isCustomer = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return res.status(403).json({ message: '🚫 Πρόσβαση μόνο για πελάτες' });
  }
  next();
};


export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Απαγορεύεται. Μόνο admin.' });
  }
};

export default { protect, isSeller, isCustomer };

