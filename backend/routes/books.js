// routes/books.js

import express from 'express';
import {
  addBook,
  updateBook,
  deleteBook,
  deleteAllBooksForSeller,
  getMyBooks,
  getAvailableBooks,
  rentBook,
  rentMultipleBooks,
  getBooksByStore,
  getRecentBooks, getBestSellers,
} from '../controllers/bookController.js';

import {
  bulkImportBooks,
  upload,
} from '../controllers/bulkImportController.js';

import {
  protect,
  isSeller,
  isCustomer,
} from '../middleware/authMiddleware.js';

const router = express.Router();

/* 
===================================
 Public & Customer Routes
===================================
*/

//  Δημόσια προβολή όλων των διαθέσιμων βιβλίων (για το CustomerPage.jsx)
router.get('/', getAvailableBooks);

//  Ενοικίαση ενός βιβλίου (μόνο για customer)
router.put('/rent/:bookId', protect, isCustomer, rentBook);

//  Ενοικίαση πολλών βιβλίων (μόνο για customer)
router.put('/rent-multiple', protect, isCustomer, rentMultipleBooks);

//  Νέα βιβλία με βάση ημερομηνία δημιουργίας
router.get('/recent', getRecentBooks);

// Best sellers με βάση παραγγελίες
router.get('/best-sellers', getBestSellers);


//Επιστροφή στοιχειων 
router.get('/store/:storeId', getBooksByStore); // ✅

/* 
===================================
📦 Seller Routes
===================================
*/

//  Προσθήκη νέου βιβλίου
router.post('/', protect, isSeller, addBook);

//  Προβολή βιβλίων του seller
router.get('/my', protect, isSeller, getMyBooks);

//  Ενημέρωση βιβλίου
router.put('/:id', protect, isSeller, updateBook);

//  Διαγραφή ενός βιβλίου
router.delete('/:id', protect, isSeller, deleteBook);


// Διαγραφή όλων των βιβλίων του seller
router.delete('/', protect, deleteAllBooksForSeller);


//Μαζική εισαγωγή βιβλίων (Excel / JSON)
router.post('/import', protect, isSeller, upload, bulkImportBooks);



export default router;
