// controllers/bookController.js
import Book from '../models/Book.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js'; 
import { generateOrderEmailHTML } from '../utils/orderEmailTemplate.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
// 📚 Προσθήκη νέου βιβλίου (Seller)
// controllers/bookController.js

export const addBook = async (req, res) => {
  try {
    const { title, author, description, price, quantity } = req.body;
    console.log("Body", req.body)
    console.log("User", req.user)
    // 🔐 Βεβαιώσου ότι ο χρήστης είναι partner
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Μόνο συνεργάτες μπορούν να προσθέσουν βιβλία.' });
    }

    // 🔍 Βρες το κατάστημα του Partner
    const store = await Store.findOne({ user: req.user._id });
    
    if (!store) {
      return res.status(404).json({ message: 'Δεν βρέθηκε κατάστημα για αυτόν τον συνεργάτη.' });
    }
    // 📦 Δημιουργία βιβλίου με σύνδεση στο κατάστημα
    const newBook = new Book({
        title,
        author,
        description,
        rentalPrice: price ?? 0,
        quantity: Number(quantity),
        seller: req.user._id,
        store: store._id,
      });

    console.log("New Book", newBook)

    await newBook.save();
    res.status(201).json({ message: '✅ Το βιβλίο προστέθηκε με επιτυχία.', book: newBook });
  } catch (error) {
    console.error('❌ Σφάλμα κατά την προσθήκη βιβλίου:', error);
    res.status(500).json({ message: '❌ Σφάλμα κατά την προσθήκη βιβλίου.' });
  }
};

// ✅ Ενημέρωση βιβλίου από seller

export const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log('📥 Incoming PUT body:', req.body);
    const userId = req.user._id;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: '📕 Το βιβλίο δεν βρέθηκε' });
    if (book.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: '🚫 Δεν έχεις δικαίωμα επεξεργασίας αυτού του βιβλίου' });
    }

    const { title, author, description, quantity, price } = req.body;

    // 🔍 Αποθήκευση παλιών τιμών
    const oldTitle = book.title;
    const oldAuthor = book.author;
    const oldDescription = book.description;
    const oldQuantity = book.quantity;
    const oldPrice = book.rentalPrice;

    const store = await Store.findOne({ user: userId });
    if (!book.store && store) {
      book.store = store._id;
    }

    // if (price && price !== book.rentalPrice && !book.rentalPrice) {
    //   book.originalPrice = book.price;
    // }

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.quantity = quantity || book.quantity;
    book.rentalPrice = price || book.price;

    await book.save();

    res.status(200).json({
      message: '✅ Το βιβλίο ενημερώθηκε',
      previousValues: {
        title: oldTitle,
        author: oldAuthor,
        description: oldDescription,
        quantity: oldQuantity,
        rentalPrice: oldPrice,
      },
      updatedValues: {
        title: book.title,
        author: book.author,
        description: book.description,
        quantity: book.quantity,
        rentalPrice: book.rentalPrice,
      },
      book,
    });
  } catch (err) {
    console.error('❌ updateBook error:', err);
    res.status(500).json({ message: '❌ Αποτυχία επεξεργασίας βιβλίου' });
  }
};

// 📚 Φέρνει τα πιο πρόσφατα προστιθέμενα βιβλία
export const getRecentBooks = async (req, res) => {
  try {
    const books = await Book.find({ available: true })
      .sort({ createdAt: -1 })
      .limit(12);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση πρόσφατων βιβλίων.' });
  }
};


// ⭐ Δημοφιλέστερα βιβλία με βάση πλήθος παραγγελιών
export const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
          _id: "$items.bookId",
          totalRented: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalRented: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: "$book._id",
          title: "$book.title",
          description: "$book.description",
          rentalPrice: "$book.rentalPrice",
          imageUrl: "$book.imageUrl",
          totalRented: 1
        }
      }
    ]);

    res.status(200).json(bestSellers);
  } catch (error) {
    console.error('getBestSellers error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση best sellers.' });
  }
};


export const getBooksByStore = async (req, res) => {
  try {
    const books = await Book.find({ store: req.params.storeId });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



// 📖 Επιστροφή μόνο των βιβλίων του seller

export const getMyBooks = async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.user._id });

    if (!store) {
      return res.status(404).json({ message: 'Δεν βρέθηκε κατάστημα για τον χρήστη.' });
    }

    const books = await Book.find({ store: store._id });
    res.status(200).json(books);
  } catch (err) {
    console.error('❌ Σφάλμα στο getMyBooks:', err);
    res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση των βιβλίων.' });
  }
};


// 📚 Εμφάνιση όλων των διαθέσιμων βιβλίων για τους πελάτες
export const getAvailableBooks = async (req, res) => {
  try {
    const books = await Book.find({ available: true })
      .populate('store', '_id storeName') // ✅ Βάζουμε μόνο τα απαραίτητα πεδία
      .select('-__v'); // optional: κρύβει το __v

    res.status(200).json(books);
  } catch (error) {
    console.error('❌ Σφάλμα κατά την ανάκτηση διαθέσιμων βιβλίων:', error);
    res.status(500).json({ message: '❌ Δεν ήταν δυνατή η λήψη βιβλίων' });
  }
};





