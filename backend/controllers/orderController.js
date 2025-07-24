import Order from '../models/Order.js';
import Book from '../models/Book.js';
import Store from '../models/Store.js';
import UserDetails from '../models/UserDetails.js';
import { sendEmail } from '../utils/sendEmail.js';
import sendOrderEmailToCustomer from '../utils/sendOrderEmailToCustomer.js';
import sendDeclinedOrderEmailToCustomer from '../utils/sendDeclinedOrderEmailToCustomer.js';

// Ολοκλήρωση παραγγελίας από customer
export const completeOrder = async (req, res) => {
  try {
    const { items, comments } = req.body;
    const user = req.user;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Το καλάθι είναι άδειο.' });
    }

    const enrichedItems = [];

    for (const item of items) {
      const book = await Book.findById(item.productId).populate('storeId');
      if (!book || isNaN(item.quantity)) {
        return res.status(400).json({ message: `Μη έγκυρο προϊόν ή ποσότητα.` });
      }

      enrichedItems.push({
        productId: item.productId,
        title: book.title,
        price: book.price || book.rentalPrice || 0,
        quantity: item.quantity,
        storeId: book.storeId?._id || book.storeId,
        storeName: book.storeId?.storeName || 'Άγνωστο',
      });
    }

    // Ομαδοποίηση ΜΕΤΑ τον εμπλουτισμό
    const itemsByStore = {};
    for (const item of enrichedItems) {
      const storeKey = item.storeId.toString();
      if (!itemsByStore[storeKey]) itemsByStore[storeKey] = [];
      itemsByStore[storeKey].push(item);
    }

    for (const storeId in itemsByStore) {
      const storeItems = itemsByStore[storeId];
      const store = await Store.findById(storeId).populate('user');
      if (!store || !store.email) {
        console.warn(`⚠️ Store ${storeId} not found or missing email`);
        continue;
      }

      const orderTotal = storeItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const newOrder = new Order({
        customer: user._id,
        items: storeItems,
        comments,
        totalPrice: orderTotal,
        store: store._id,
      });

      await newOrder.save();

    // Αποστολή email στον πελάτη
    const htmlItems = storeItems
        .map(
          (i) => `
            <tr>
              <td>${i.title}</td>
              <td>${i.quantity}</td>
              <td>${(i.price * i.quantity).toFixed(2)}€</td>
            </tr>`
        )
        .join('');

      await sendEmail({
        to: store.email,
        subject: `🛒 Νέα παραγγελία για το κατάστημά σας (${store.storeName})`,
        html: `
          <h2>Νέα Παραγγελία</h2>
          <p>Ημερομηνία: ${newOrder.createdAt.toLocaleString()}</p>
          <table border="1" cellpadding="8" cellspacing="0">
            <thead>
              <tr><th>Προϊόν</th><th>Ποσότητα</th><th>Σύνολο</th></tr>
            </thead>
            <tbody>${htmlItems}</tbody>
          </table>
          <p><strong>Σύνολο:</strong> ${orderTotal.toFixed(2)}€</p>
          <h3>Στοιχεία Πελάτη</h3>
          <p>Όνομα: ${user.username}</p>
          <p>Τηλέφωνο: ${user.customerMobilePhone || '-'}</p>
          <p>Διεύθυνση: ${user.customerStreetAddress || '-'}, ${user.customerPostalCode || ''} ${user.customerRegion || ''}</p>
        `,
      });
    }

    return res.status(200).json({ message: 'Η παραγγελία στάλθηκε στους συνεργάτες.' });
  } catch (error) {
    console.error('❌ completeOrder error:', error);
    return res.status(500).json({ message: 'Σφάλμα κατά την αποθήκευση παραγγελίας.' });
  }
};



