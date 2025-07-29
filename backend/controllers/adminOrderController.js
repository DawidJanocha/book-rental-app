import Order from '../models/Order.js';
import Store from '../models/Store.js';
import User from '../models/User.js';

// 📦 GET /order/admin/orders/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'store',
        select: 'storeName',
      })
      .populate({
        path: 'customer',
        select: 'username',
      });

    // Μετατροπή του totalPrice από Decimal128 σε Number
    const parsedOrders = orders.map(order => ({
      ...order.toObject(),
      totalPrice: order.totalPrice ? parseFloat(order.totalPrice.toString()) : 0,
    }));

    res.status(200).json(parsedOrders);
  } catch (err) {
    console.error('❌ Σφάλμα στο getAllOrders:', err.message);
    res.status(500).json({ message: 'Σφάλμα κατά τη λήψη όλων των παραγγελιών.' });
  }
};


// ⏳ GET /order/admin/orders/pending
export const getAllPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate({
        path: 'store',
        select: 'storeName',
      })
      .populate({
        path: 'customer',
        select: 'username',
      });

    res.status(200).json(orders);
  } catch (err) {
    console.error('❌ Σφάλμα στο getAllPendingOrders:', err.message);
    res.status(500).json({ message: 'Σφάλμα κατά τη λήψη εκκρεμών παραγγελιών.' });
  }
};
