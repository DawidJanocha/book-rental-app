// src/controllers/salesController.js
import Order from '../models/Order.js';  // Μοντέλο Order

export const getSalesStats = async (req, res) => {
  try {
    const storeId = req.user.storeId;  // Παίρνουμε το storeId από το token
    const stats = await Order.aggregate([
      { $match: { 'items.storeId': storeId } },  // Φιλτράρισμα μόνο για τα προϊόντα του συγκεκριμένου καταστήματος
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },  // Υπολογισμός του συνολικού ποσού πωλήσεων
          totalOrders: { $sum: 1 },  // Υπολογισμός του συνολικού αριθμού παραγγελιών
        }
      }
    ]);

    res.status(200).json(stats[0] || { totalSales: 0, totalOrders: 0 });
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση των στατιστικών πωλήσεων:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση των στατιστικών πωλήσεων' });
  }
};
