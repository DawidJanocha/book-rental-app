// controllers/salesController.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Store from '../models/Store.js'; // ✅ import για εύρεση store

// 📈 GET /api/sales/stats - Στατιστικά πωλήσεων seller
export const getSalesStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 🔍 Εύρεση του store που ανήκει στον seller
    const store = await Store.findOne({ user: sellerId });
    if (!store) {
      console.log('❌ Δεν βρέθηκε κατάστημα για τον χρήστη');
      return res.status(400).json({ message: 'Δεν βρέθηκε κατάστημα για τον χρήστη' });
    }

    const objectStoreId = new mongoose.Types.ObjectId(store._id);
    console.log('📦 Αναζήτηση πωλήσεων για storeId:', objectStoreId);

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

    console.log('📊 Αποτελέσματα aggregation:', stats);

    const totalSales = stats[0]?.totalSales || 0;
    const totalOrders = stats[0]?.totalOrders || 0;

    res.json({ totalSales, totalOrders });
  } catch (err) {
    console.error('❌ Σφάλμα στα στατιστικά πωλήσεων:', err.message);
    res.status(500).json({ message: 'Σφάλμα στα στατιστικά πωλήσεων' });
  }
};