// Επιβεβαίωση παραγγελίας από Seller
export const confirmOrderBySeller = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedDeliveryTime } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');
    const userDetails = await UserDetails.findOne({ user: order.customer._id });

    if (!order) {
      return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });
    }

    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Μόνο sellers μπορούν να επιβεβαιώσουν παραγγελίες' });
    }

    if (order.store.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε αυτή την παραγγελία' });
    }
    for (const item of order.items) {
      console.log("item.bookId", item.bookId)
      await Book.findByIdAndUpdate(
        item.bookId,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    order.status = 'confirmed';
    order.estimatedTime = estimatedDeliveryTime;
    await order.save();

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
      totalCost: parseFloat(order.totalPrice.toString()),
    });

    res.json({ message: 'Η παραγγελία επιβεβαιώθηκε και εστάλη στον πελάτη' });
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επιβεβαίωση' });
  }
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

    //Μόνο seller του συγκεκριμένου store μπορεί να επιβεβαιώσει
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Μόνο sellers μπορούν να επιβεβαιώσουν παραγγελίες' });
    }

    if (order.store.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Δεν έχεις πρόσβαση σε αυτή την παραγγελία' });
    }

    //Ενημέρωση παραγγελίας
    order.status = "declined";
    await order.save();
    console.log("Order", order)
    //Αποστολή email στον πελάτη
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

}


//Λήψη παραγγελιών seller
export const getSellerOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.user._id });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const { from, to } = req.query;
    const filter = { store: store._id };

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
      };
    }

    const orders = await Order.find(filter)
      .populate('customer', 'username email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Σφάλμα στη λήψη παραγγελιών:', err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή' });
  }
};


export const getOrderHistory = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};

    let orders;
    let store;

    if (req.user.role === 'customer') {
      const query = { customer: req.user._id };

      if (from || to) {
        if (from) {
          dateFilter.$gte = new Date(from);
        } else {
          const firstOrder = await Order.findOne({ customer: req.user._id })
            .sort({ createdAt: 1 })
            .select('createdAt');

          if (firstOrder) {
            dateFilter.$gte = firstOrder.createdAt;
          }
        }

        if (to) {
          const endOfDay = new Date(to);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter.$lte = endOfDay;
        }

        query.createdAt = dateFilter;
      }

      orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .populate('store', 'storeName');

    } else if (req.user.role === 'partner') {
      store = await Store.findOne({ user: req.user._id });
      if (!store) return res.status(404).json({ message: 'Δεν βρέθηκε κατάστημα' });

      const query = { store: store._id };

      if (from || to) {
        if (from) {
          dateFilter.$gte = new Date(from);
        } else {
          const firstOrder = await Order.findOne({ store: store._id })
            .sort({ createdAt: 1 })
            .select('createdAt');

          if (firstOrder) {
            dateFilter.$gte = firstOrder.createdAt;
          }
        }

        if (to) {
          const endOfDay = new Date(to);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter.$lte = endOfDay;
        }

        query.createdAt = dateFilter;
      }

      orders = await Order.find(query)
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
};



//Επιστροφή παραγγελιών του πελάτη
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    const formattedOrders = [];

    for (const order of orders) {
      const detailedItems = [];

      let firstStoreName = null;

      for (const item of order.items) {
        const product = await Book.findById(item.bookId).populate('storeId');

        detailedItems.push({
          name: product?.title || 'Άγνωστο',
          quantity: item.quantity,
          price: product?.price || product?.rentalPrice || 0,
        });

        if (!firstStoreName && product?.storeId?.storeName) {
          firstStoreName = product.storeId.storeName;
        }
      }
      // Προσθήκη της παραγγελίας με τα στοιχεία  
      formattedOrders.push({
        _id: order._id,
        createdAt: order.createdAt,
        confirmed: order.status === 'confirmed',
        estimatedDeliveryTime: order.estimatedTime || null,
        items: detailedItems,
        totalAmount: parseFloat(order.totalPrice?.toString() || '0'),
        storeName: firstStoreName || 'Άγνωστο',
      });
    }

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση παραγγελιών' });
  }
};

// Μαζική ενημέρωση κατάστασης
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
      // Έλεγχος αν ο χρήστης είναι seller
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
  };
};