import Order from '../models/Order.js';
import Store from '../models/Store.js';
import UserDetails from '../models/UserDetails.js';
import User from '../models/User.js'
import sendOrderEmailToSeller from '../utils/sendOrderEmailToSeller.js';
import sendOrderEmailToCustomer from '../utils/sendOrderEmailToCustomer.js';

// ✅ Δημιουργία παραγγελίας
export const completeOrder = async (req, res) => {
  try {
    const {
      items,
      totalCost,
      storeId,
      customerComment,
    } = req.body;

    if (!items || !storeId) {
      return res.status(400).json({ message: 'Λείπουν στοιχεία παραγγελίας' });
    }
    const user = await User.findById(req.user._id);
    console.log("User", user)

    const customer = await UserDetails.findOne({ user: req.user._id });
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'Το κατάστημα δεν βρέθηκε' });
    }

    const newOrder = new Order({
      customer: req.user._id,
      store: storeId,
      items,
      totalPrice:totalCost,
      customerComment,
      status: 'pending',
    });

    await newOrder.save();

    const orderDate = new Date(newOrder.createdAt).toLocaleString('el-GR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    console.log("Store", store.storeName)
    console.log("Id", req.user._id)
    console.log("Customer", customer)
    const objToSendOrderToSeller={
      sellerEmail: store.email,
      storeName: store.storeName,
      orderId: newOrder._id,
      createdAt: orderDate,
      items,
      totalCost,
      customerInfo: {
        username: `${customer.firstName} ${customer.lastName}`,
        mobile: customer.phone,
        region: customer.region,
        postalCode: customer.postalCode,
        address: customer.street,
        floor: customer.floor,
        doorbell: customer.doorbell,
        comment: customerComment || '',
      },
    }
    console.log("Object",objToSendOrderToSeller)
    // ✅ Στέλνουμε email στον SELLER
    await sendOrderEmailToSeller(objToSendOrderToSeller);

    res.status(201).json({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς' });
  } catch (err) {
    console.error('Σφάλμα κατά την ολοκλήρωση παραγγελίας:', err);
    res.status(500).json({ message: 'Αποτυχία παραγγελίας' });
  }
};

// ✅ Λήψη παραγγελιών πελάτη
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('store', 'storeName region')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', err);
    res.status(500).json({ message: 'Αποτυχία ανάκτησης παραγγελιών' });
  }
};

// ✅ Επιβεβαίωση παραγγελίας από seller + αποστολή email στον customer
export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedTime } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('store');

    if (!order) return res.status(404).json({ message: 'Η παραγγελία δεν βρέθηκε' });

    const store = await Store.findById(order.store._id);
    if (!store || store.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Δεν έχεις δικαίωμα σε αυτήν την παραγγελία' });
    }

    order.estimatedTime = estimatedTime;
    order.status = 'confirmed';
    await order.save();

    const orderDate = new Date(order.createdAt).toLocaleString('el-GR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    // ✅ Στέλνουμε email στον CUSTOMER
    await sendOrderEmailToCustomer({
      customerEmail: order.customer.email,
      username: order.customer.username,
      storeName: order.store.storeName,
      orderId: order._id,
      estimatedTime,
      orderDate,
      customerInfo: {
        customerStreetAddress: order.customer.customerStreetAddress,
        customerFloor: order.customer.customerFloor,
        customerDoorbell: order.customer.customerDoorbell,
        customerRegion: order.customer.customerRegion,
        customerMobilePhone: order.customer.customerMobilePhone,
      },
      items: order.items,
      totalCost: order.totalCost,
    });

    res.json({ message: 'Η παραγγελία επιβεβαιώθηκε και στάλθηκε email στον πελάτη' });
  } catch (err) {
    console.error('Σφάλμα κατά την επιβεβαίωση παραγγελίας:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την επιβεβαίωση παραγγελίας' });
  }
};