// ❌ Διαγραφή 1 βιβλίου (Seller)
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!book) return res.status(404).json({ message: '❌ Δεν βρέθηκε το βιβλίο' });
    res.status(200).json({ message: '✅ Διαγράφηκε' });
  } catch (err) {
    res.status(500).json({ message: '❌ Σφάλμα κατά τη διαγραφή' });
  }
};

// ❌ Μαζική διαγραφή όλων των βιβλίων (Seller)
export const deleteAllBooks = async (req, res) => {
  try {
    await Book.deleteMany({ seller: req.user._id });
    res.status(200).json({ message: '✅ Όλα τα βιβλία διαγράφηκαν' });
  } catch (err) {
    res.status(500).json({ message: '❌ Σφάλμα κατά τη μαζική διαγραφή' });
  }
};

// 🛒 Ενοικίαση 1 βιβλίου (δεν χρησιμοποιείται πια)
export const rentBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const { comment } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(bookId).populate('seller', 'username email');
    if (!book) return res.status(404).json({ message: '📕 Το βιβλίο δεν βρέθηκε' });
    if (!book.available) return res.status(400).json({ message: '📕 Το βιβλίο έχει ήδη ενοικιαστεί' });

    book.available = false;
    book.rentedCount += 1;
    await book.save();

    await sendEmail({
      to: book.seller.email,
      subject: `📖 Νέα Ενοικίαση Βιβλίου: ${book.title}`,
      html: `
        <h2>📚 Ενοικίαση Βιβλίου</h2>
        <p><strong>Τίτλος:</strong> ${book.title}</p>
        <p><strong>Συγγραφέας:</strong> ${book.author}</p>
        <p><strong>Σχόλια πελάτη:</strong> ${comment || '–'}</p>
        <hr />
        <p>🧑 Πελάτης με ID: ${userId}</p>
      `,
    });

    res.status(200).json({ message: '✅ Ενοικίαση επιτυχής' });
  } catch (err) {
    res.status(500).json({ message: '❌ Σφάλμα ενοικίασης στον server' });
  }
};

// controllers/bookController.js

export const rentMultipleBooks = async (req, res) => {
  try {
    const { books, comment } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: '❌ Δεν βρέθηκε ο χρήστης' });

    const rentedBooks = [];
    const backOrderedBooks = [];
    let totalCost = 0;

    for (const item of books) {
      const book = await Book.findById(item._id).populate('seller', 'username email');
      if (!book) {
        console.warn(`❌ Το βιβλίο με ID ${item._id} δεν βρέθηκε`);
        continue;
      }

      const qtyRequested = item.quantity || 1;

      if (book.quantity > 0) {
        book.quantity -= qtyRequested;
        if (book.quantity < 0) book.quantity = 0;
      }

      if (book.quantity === 0) {
        backOrderedBooks.push(book.title);
      }

      book.available = true;
      book.rentedCount += 1;

      await book.save();

      rentedBooks.push({
        _id: book._id,
        title: book.title,
        author: book.author,
        rentalPrice: book.rentalPrice,
        seller: book.seller,
        quantity: qtyRequested,
      });

      totalCost += book.rentalPrice * qtyRequested;
    }

    if (!rentedBooks.length) {
      return res.status(400).json({ message: '❌ Κανένα βιβλίο δεν ήταν διαθέσιμο' });
    }

    // Email στον πελάτη
    await sendEmail({
      to: user.email,
      subject: `📚 Ευχαριστούμε για την παραγγελία σας, ${user.username}!`,
      html: generateOrderEmailHTML({
        username: user.username,
        books: rentedBooks,
        comment,
        isCustomer: true,
        total: totalCost.toFixed(2),
        backOrderedTitles: backOrderedBooks,
      }),
    });

    // Ομαδοποίηση βιβλίων ανά πωλητή και αποστολή email σε κάθε πωλητή
    const sellersMap = new Map();
    for (const book of rentedBooks) {
      const sellerId = book.seller._id.toString();
      if (!sellersMap.has(sellerId)) sellersMap.set(sellerId, []);
      sellersMap.get(sellerId).push(book);
    }

    for (const [sellerId, sellerBooks] of sellersMap.entries()) {
      const seller = sellerBooks[0].seller;
      const sellerBackOrders = sellerBooks
        .filter((b) => backOrderedBooks.includes(b.title))
        .map((b) => b.title);

     await sendEmail({
  to: seller.email,
  subject: `📚 Νέα Παραγγελία για τα βιβλία σας`,
  html: generateOrderEmailHTML({
    username: book.seller.username, // Αν το user.username δεν περνάει σωστά, δοκιμάστε αυτό
    books: sellerBooks,
    comment,
    isCustomer: false,
    backOrderedTitles: sellerBackOrders,
  }),
});
    }

    res.status(200).json({
      message: '✅ Ενοικίαση ολοκληρώθηκε!',
      backOrderNotice:
        backOrderedBooks.length > 0
          ? `⚠️ Προσοχή: Τα εξής προϊόντα θα παραδοθούν σε τουλάχιστον 2 εβδομάδες: ${backOrderedBooks.join(', ')}`
          : null,
    });
  } catch (err) {
    console.error('❌ rentMultipleBooks error:', err);
    res.status(500).json({ message: '❌ Σφάλμα κατά την ενοικίαση πολλαπλών βιβλίων' });
  }
};



