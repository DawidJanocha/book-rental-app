// controllers/salesController.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Store from '../models/Store.js'; // ✅ import για εύρεση store

//Στατιστικά πωλήσεων seller
export const getSalesStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    //Εύρεση του store που ανήκει στον seller
    const store = await Store.findOne({ user: sellerId });
    if (!store) {
      console.error('Δεν βρέθηκε κατάστημα για τον χρήστη:', sellerId);
      return res.status(400).json({ message: 'Δεν βρέθηκε κατάστημα για τον χρήστη' });
    }

    const objectStoreId = new mongoose.Types.ObjectId(store._id);
  
    // Χρήση aggregation για στατιστικά πωλήσεων
    const stats = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.storeId': objectStoreId } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Επιστροφή των στατιστικών
    const totalSales = stats[0]?.totalSales || 0;
    const totalOrders = stats[0]?.totalOrders || 0;

    res.json({ totalSales, totalOrders });
  } catch (err) {
    console.error('❌ Σφάλμα στα στατιστικά πωλήσεων:', err.message);
    res.status(500).json({ message: 'Σφάλμα στα στατιστικά πωλήσεων' });
  }
};
