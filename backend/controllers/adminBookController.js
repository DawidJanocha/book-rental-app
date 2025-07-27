import Book from '../models/Book.js';
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import User from '../models/User.js';

export const getAllBooksDetailed = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('store', 'storeName email')
      .sort({ createdAt: -1 });

    const detailedBooks = await Promise.all(
      books.map(async (book) => {
        const orders = await Order.find({ 'items.bookId': book._id })
          .populate('customer', 'username email');

        const rentalPrice = parseFloat(book.rentalPrice.toString()); // ✅ μετατροπή Decimal128 -> number

        const salesDetails = [];

        orders.forEach((order) => {
          order.items.forEach((item) => {
            if (item.bookId.toString() === book._id.toString()) {
              salesDetails.push({
                customerName: order.customer?.username || 'Άγνωστος',
                customerEmail: order.customer?.email || '',
                purchasedAt: order.createdAt,
                quantity: item.quantity,
                totalPrice: item.quantity * rentalPrice, // ✅ καθαρό number
              });
            }
          });
        });

        return {
          _id: book._id,
          title: book.title,
          author: book.author,
          category: book.category,
          description: book.description,
          rentalPrice: rentalPrice, // ✅ καθαρό number
          available: book.available,
          createdAt: book.createdAt,
          storeName: book.store?.storeName || 'Άγνωστο',
          storeEmail: book.store?.email || '',
          totalSales: salesDetails.reduce((acc, cur) => acc + cur.quantity, 0),
          salesDetails,
        };
      })
    );

    res.status(200).json(detailedBooks);
  } catch (error) {
    console.error('getAllBooksDetailed error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση των βιβλίων.' });
  }
};
