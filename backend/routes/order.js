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

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Κατάστημα δεν βρέθηκε' });

    const partnerUser = await User.findById(store.user);
    if (!partnerUser) return res.status(404).json({ message: 'Συνεργάτης δεν βρέθηκε' });

    const newOrder = await Order.create({
      customer: customerId,
      store: storeId,
      items,
      totalPrice: totalPrice,
      customerNote,
    });

    await sendOrderEmailToSeller(partnerUser.email, {
      storeName: store.storeName,
      items,
      totalPrice,
      customerInfo: req.user,
      orderId: newOrder._id,
      createdAt: newOrder.createdAt,
      note: customerNote || '',
    });

    res.status(201).json({ message: 'Η παραγγελία καταχωρήθηκε', orderId: newOrder._id });
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
