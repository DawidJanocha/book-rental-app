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
    return <div className="text-center text-gray-500 mt-10 text-lg">⏳ Φόρτωση...</div>;
  }

  if (!store) {
    return <div className="text-center text-red-500 mt-10 text-lg">⚠️ Δεν βρέθηκε το κατάστημα.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Τίτλος καταστήματος */}
      <h1 className="text-4xl font-extrabold text-center text-yellow-500 mb-2">{store.storeName}</h1>
      <div className="h-1 w-24 mx-auto bg-yellow-400 rounded mb-8"></div>

      {/* Στοιχεία καταστήματος */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
          <p><span className="font-semibold">📍 Διεύθυνση:</span> {store.address}, {store.postalCode}</p>
          <p><span className="font-semibold">📦 Νομός:</span> {store.region}</p>
          <p><span className="font-semibold">📞 Τηλέφωνο:</span> {store.phone}</p>
          <p><span className="font-semibold">✉️ Email:</span> {store.email}</p>
          <p><span className="font-semibold">🔢 ΑΦΜ:</span> {store.afm}</p>
        </div>
      </div>

      {/* Βιβλία */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📚 Διαθέσιμα Βιβλία
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.length > 0 ? (
          books.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col justify-between border border-gray-100"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">{book.title}</h3>
                <p className="text-sm text-gray-600 text-center italic">{book.author}</p>
                <p className="text-xs text-gray-500 text-center mt-2">{book.description}</p>
              </div>
              <div className="mt-4 text-center">
                <p className="text-md font-semibold text-gray-700">
                  Τιμή Ενοικίασης:{' '}
                  {Number(book.rentalPrice?.$numberDecimal || book.rentalPrice || 0).toFixed(2)} €
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center col-span-full">Δεν υπάρχουν διαθέσιμα βιβλία.</p>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;
