import User from '../models/User.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
import UserDetails from '../models/UserDetails.js';
import { get } from 'mongoose';


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -__v') // παίρνουμε όλους χωρίς password/metadata
    const userDetails = await UserDetails.find({});
    console.log('📦 Απόκριση από getAllUsers:', users)
    console.log('📦 Απόκριση από UserDetails:', userDetails);
    const detailedUsers = users.map(user => {
      const details = userDetails.find(detail => detail.user.toString() === user._id.toString());
      return {
        ...user.toObject(),
        ...details ? details.toObject() : {}
      };
    });
    res.status(200).json({ detailedUsers });
  } catch (error) {
    console.error('❌ Σφάλμα στο getAllUsers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      users: totalUsers,
      stores: totalStores,
      orders: totalOrders,
      revenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('❌ getSystemStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const getAllBooksDetailed = async (req, res) => {
  try {
    const books = await Book.find({}).populate('storeName');

    const detailedBooks = await Promise.all(
      books.map(async (book) => {
        let totalSales = 0;
        const salesDetails = [];

        const orders = await Order.find({
          'items.bookId': book._id,
        }).populate('customer');

        orders.forEach((order) => {
          order.items.forEach((item) => {
            if (item.bookId.toString() === book._id.toString()) {
              totalSales += item.quantity;

              // ✅ Έλεγχος αν υπάρχει πελάτης
              if (order.customer) {
                salesDetails.push({
                  customerName: order.customer.username || 'Χωρίς όνομα',
                  customerEmail: order.customer.email || 'Χωρίς email',
                  quantity: item.quantity,
                  purchasedAt: order.createdAt,
                });
              }
            }
          });
        });

        return {
          _id: book._id,
          title: book.title,
          createdAt: book.createdAt,
          storeName: book.store?.storeName || 'Άγνωστο',
          storeEmail: book.store?.email || 'Χωρίς email',
          rentalPrice: book.rentalPrice,
          available: book.available,
          totalSales,
          salesDetails,
        };
      })
    );

    res.json(detailedBooks);
  } catch (error) {
    console.error('getAllBooksDetailed error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση βιβλίων' });
  }
};




export const getAllUsersDetailed = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const detailedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'customer') {
          const userDetails = await UserDetails.findOne({user : user._id})
          return {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            userDetails: userDetails
          };
        }

        if (user.role === 'seller') {
          const store = await Store.findOne({ user: user._id });

          const orders = await Order.find({ store: store?._id });
          const totalSales = orders.filter(o => o.status === 'confirmed').length;
          const totalCanceled = orders.filter(o => o.status === 'declined').length;
          const totalPending = orders.filter(o => o.status === 'pending').length;
          const totalRevenue = orders.reduce((acc, cur) => {
            if (cur.status === 'confirmed') {
              acc += parseFloat(cur.totalPrice?.toString() || 0);
            }
            return acc;
          }, 0);

          return {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            store: {
              storeName: store?.storeName || '',
              address: store?.address || '',
              postalCode: store?.postalCode || '',
              region: store?.region || '',
              phone: store?.phone || '',
              email: store?.email || '',
              createdAt: store?.createdAt,
              stats: {
                totalSales,
                totalCanceled,
                totalPending,
                totalRevenue,
              }
            },
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
          };
        }

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        };
      })
    );

    res.status(200).json(detailedUsers);
  } catch (error) {
    console.error('getAllUsersDetailed error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση χρηστών.' });
  }
};



export const getPlatformStats = async (req, res) => {
  try {
    const platformPercentage = 0.12;
    const { region, from, to } = req.query;

    // Βρες όλα τα καταστήματα (με φίλτρο περιοχής αν υπάρχει)
    const storeFilter = region ? { region } : {};
    const stores = await Store.find(storeFilter);

    let totalPlatformProfit = 0;
    const storeStats = [];

    for (const store of stores) {
      // Φτιάχνουμε φίλτρο για παραγγελίες του καταστήματος
      const orderFilter = { store: store._id, status: { $ne: 'declined' } };

      if (from || to) {
        orderFilter.createdAt = {};
        if (from) orderFilter.createdAt.$gte = new Date(from);
        if (to) orderFilter.createdAt.$lte = new Date(to);
      }

      const orders = await Order.find(orderFilter);

      let totalIncome = 0;
      for (const order of orders) {
        if (order.totalPrice) {
          totalIncome += parseFloat(order.totalPrice.toString());
        }
      }

      const platformProfit = parseFloat((totalIncome * platformPercentage).toFixed(2));
      totalPlatformProfit += platformProfit;

      storeStats.push({
        storeId: store._id,
        storeName: store.storeName,
        region: store.region,
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        platformProfit,
      });
    }

    res.json({
      totalPlatformProfit: parseFloat(totalPlatformProfit.toFixed(2)),
      percentage: platformPercentage * 100,
      regionFilter: region || null,
      dateFrom: from || null,
      dateTo: to || null,
      stores: storeStats,
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά τον υπολογισμό στατιστικών πλατφόρμας' });
  }
};





export default {
  getAllUsers, getSystemStats,getAllBooksDetailed
};
