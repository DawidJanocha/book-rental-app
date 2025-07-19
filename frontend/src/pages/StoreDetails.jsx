import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axiosInstance';

const StoreDetails = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const res = await axios.get(`/stores/${storeId}`);
        setStore(res.data);
      } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση καταστήματος:', error);
      }
    };

    const fetchStoreBooks = async () => {
      try {
        const res = await axios.get(`/books/store/${storeId}`);
        setBooks(res.data);
      } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση βιβλίων καταστήματος:', error);
      }
    };

    Promise.all([fetchStoreDetails(), fetchStoreBooks()]).finally(() =>
      setLoading(false)
    );
  }, [storeId]);

  if (loading) {
    return <div className="text-center text-gray-600 mt-10">Φόρτωση...</div>;
  }

  if (!store) {
    return <div className="text-center text-red-600 mt-10">Δεν βρέθηκε το κατάστημα.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        📚 {store.storeName}
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <p><strong>📍 Διεύθυνση:</strong> {store.address}, {store.postalCode}</p>
        <p><strong>📦 Νομός:</strong> {store.region}</p>
        <p><strong>📞 Τηλέφωνο:</strong> {store.phone}</p>
        <p><strong>✉️ Email:</strong> {store.email}</p>
        <p><strong>🔢 ΑΦΜ:</strong> {store.afm}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-700">📖 Βιβλία του καταστήματος</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length > 0 ? (
          books.map((book) => (
            <div
              key={book._id}
              className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">{book.title}</h3>
              <p className="text-sm text-gray-600 text-center mb-1">{book.author}</p>
              <p className="text-sm text-gray-500 text-center mb-3">{book.description}</p>
              <p className="text-center text-gray-800 font-semibold">
                Τιμή Ενοικίασης: {Number(book.rentalPrice?.$numberDecimal || book.rentalPrice || 0).toFixed(2)} €
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">Δεν υπάρχουν βιβλία σε αυτό το κατάστημα.</p>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;
