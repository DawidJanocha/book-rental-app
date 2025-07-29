// routes/order.js
import express from 'express';
import isAdmin from '../middleware/isAdmin.js';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import sendOrderEmailToSeller from '../utils/sendOrderEmailToSeller.js';
import sendOrderEmailToCustomer from '../utils/sendOrderEmailToCustomer.js';
import { completeOrder, getMyOrders } from '../controllers/cartController.js';
import { confirmOrderBySeller , denyOrderBySeller } from '../controllers/orderController.js';
import { isSeller, isCustomer } from '../middleware/authMiddleware.js';
import { getSellerOrders } from '../controllers/orderController.js';
import sendDeclinedOrderEmailToCustomer from '../utils/sendDeclinedOrderEmailToCustomer.js';
import { getOrderHistory } from '../controllers/orderController.js';
import { getAllPendingOrders, getAllOrders } from '../controllers/adminOrderController.js';
const router = express.Router();
router.get('/admin/orders/pending', protect, isAdmin, getAllPendingOrders);
router.get('/admin/orders/all', protect, isAdmin, getAllOrders);
//  Δημιουργία παραγγελίας από πελάτη
router.post('/complete', protect, isCustomer ,completeOrder, async (req, res) => {
  try {
    const { items, totalPrice, storeId, customerNote } = req.body;
    const customerId = req.user._id;
    //  Ομαδοποίηση items ανά κατάστημα
    const itemsByStore = {};
    items.forEach(item => {
     
      // Αν το κατάστημα δεν υπάρχει, το δημιουργούμε
      if (!itemsByStore[item.bookId.store._id]) itemsByStore[item.bookId.store._id] = [];
      itemsByStore[item.store].push(item);
    });
    const orderResults = [];

    //  Για κάθε κατάστημα, δημιουργούμε παραγγελία και στέλνουμε email
    for (const storeId of Object.keys(itemsByStore)) {
      const store = await Store.findById(storeId);
      if (!store) continue;
      //  Εύρεση του χρήστη του καταστήματος
      const sellerUser = await User.findById(store.user);
      if (!sellerUser) continue;
      //  Δημιουργία παραγγελίας
      const storeItems = itemsByStore[storeId];

      //  Υπολογισμός συνολικής τιμής για το κατάστημα
      const storeTotal = storeItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);
    //  Δημιουργία παραγγελίας
    const newOrder = await Order.create({
        customer: customerId,
        store: storeId,
        items: storeItems.map(i => ({
          bookId: i.bookId,
          quantity: i.quantity,
          price: Number(i.price),
          title: i.title,
        })),
        totalPrice: storeTotal,
        comments: customerNote || '',
      });

      await sendOrderEmailToSeller(partnerUser.email, {
        storeName: store.storeName,
        items: storeItems,
        totalPrice: storeTotal,
        customerInfo: req.user,
        orderId: newOrder._id,
        createdAt: newOrder.createdAt,
        note: customerNote || '',
      });

      orderResults.push({ orderId: newOrder._id, store: store.storeName });
    }

    res.status(201).json({ message: 'Οι παραγγελίες καταχωρήθηκαν', orders: orderResults });
  } catch (err) {
    console.error('Σφάλμα κατά τη δημιουργία παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την καταχώρηση παραγγελίας' });
  }
});
//  Προβολή παραγγελιών του πελάτη ή του seller
router.get('/', protect, async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'seller') {
      const store = await Store.findOne({ user: req.user._id });
      if (!store) return res.status(404).json({ message: 'Δεν βρέθηκε κατάστημα' });
      query.store = store._id;
    } else {
      return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε παραγγελίες' });
    }

    // φίλτρο createdAt μόνο αν υπάρχει τουλάχιστον ένα πεδίο
    if (from || to) {
      query.createdAt = {};

      if (!from || from.trim() === '') {
  const firstOrder = await Order.findOne(query).sort({ createdAt: 1 }).select('createdAt');
  if (firstOrder) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$gte = firstOrder.createdAt;
  }
} else {
  const fromDate = new Date(from);
  if (!isNaN(fromDate)) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$gte = fromDate;
  }
}

// Αν υπάρχει to, ορίζουμε το τέλος της ημέρας
      if (to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }
//  Επιλογή πεδίου για populate ανάλογα με τον ρόλο του χρήστη
    const populateField =
      req.user.role === 'customer'
        ? { path: 'store', select: 'storeName' }
        : {
            path: 'customer',
            select:
              'username customerRegion customerStreetAddress customerFloor customerDoorbell customerMobilePhone',
          };
//  Ανάκτηση παραγγελιών με βάση το query
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate(populateField);

    res.json(orders);
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την προβολή παραγγελιών' });
  }
});





//Επιβεβαίωση παραγγελίας από Selller
router.put('/confirm/:orderId', protect, isSeller, confirmOrderBySeller,  async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedDeliveryTime } = req.body;
//  Εύρεση παραγγελίας και χρήστη
    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');

    if (!order) return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });

    if (req.user.role !== 'Seller') return res.status(403).json({ message: 'Μόνο συνεργάτες μπορούν να επιβεβαιώσουν παραγγελίες' });
    if (order.store.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε αυτή την παραγγελία' });

    order.confirmed = true;
    order.estimatedDeliveryTime = estimatedDeliveryTime;
    await order.save();

    await sendOrderEmailToCustomer(order.customer.email, {
      username: order.customer.username,
      storeName: order.store.storeName,
      orderId: order._id,
      createdAt: order.createdAt,
      estimatedDeliveryTime,
      deliveryInfo: {
        region: order.customer.customerRegion,
        street: order.customer.customerStreetAddress,
        floor: order.customer.customerFloor,
        doorbell: order.customer.customerDoorbell,
        phone: order.customer.customerMobilePhone,
      },
      items: order.items,
      totalPrice: order.totalPrice,
      note: order.customerNote || '',
    });

    res.json({ message: 'Η παραγγελία επιβεβαιώθηκε και εστάλη στον πελάτη' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επιβεβαίωση' });
  }
});
// Άρνηση παραγγελίας από τον seller
router.put('/deny/:orderId', protect, isSeller, denyOrderBySeller,  async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');

    if (!order) return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });
//  Έλεγχος δικαιωμάτων
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Μόνο συνεργάτες μπορούν να επιβεβαιώσουν παραγγελίες' });
    if (order.store.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε αυτή την παραγγελία' });

    await order.save();

    await sendDeclinedOrderEmailToCustomer(order.customer.email, {
      username: order.customer.username,
      storeName: order.store.storeName,
      orderId: order._id,
      createdAt: order.createdAt,
      deliveryInfo: {
        region: order.customer.customerRegion,
        street: order.customer.customerStreetAddress,
        floor: order.customer.customerFloor,
        doorbell: order.customer.customerDoorbell,
        phone: order.customer.customerMobilePhone,
      },
      items: order.items,
      totalPrice: order.totalPrice,
      note: order.customerNote || '',
    });

    res.json({ message: 'Η παραγγελία επιβεβαιώθηκε και εστάλη στον πελάτη' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επιβεβαίωση' });
  }
});
// Προβολή παραγγελιών του seller
router.get('/seller', protect, getSellerOrders);

export default router;
