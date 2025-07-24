// src/pages/MainPage.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Autoplay } from 'swiper/modules';

const MainPage = () => {
  // ΚΡΑΤΑΜΕ ΤΙΣ ΠΡΟΣΦΑΤΕΣ ΚΑΙ BEST SELLER ΚΥΚΛΟΦΟΡΙΕΣ
  const [recentBooks, setRecentBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  // ΦΟΡΤΩΝΟΥΜΕ ΔΕΔΟΜΕΝΑ ΟΤΑΝ ΦΟΡΤΩΝΕΙ Η ΣΕΛΙΔΑ
  useEffect(() => {
    fetchRecentBooks();
    fetchBestSellers();
  }, []);

  // ΦΕΡΝΕΙ ΟΛΑ ΤΑ ΒΙΒΛΙΑ ΚΑΙ ΦΙΛΤΡΑΡΕΙ ΤΑ ΤΕΛΕΥΤΑΙΑ 48 ΩΡΩΝ
  const fetchRecentBooks = async () => {
    try {
      const response = await axios.get('/books');
      const now = new Date();
      const filtered = response.data.filter((book) => {
        const bookDate = new Date(book.createdAt);
        const diffInHours = (now - bookDate) / 1000 / 60 / 60;
        return diffInHours <= 48;
      });
      setRecentBooks(filtered);
    } catch (error) {
      console.error('Σφάλμα κατά την ανάκτηση νέων βιβλίων:', error);
    }
  };

  // ΦΕΡΝΕΙ ΤΑ BEST SELLERS ΑΠΟ ΤΟ BACKEND
  const fetchBestSellers = async () => {
    try {
      const response = await axios.get('/books/best-sellers');
      setBestSellers(response.data);
    } catch (error) {
      console.error('Σφάλμα κατά την ανάκτηση best sellers:', error);
    }
  };

  // ΕΛΕΓΧΕΙ ΑΝ ΤΟ ΒΙΒΛΙΟ ΕΙΝΑΙ ΝΕΟ (ΚΑΤΩ ΑΠΟ 48 ΩΡΕΣ)
  const isNewBook = (createdAt) => {
    const now = new Date();
    const bookDate = new Date(createdAt);
    const diffInHours = (now - bookDate) / 1000 / 60 / 60;
    return diffInHours <= 48;
  };

  // ΚΑΡΤΑ ΒΙΒΛΙΟΥ ΠΟΥ ΠΡΟΒΑΛΛΕΤΑΙ ΣΕ SWIPER
  const renderBookCard = (book) => (
    <div key={book._id} className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-800 text-base truncate max-w-[90%]">{book.title}</span>
        {isNewBook(book.createdAt) && (
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">NEW</span>
        )}
      </div>
      <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
    </div>
  );

  return (
    <div className="px-4 py-12 bg-gradient-to-b from-yellow-50 via-white to-yellow-100 min-h-screen flex justify-center">
      <div className="w-full max-w-screen-xl">
        {/* ΤΙΤΛΟΣ ΣΕΛΙΔΑΣ */}
        <h1 className="text-4xl font-extrabold text-center text-green-800 mb-4">📚 Book Rental App</h1>

        {/* ΣΥΝΤΟΜΗ ΠΕΡΙΓΡΑΦΗ */}
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12 text-lg">
          Καλωσορίσατε στην 1η ελληνική πλατφόρμα για ενοικίαση βιβλίων!<br />
          Υποστηρίζουμε τοπικά βιβλιοπωλεία και συγγραφείς σε όλη την Ελλάδα.
        </p>

        {/* ΤΜΗΜΑ ΝΕΩΝ ΚΑΙ BEST SELLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {/* ΝΕΑ ΒΙΒΛΙΑ */}
          <div className="bg-white border border-green-500 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">🆕 Νέες αφίξεις </h2>
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop={true}
              modules={[Pagination, Autoplay]}
            >
              {recentBooks.map((book) => (
                <SwiperSlide key={book._id}>{renderBookCard(book)}</SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* ΔΗΜΟΦΙΛΗ ΒΙΒΛΙΑ */}
          <div className="bg-white border border-blue-500 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">⭐ Δημοφιλέστερα Βιβλία</h2>
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop={true}
              modules={[Pagination, Autoplay]}
            >
              {bestSellers.map((book) => (
                <SwiperSlide key={book._id}>{renderBookCard(book)}</SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* ΚΟΥΜΠΙ ΠΡΟΣΒΑΣΗΣ ΣΕ ΟΛΑ ΤΑ ΒΙΒΛΙΑ */}
        <div className="text-center mb-20">
          <Link
            to="/books"
            className="inline-block bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
          >
            📚 Δείτε όλα τα βιβλία
          </Link>
        </div>

        {/* ΕΝΟΤΗΤΑ ΕΠΙΚΟΙΝΩΝΙΑΣ */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">📬 Επικοινωνία</h2>
          <p className="text-gray-700 mb-1">Έχεις απορίες ή χρειάζεσαι βοήθεια με την παραγγελία σου;</p>
         <p>
  <Link to="/contact" className="text-blue-600 hover:underline">
    bookdelivery@app.gr
  </Link>
</p>
        </section>
      </div>
    </div>
  );
};

export default MainPage;
