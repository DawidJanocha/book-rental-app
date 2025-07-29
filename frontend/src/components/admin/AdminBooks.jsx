import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/admin/books');
        setBooks(res.data);
      } catch (err) {
        console.error('Σφάλμα κατά τη λήψη βιβλίων:', err);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">📚 Λίστα Βιβλίων</h2>

      {books.map((book) => (
        <div key={book._id} className="bg-zinc-800 p-4 rounded mb-6 shadow">
          <h3 className="text-lg font-semibold mb-2">📖 {book.title}</h3>
          <p className="text-sm">📅 Δημιουργήθηκε: {new Date(book.createdAt).toLocaleDateString()}</p>
          <p className="text-sm">🏪 Κατάστημα: <strong>{book.storeName}</strong></p>
          <p className="text-sm">
            📬 Email: <a href={`mailto:${book.storeEmail}`} className="text-blue-400 underline">{book.storeEmail}</a>
          </p>
          <p className="text-sm">💰 Τιμή Ενοικίασης: <strong>{book.rentalPrice}€</strong></p>
          <p className="text-sm">📦 Διαθεσιμότητα: <strong>{book.available ? '✅ Διαθέσιμο' : '❌ Μη διαθέσιμο'}</strong></p>
          <p className="text-sm mt-1">🛒 Πωλήσεις: <strong>{book.totalSales}</strong> τεμάχια</p>

          {book.salesDetails.length > 0 ? (
            <div className="mt-3">
              <p className="font-medium underline mb-1">📦 Ιστορικό Αγορών:</p>
              <ul className="ml-4 list-disc text-sm">
                {book.salesDetails.map((sale, index) => (
                  <li key={index} className="mb-1">
                    👤 {sale.customerName || 'Άγνωστος'} ({sale.customerEmail || 'Χωρίς email'}) – 
                    {` ${sale.quantity} τεμ.`} – 
                    🕒 {new Date(sale.purchasedAt).toLocaleString()} – 
                    💶 {sale.totalPrice ? `${sale.totalPrice.toFixed(2)}€` : 'N/A'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">🔸 Δεν υπάρχουν πωλήσεις.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminBooks;
