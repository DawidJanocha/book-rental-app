import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

//Σελίδα Πελάτη – Προβολή και ενοικία διαθέσιμων βιβλίων
const CustomerPage = () => {
  const [books, setBooks] = useState([]); // Όλα τα βιβλία
  const [filteredBooks, setFilteredBooks] = useState([]); // Βιβλία μετά από φίλτρα
  const [selectedStore, setSelectedStore] = useState(''); // Επιλεγμένο κατάστημα
  const [searchTerm, setSearchTerm] = useState(''); // Όρος αναζήτησης τίτλου
  const [currentPage, setCurrentPage] = useState(1); // Τρέχουσα σελίδα
  const booksPerPage = 9; // Πλήθος βιβλίων ανά σελίδα

  const { addToCart , cartItems} = useCart(); // Access στο καλάθι
  const isLoggedIn = !!localStorage.getItem('token'); // Έλεγχος σύνδεσης

  //Φόρτωση όλων των διαθέσιμων βιβλίων
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/books');
        setBooks(res.data);
        setFilteredBooks(res.data); // Αρχικά δείξε όλα
      } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση των βιβλίων:', error);
      }
    };
    fetchBooks();
  }, []);

  //Διαχείριση φίλτρων (store + τίτλος)
  useEffect(() => {
    let results = books;

    if (selectedStore) {
      results = results.filter((book) => {
        const storeId = typeof book.store === 'string' ? book.store : book.store?._id;
        return storeId === selectedStore;
      });
    }

    if (searchTerm) {
      results = results.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    results = results.filter((book) => Number(book.quantity) > 0);
// Εξασφαλίζουμε ότι υπάρχουν διαθέσιμα αντίτυπα
    setFilteredBooks(results);
    // Επαναφορά σελίδας όταν αλλάζουν τα αποτελέσματα
    setCurrentPage(1); 
  }, [books, selectedStore, searchTerm]);
  // Διαχείριση ενοικίασης βιβλίου
  const handleRent = (book) => {
    const storeId = typeof book.store === 'string' ? book.store : book.store?._id;
    const cartItem = cartItems.find((item) => item._id === book._id);
    const alreadyInCart = cartItem ? cartItem.quantity : 0;

    if (alreadyInCart >= Number(book.quantity)) {
      alert(`Δεν μπορείς να προσθέσεις περισσότερα από τα διαθέσιμα (${book.quantity}) για το "${book.title}".`);
      return;
    }

    addToCart({
      ...book,
      storeId,
      price: book.rentalPrice || 0,
      quantityAvailable: book.quantity,
    });
  };
// Υπολογισμός σελίδων για pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        📚 Διαθέσιμα Βιβλία
      </h2>

      <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 w-full sm:w-1/3"
        >
          <option value="">Όλα τα Κατάστημα</option>
          {[...new Set(books.map((book) => book.store?._id || book.store))].map((storeId) => {
            const storeObj = books.find((b) => (b.store?._id || b.store) === storeId)?.store;
            return (
              <option key={storeId} value={storeId}>
                {storeObj?.storeName || 'Άγνωστο Κατάστημα'}
              </option>
            );
          })}
        </select>

        <input
          type="text"
          placeholder="🔍 Αναζήτηση τίτλου..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 w-full sm:w-2/3"
        />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentBooks.map((book) => {
            const storeId = book.store?._id || book.store;
            const storeName = book.store?.storeName || 'Άγνωστο κατάστημα';
            const cartItem = cartItems.find((item) => item._id === book._id);
            const alreadyInCart = cartItem ? cartItem.quantity : 0;
            const remaining = Math.max(0, Number(book.quantity) - alreadyInCart);
            const isMax = alreadyInCart >= Number(book.quantity);
            return (
              <div
                key={book._id}
                className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm text-center text-gray-600 mb-2">
                    Από κατάστημα:{' '}
                    {storeId ? (
                      <Link
                        to={`/store/${storeId}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {storeName}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Άγνωστο</span>
                    )}
                  </p>
                  <h3 className="text-lg font-bold text-center mb-2 text-gray-800">{book.title}</h3>
                  <p className="text-sm text-center text-gray-500 mb-1">{book.author}</p>
                  <p className="text-sm text-gray-600 text-center mb-4">{book.description}</p>
                  <p className="text-center font-semibold text-gray-700">
                    Τιμή Ενοικίασης:{' '}
                    {Number(book.rentalPrice?.$numberDecimal || book.rentalPrice || 0).toFixed(2)} €
                  </p>
                  <p className="text-center text-sm text-gray-600 mb-2">
                    Διαθέσιμα:{' '}
                    <span className={Number(book.quantity) < 5 ? "text-red-500 font-bold" : "text-green-700 font-semibold"}>{remaining}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleRent(book)}
                  disabled={!isLoggedIn || isMax}
                  className={`mt-4 w-full font-semibold py-2 px-4 rounded transition duration-200 ${
                    !isLoggedIn || isMax
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-yellow-400 hover:bg-yellow-300 text-black'
                  }`}
                >
                  {!isLoggedIn
                    ? '🔒 Απαιτείται Σύνδεση'
                    : isMax
                    ? '⚠️ Μέγιστη ποσότητα στο καλάθι'
                    : 'Ενοικίαση'}
                </button>
              </div>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <p className="text-center text-gray-500 mt-10">⚠️ Δεν βρέθηκαν βιβλία με αυτά τα φίλτρα.</p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num + 1)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  currentPage === num + 1
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {num + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPage;
