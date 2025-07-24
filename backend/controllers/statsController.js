// ✅ controllers/statsController.js

import Order from '../models/Order.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import UserDetails from '../models/UserDetails.js';

export const getSellerStats = async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.user._id });
    if (!store) return res.status(404).json({ message: 'Δεν βρέθηκε κατάστημα' });

    const orders = await Order.find({ store: store._id }).sort({ createdAt: -1 });

    const orderCount = orders.length;
    let booksSold = 0;
    let totalRevenue = 0;

    const customerSet = new Set();
    const bookMap = {};
    const dailyRevenue = {};
    let lastOrder = null;

    for (const order of orders) {
      totalRevenue += parseFloat(order.totalPrice?.toString() || '0');

      // ✏️ Υπολογισμός πωλήσεων ανά προϊόν
      for (const item of order.items) {
        booksSold += item.quantity;
        bookMap[item.title] = (bookMap[item.title] || 0) + item.quantity;
      }

      // ✏️ Έσοδα ανά ημέρα
      const date = new Date(order.createdAt).toLocaleDateString('el-GR');
      dailyRevenue[date] = (dailyRevenue[date] || 0) + parseFloat(order.totalPrice);

      customerSet.add(order.customer.toString());
    }

    // 🔟 Best Sellers
    const bestSellers = Object.entries(bookMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([title, sold]) => ({ title, sold }));

    // 📊 Έσοδα ανά ημέρα
    const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2)),
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 🧾 Τελευταία αποδεκτή παραγγελία
    const acceptedOrders = orders.filter(o => o.status === 'confirmed');
    if (acceptedOrders.length > 0) {
      const recent = acceptedOrders[0];
      console.log('Τελευταία αποδεκτή παραγγελία:', recent);
      lastOrder = {
        createdAt: recent.createdAt,
        totalPrice: recent.totalPrice ? Number(recent.totalPrice.toString()).toFixed(2) : '0.00',
        productName: recent.items[0]?.title || '(χωρίς προϊόν)',
      };
      console.log('Τελευταία αποδεκτή παραγγελία:', lastOrder);
    }

    // 💰 Top 10 Orders by TotalPrice
    const topOrders = [...acceptedOrders]
      .sort((a, b) => b.totalPrice - a.totalPrice)
      .slice(0, 10)
      .map(o => ({
        _id: o._id,
        customer: o.customer,
        totalPrice: Number(o.totalPrice.toString()).toFixed(2),
        items: o.items,
        createdAt: o.createdAt,
      }));

    // 👤 Πελάτες
    const customersRaw = await User.find({ _id: { $in: [...customerSet] } })
      .select('_id username email')
      .lean();

    const detailsRaw = await UserDetails.find({ user: { $in: [...customerSet] } })
      .select('user region phone street postalCode doorbell firstName lastName')
      .lean();

    const customers = customersRaw.map(user => {
      const detail = detailsRaw.find(d => d.user.toString() === user._id.toString());
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: detail?.phone || '',
        region: detail?.region || '',
        street: detail?.street || '',
        postalCode: detail?.postalCode || '',
        doorbell: detail?.doorbell || '',
        firstName: detail?.firstName || '',
        lastName: detail?.lastName || '',
      };
    });

    res.json({
      orderCount,
      booksSold,
      totalRevenue: totalRevenue.toFixed(2),
      bestSellers,
      customers,
      dailyRevenue: dailyRevenueArray,
      lastOrder: lastOrder || null, 
      topOrders,
    });
  } catch (err) {
    console.error('❌ Σφάλμα στατιστικών (seller):', err);
    res.status(500).json({ message: 'Σφάλμα εξυπηρέτησης' });
  }
};


// ΣΤΑΤΙΣΤΙΚΑ ΓΙΑ CUSTOMER
export const getCustomerStats = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id });

    const orderCount = orders.length;
    let booksBought = 0;
    let totalSpent = 0;
    const storeSet = new Set();
    const bookMap = {};

    for (const order of orders) {
    totalRevenue += parseFloat(order.totalPrice?.toString() || '0');
      
      for (const item of order.items) {
        booksBought += item.quantity;
        bookMap[item.title] = (bookMap[item.title] || 0) + item.quantity;
      }
      storeSet.add(order.store.toString());
    }

    const mostBoughtBooks = Object.entries(bookMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 most bought books .SLICE
      .map(([title, bought]) => ({ title, bought }));

    res.json({
      orderCount,
      booksBought,
      totalSpent: totalSpent.toFixed(2),
      uniqueStores: [...storeSet],
      mostBoughtBooks,
    });
  } catch (err) {
    console.error('Σφάλμα στατιστικών (customer):', err);
    res.status(500).json({ message: 'Σφάλμα εξυπηρέτησης' });
  }
};


// μηνιαία στατιστικά για seller
export const getMonthlyStatsForSeller = async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.user._id });
    if (!store) return res.status(404).json({ message: 'Κατάστημα δεν βρέθηκε' });

    const stats = await Order.aggregate([
      { $match: { store: store._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalPrice' },
          booksSold: { $sum: { $sum: '$items.quantity' } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json(stats);
  } catch (err) {
    console.error('Σφάλμα μηνιαίων στατιστικών:', err);
    res.status(500).json({ message: 'Σφάλμα εξυπηρέτησης' });
  }
};
