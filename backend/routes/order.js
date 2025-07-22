// routes/order.js
import express from 'express';
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

const router = express.Router();

// ✅ Δημιουργία παραγγελίας από πελάτη
router.post('/complete', protect, isCustomer ,completeOrder, async (req, res) => {
  try {
    const { items, totalPrice, storeId, customerNote } = req.body;
    const customerId = req.user._id;

    // 1. Group items by store
    console.log("items", items);
    const itemsByStore = {};
    items.forEach(item => {
      // item.bookId must be present and item.store must be present
      console.log("item.bookId", item.bookId);
      if (!itemsByStore[item.bookId.store._id]) itemsByStore[item.bookId.store._id] = [];
      itemsByStore[item.store].push(item);
    });
    console.log("itemsByStore", itemsByStore);

    const orderResults = [];

    // 2. For each store, create order and send email
    for (const storeId of Object.keys(itemsByStore)) {
      const store = await Store.findById(storeId);
      if (!store) continue;

      const sellerUser = await User.findById(store.user);
      if (!sellerUser) continue;

      const storeItems = itemsByStore[storeId];

      // Calculate total for this store's items
      const storeTotal = storeItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);

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

// ✅ Προβολή ιστορικού παραγγελιών (Customer ή Partner)
router.get('/', protect, async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'customer') {
      orders = await Order.find({ customer: req.user._id })
        .sort({ createdAt: -1 })
        .populate('store', 'storeName');
    } else if (req.user.role === 'partner') {
      const store = await Store.findOne({ user: req.user._id });
      if (!store) return res.status(404).json({ message: 'Δεν βρέθηκε κατάστημα' });

      orders = await Order.find({ store: store._id })
        .sort({ createdAt: -1 })
        .populate('customer', 'username customerRegion customerStreetAddress customerFloor customerDoorbell customerMobilePhone');
    } else {
      return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε παραγγελίες' });
    }

    res.json(orders);
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την προβολή παραγγελιών' });
  }
});


// ✅ Επιβεβαίωση παραγγελίας από Partner
router.put('/confirm/:orderId', protect, isSeller, confirmOrderBySeller,  async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedDeliveryTime } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');

    if (!order) return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });

    if (req.user.role !== 'partner') return res.status(403).json({ message: 'Μόνο συνεργάτες μπορούν να επιβεβαιώσουν παραγγελίες' });
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

router.put('/deny/:orderId', protect, isSeller, denyOrderBySeller,  async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');

    if (!order) return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });

    if (req.user.role !== 'partner') return res.status(403).json({ message: 'Μόνο συνεργάτες μπορούν να επιβεβαιώσουν παραγγελίες' });
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

router.get('/seller', protect, getSellerOrders);

export default router;
