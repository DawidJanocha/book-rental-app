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
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Επιστροφή όλων των διαθέσιμων βιβλίων
 *     tags: [Βιβλία]
 *     responses:
 *       200:
 *         description: Λίστα διαθέσιμων βιβλίων
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

//  Δημόσια προβολή όλων των διαθέσιμων βιβλίων (για το CustomerPage.jsx)
router.get('/', getAvailableBooks);
/**
 * @swagger
 * /books/rent/{bookId}:
 *   put:
 *     summary: Ενοικίαση ενός βιβλίου από πελάτη
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Το ID του βιβλίου
 *     responses:
 *       200:
 *         description: Το βιβλίο ενοικιάστηκε με επιτυχία
 *       401:
 *         description: Μη εξουσιοδοτημένος
 */

//  Ενοικίαση ενός βιβλίου (μόνο για customer)
router.put('/rent/:bookId', protect, isCustomer, rentBook);
/**
 * @swagger
 * /books/rent-multiple:
 *   put:
 *     summary: Ενοικίαση πολλών βιβλίων ταυτόχρονα
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookIds]
 *             properties:
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f1a2b1234567890abcd111", "64f1a2b1234567890abcd222"]
 *     responses:
 *       200:
 *         description: Τα βιβλία ενοικιάστηκαν
 *       401:
 *         description: Μη εξουσιοδοτημένος
 */

//  Ενοικίαση πολλών βιβλίων (μόνο για customer)
router.put('/rent-multiple', protect, isCustomer, rentMultipleBooks);
/**
 * @swagger
 * /books/recent:
 *   get:
 *     summary: Λήψη των πιο πρόσφατων βιβλίων
 *     tags: [Βιβλία]
 *     responses:
 *       200:
 *         description: Λίστα πρόσφατων βιβλίων
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

//  Νέα βιβλία με βάση ημερομηνία δημιουργίας
router.get('/recent', getRecentBooks);
/**
 * @swagger
 * /books/best-sellers:
 *   get:
 *     summary: Λήψη των πιο εμπορικών βιβλίων
 *     tags: [Βιβλία]
 *     responses:
 *       200:
 *         description: Λίστα best-selling βιβλίων
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

// Best sellers με βάση παραγγελίες
router.get('/best-sellers', getBestSellers);

/**
 * @swagger
 * /books/store/{storeId}:
 *   get:
 *     summary: Επιστροφή βιβλίων συγκεκριμένου καταστήματος
 *     tags: [Βιβλία]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Το ID του καταστήματος
 *     responses:
 *       200:
 *         description: Λίστα βιβλίων του καταστήματος
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

//Επιστροφή στοιχειων 
router.get('/store/:storeId', getBooksByStore); // ✅

/* 
===================================
📦 Seller Routes
===================================
*/
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Προσθήκη νέου βιβλίου από πωλητή
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Το βιβλίο προστέθηκε με επιτυχία
 */
//  Προσθήκη νέου βιβλίου
router.post('/', protect, isSeller, addBook);
/**
 * @swagger
 * /books/my:
 *   get:
 *     summary: Λήψη βιβλίων του συνδεδεμένου πωλητή
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Λίστα βιβλίων του πωλητή
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */

//  Προβολή βιβλίων του seller
router.get('/my', protect, isSeller, getMyBooks);
/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Ενημέρωση στοιχείων βιβλίου
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Το βιβλίο ενημερώθηκε
 */

//  Ενημέρωση βιβλίου
router.put('/:id', protect, isSeller, updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Διαγραφή βιβλίου
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Το βιβλίο διαγράφηκε
 */

//  Διαγραφή ενός βιβλίου
router.delete('/:id', protect, isSeller, deleteBook);

/**
 * @swagger
 * /books:
 *   delete:
 *     summary: Διαγραφή όλων των βιβλίων του πωλητή
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Όλα τα βιβλία διαγράφηκαν
 */

// Διαγραφή όλων των βιβλίων του seller
router.delete('/', protect, deleteAllBooksForSeller);

/**
 * @swagger
 * /books/import:
 *   post:
 *     summary: Μαζική εισαγωγή βιβλίων (Excel ή JSON)
 *     tags: [Βιβλία]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Τα βιβλία εισήχθησαν με επιτυχία
 */

//Μαζική εισαγωγή βιβλίων (Excel / JSON)
router.post('/import', protect, isSeller, upload, bulkImportBooks);



export default router;
