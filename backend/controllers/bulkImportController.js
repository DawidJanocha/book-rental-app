// controllers/bulkImportController.js
import mongoose from 'mongoose'; // Πάνω-πάνω αν δεν υπάρχει
import multer from 'multer';
import xlsx from 'xlsx';
import Book from '../models/Book.js';
import Store from '../models/Store.js';

// 📁 Ρύθμιση Multer για file uploads (από μνήμη, όχι δίσκο)
const storage = multer.memoryStorage();
export const upload = multer({ storage }).single('file');

// 📥 Bulk import βιβλίων
export const bulkImportBooks = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // ➤ Βρες το κατάστημα του seller
    const store = await Store.findOne({ user: sellerId });
    if (!store) {
      return res.status(400).json({ message: 'Δεν βρέθηκε κατάστημα για αυτόν τον χρήστη.' });
    }

    // ➤ Ανέβηκε αρχείο;
    if (!req.file) {
      return res.status(400).json({ message: 'Δεν βρέθηκε αρχείο.' });
    }

    // ➤ Ανάγνωση τύπου αρχείου
    const buffer = req.file.buffer;
    const fileType = req.file.originalname.split('.').pop().toLowerCase();

    let books = [];

    if (fileType === 'json') {
      books = JSON.parse(buffer.toString());
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      books = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).json({ message: 'Μη υποστηριζόμενο αρχείο. Επιτρέπεται μόνο Excel ή JSON.' });
    }

    if (!books.length) {
      return res.status(400).json({ message: 'Το αρχείο δεν περιέχει βιβλία.' });
    }
    const extractDecimalValue = (value) => {
        if (typeof value === 'object' && value !== null && '$numberDecimal' in value) {
          return value.$numberDecimal.toString();
        }
        return value.toString();
      };

    // ➤ Προετοιμασία βιβλίων με καθαρισμένα δεδομένα
    const preparedBooks = books
      .filter(book => book.title && book.quantity !== undefined)
      .map(book => ({
        title: String(book.title).trim(),
        author: String(book.author || '').trim(),
        description: String(book.description || '').trim(),
        rentalPrice: mongoose.Types.Decimal128.fromString(extractDecimalValue(book.rentalPrice || book.price || 0)),
        quantity: Math.max(1, Number(book.quantity)), // πάντα >= 1
        available: Number(book.quantity) > 0,
        seller: sellerId,
        store: store._id,
      }));

    if (!preparedBooks.length) {
      return res.status(400).json({ message: 'Δεν βρέθηκαν έγκυρα βιβλία για εισαγωγή.' });
    }

    // ➤ Μαζική εισαγωγή
    await Book.insertMany(preparedBooks);

    res.status(200).json({
      message: `✅ Εισήχθησαν ${preparedBooks.length} βιβλία επιτυχώς.`,
    });

  } catch (error) {
    console.error('❌ Σφάλμα κατά την εισαγωγή βιβλίων:', error);
    res.status(500).json({ message: '❌ Απέτυχε η εισαγωγή αρχείου.' });
  }
};
