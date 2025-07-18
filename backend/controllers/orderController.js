import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Book from '../models/Book.js'; // Αντικαθιστά το Product
import UserDetails from '../models/UserDetails.js';
import { sendEmail } from '../utils/sendEmail.js';
import sendOrderEmailToCustomer from '../utils/sendOrderEmailToCustomer.js';
import sendDeclinedOrderEmailToCustomer from '../utils/sendDeclinedOrderEmailToCustomer.js';

// ✅ Ολοκλήρωση παραγγελίας από customer
// ✅ Ολοκλήρωση παραγγελίας από customer (διορθωμένο)
export const completeOrder = async (req, res) => {
  try {
    const { items, comments } = req.body;
    const user = req.user;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Το καλάθι είναι άδειο.' });
    }

    let totalAmount = 0;

    for (const item of items) {
      const book = await Book.findById(item.productId).populate('storeId');
      if (!book || isNaN(item.quantity)) {
        return res.status(400).json({ message: `Μη έγκυρο προϊόν ή ποσότητα.` });
      }

      // ✅ Αντιγραφή αναγκαίων στοιχείων από το βιβλίο
      item.name = book.title;
      item.price = book.price || book.rentalPrice;
      item.storeId = book.storeId?._id;
      item.storeName = book.storeId?.storeName || 'Άγνωστο';

      totalAmount += item.price * item.quantity;
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Σφάλμα στον υπολογισμό του συνολικού ποσού.' });
    }

    const newOrder = new Order({
      customer: user._id,
      items,
      comments,
      totalAmount,
    });

    await newOrder.save();

    // Βρες μοναδικά storeIds
    const storeIds = [...new Set(items.map(i => String(i.storeId)))];

    for (const storeId of storeIds) {
      const store = await Store.findById(storeId).populate('user');
      if (store) {
        await sendEmail({
          to: store.email,
          subject: '🛒 Νέα παραγγελία στο κατάστημά σας',
          html: `<p>Έχετε νέα παραγγελία από τον πελάτη <strong>${user.username}</strong>.</p>
                 <p>Παρακαλούμε επιβεβαιώστε την παραγγελία σας από το dashboard.</p>`,
        });
      }
    }

    return res.status(200).json({ message: 'Η παραγγελία στάλθηκε στον συνεργάτη.' });
  } catch (error) {
    console.error('completeOrder error:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την αποθήκευση παραγγελίας.' });
  }
};


// ✅ Επιστροφή παραγγελιών του πελάτη
// controllers/orderController.js

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    const formattedOrders = [];

    for (const order of orders) {
      const detailedItems = [];

      let firstStoreName = null;

      for (const item of order.items) {
        const product = await Book.findById(item.productId).populate('storeId');

        detailedItems.push({
          name: product?.name || 'Άγνωστο',
          quantity: item.quantity,
          price: product?.price || product?.rentalPrice || 0,
        });

        if (!firstStoreName && product?.storeId?.storeName) {
          firstStoreName = product.storeId.storeName;
        }
      }

      formattedOrders.push({
        _id: order._id,
        createdAt: order.createdAt,
        confirmed: order.confirmed,
        estimatedDeliveryTime: order.estimatedDeliveryTime || null,
        items: detailedItems,
        totalAmount: order.totalAmount || 0,
        storeName: firstStoreName || 'Άγνωστο',
      });
    }

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση παραγγελιών' });
  }
};


// ✅ Επιβεβαίωση παραγγελίας από Seller
export const confirmOrderBySeller = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedDeliveryTime } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');
    const userDetails = await UserDetails.findOne({ user: order.customer._id });
    console.log("userDetails", userDetails)
      
    if (!order) {
      return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });
    }

    // 🔐 Μόνο seller του συγκεκριμένου store μπορεί να επιβεβαιώσει
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Μόνο sellers μπορούν να επιβεβαιώσουν παραγγελίες' });
    }

    if (order.store.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε αυτή την παραγγελία' });
    }

    // ✅ Ενημέρωση παραγγελίας
    order.status = "confirmed";
    order.estimatedTime = estimatedDeliveryTime;
    await order.save();
    console.log("Order", order)
    // ✅ Αποστολή email στον πελάτη
    await sendOrderEmailToCustomer({
      customerEmail: order.customer.email,
      username: order.customer.username,
      storeName: order.store.storeName,
      orderId: order._id,
      createdAt: order.createdAt,
      deliveryTime: estimatedDeliveryTime,
      customerInfo: {
        region: userDetails.region,
        street: userDetails.street,
        floor: userDetails.floor,
        doorbell: userDetails.doorbell,
        phone: userDetails.phone,
        postalCode: userDetails.postalCode
      },
      items: order.items,
      totalCost: order?.totalPrice,
    });

    res.json({ message: 'Η παραγγελία επιβεβαιώθηκε και εστάλη στον πελάτη' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επιβεβαίωση' });
  }
};

// ✅ Μαζική ενημέρωση κατάστασης από Partner
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
      return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε.' });
    }

    order.status = status;
    await order.save();

    await sendEmail({
      to: order.customer.email,
      subject: `📦 Ενημέρωση κατάστασης παραγγελίας από ${req.user.username}`,
      html: `
        <h2>Η κατάσταση της παραγγελίας σας έχει αλλάξει!</h2>
        <p>Νέα κατάσταση: <strong>${status}</strong></p>
        <p>Ευχαριστούμε που επιλέξατε την πλατφόρμα μας.</p>
      `,
    });

    return res.status(200).json({ message: 'Η κατάσταση της παραγγελίας ενημερώθηκε.' });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την ενημέρωση της κατάστασης.' });
  }
}

export const getSellerOrders = async (req, res) => {
  const store = await Store.findOne({ user: req.user._id });

  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  const orders = await Order.find({ store: store._id })
    .populate('customer', 'username email')
    .populate('items.bookId'); // if your model links to Book

  res.json(orders);
};

export const denyOrderBySeller = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');
    const userDetails = await UserDetails.findOne({ user: order.customer._id });
    console.log("userDetails", userDetails)
      
    if (!order) {
      return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });
    }

    // 🔐 Μόνο seller του συγκεκριμένου store μπορεί να επιβεβαιώσει
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Μόνο sellers μπορούν να επιβεβαιώσουν παραγγελίες' });
    }

    if (order.store.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε αυτή την παραγγελία' });
    }

    // ✅ Ενημέρωση παραγγελίας
    order.status = "declined";
    await order.save();
    console.log("Order", order)
    // ✅ Αποστολή email στον πελάτη
    await sendDeclinedOrderEmailToCustomer({
      customerEmail: order.customer.email,
      username: order.customer.username,
      storeName: order.store.storeName,
      orderId: order._id,
      createdAt: order.createdAt,
      customerInfo: {
        region: userDetails.region,
        street: userDetails.street,
        floor: userDetails.floor,
        doorbell: userDetails.doorbell,
        phone: userDetails.phone,
        postalCode: userDetails.postalCode
      },
      items: order.items,
      totalCost: order?.totalPrice,
    });

    res.json({ message: 'Η παραγγελία επιβεβαιώθηκε και εστάλη στον πελάτη' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επιβεβαίωση' });
  }
};