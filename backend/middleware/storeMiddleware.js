// middleware/storeMiddleware.js
import Store from '../models/Store.js';

// ΒΡΙΣΚΕΙ ΤΟ ΚΑΤΑΣΤΗΜΑ ΤΟΥ SELLER ΚΑΙ ΤΟ ΠΡΟΣΘΕΤΕΙ ΣΤΟ REQUEST
export const attachStoreToRequest = async (req, res, next) => {
  try {
    // ΑΝΑΖΗΤΑ ΤΟ ΚΑΤΑΣΤΗΜΑ ΜΕ ΒΑΣΗ ΤΟ USER ID ΑΠΟ ΤΟ TOKEN
    const store = await Store.findOne({ user: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'Δεν βρέθηκε κατάστημα για τον χρήστη' });
    }

    // ΠΡΟΣΘΗΚΗ ΤΟΥ ΚΑΤΑΣΤΗΜΑΤΟΣ ΣΤΟ REQUEST ΓΙΑ ΠΡΟΣΒΑΣΗ ΑΠΟ ΤΟΝ CONTROLLER
    req.store = store;
    next();
  } catch (error) {
    // ΔΙΑΧΕΙΡΙΣΗ ΣΦΑΛΜΑΤΟΣ
    res.status(500).json({ message: 'Σφάλμα κατά την εύρεση καταστήματος' });
  }
};