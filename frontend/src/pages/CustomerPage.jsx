import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useCart } from '../context/CartContext';

const CustomerPage = () => {
  const [books, setBooks] = useState([]);
  const { addToCart } = useCart();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/books');
        setBooks(res.data);
      } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση των βιβλίων:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleRent = (book) => {
    const storeId =
      typeof book.store === 'string'
        ? book.store
        : book.store?._id;

    if (!storeId) {
      alert(`Το βιβλίο "${book.title}" δεν μπορεί να προστεθεί (λείπει το κατάστημα).`);
      return;
    }

    addToCart({
      ...book,
      storeId,
      price: book.rentalPrice || 0,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        📚 Διαθέσιμα Βιβλία
      </h2>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div
              key={book._id}
              className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-center mb-2 text-gray-800">{book.title}</h3>
                <p className="text-sm text-center text-gray-500 mb-1">{book.author}</p>
                <p className="text-sm text-gray-600 text-center mb-4">{book.description}</p>
                <p className="text-center font-semibold text-gray-700">
                  Τιμή Ενοικίασης: {Number(book.rentalPrice?.$numberDecimal || book.rentalPrice || 0).toFixed(2)}  €
                </p>
              </div>

              <button
                onClick={() => handleRent(book)}
                disabled={!isLoggedIn}
                className={`mt-4 w-full font-semibold py-2 px-4 rounded transition duration-200 ${
                  isLoggedIn
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isLoggedIn ? '🛒 Ενοικίαση' : '🔒 Απαιτείται Σύνδεση'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
