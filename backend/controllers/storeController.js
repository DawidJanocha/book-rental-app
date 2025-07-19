// controllers/storeController.js

import Store from '../models/Store.js'; 


/**
 * @desc  Δημιουργεί νέο κατάστημα για seller
 * @route POST /api/stores
 * @access Private (μόνο Seller)
 */

// φερνει το store 
export const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.user._id });
    if (!store) return res.status(200).json(null); // δεν έχει ακόμα κατάστημα
    res.status(200).json(store);
  } catch (err) {
    res.status(500).json({ message: 'Σφάλμα κατά την αναζήτηση καταστήματος' });
  }
};

// 🎯 Επιστρεφει στοιχεια του καταστηματος στον πελατι 
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('user', 'username');
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// 🎯 Δημιουργία καταστήματος από τον seller
export const createStore = async (req, res) => {
  try {
    const {
      
      storeName,
      afm,
      address,
      postalCode,
      region,
      phone,
      email,
      bookCategories
    } = req.body;

        // 🔐 Από το token (μέσω middleware) παίρνουμε το user._id
    const userId = req.user._id;

    // ✍️ Έλεγχος για υποχρεωτικά πεδία
    if (!storeName || !afm || !address || !postalCode || !region || !phone || !email) {
      return res.status(400).json({ message: 'Λείπουν υποχρεωτικά πεδία' });
    }

    // ✅ Έλεγχος αν ο χρήστης έχει ήδη κατάστημα
    const existingStore = await Store.findOne({ user: userId });
    if (existingStore) {
      return res.status(400).json({ message: 'Έχετε ήδη δημιουργήσει κατάστημα.' });
    }

    // ✅ Δημιουργία νέου καταστήματος
    const newStore = new Store({
      storeName,
      afm,
      address,
      postalCode,
      region,
      phone,
      email,
      user: userId,
      bookCategories,
    });

    await newStore.save();

    
    console.log('📦 Νέο κατάστημα δημιουργήθηκε:', {
      user: userId.toString(),
      storeName,
      afm,
      address,
      postalCode,
      region,
      phone,
      email,
      bookCategories,
    });


    res.status(201).json({ message: '📚 Το κατάστημα δημιουργήθηκε με επιτυχία!', store: newStore });
  } catch (error) {
    console.error('❌ Σφάλμα κατά τη δημιουργία καταστήματος:', error);
    res.status(500).json({ message: 'Σφάλμα κατά τη δημιουργία του καταστήματος.' });
  }
};