// middleware/storeMiddleware.js
import Store from '../models/Store.js';

export const attachStoreToRequest = async (req, res, next) => {
  try {
    const store = await Store.findOne({ user: req.user._id });

    if (!store) {
      console.log('❌ Δεν βρέθηκε store για τον χρήστη με ID:', req.user._id);
      return res.status(400).json({ message: 'Δεν βρέθηκε κατάστημα για τον χρήστη' });
    }

    console.log('📦 Middleware: Store ID του seller:', store._id);
    req.store = store;
    next();
  } catch (error) {
    console.error('❌ Σφάλμα στο storeMiddleware:', error.message);
    res.status(500).json({ message: 'Σφάλμα κατά την εύρεση καταστήματος' });
  }
};
