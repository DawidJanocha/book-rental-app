import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import './MainPage.css';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick'; 

const MainPage = () => {
  const [recentBooks, setRecentBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    fetchRecentBooks();
    fetchBestSellers();
  }, []);

  const fetchRecentBooks = async () => {
    try {
      const response = await axios.get('/books/recent');
      setRecentBooks(response.data);
    } catch (error) {
      console.error('Σφάλμα κατά την ανάκτηση νέων βιβλίων:', error);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const response = await axios.get('/books/best-sellers');
      setBestSellers(response.data);
    } catch (error) {
      console.error('Σφάλμα κατά την ανάκτηση best sellers:', error);
    }
  };

  const isNewBook = (createdAt) => {
    const now = new Date();
    const bookDate = new Date(createdAt);
    const diffInHours = (now - bookDate) / 1000 / 60 / 60;
    return diffInHours <= 48;
  };

  return (
    <div className="main-page">
      <h1 className="main-title">📗 Book Delivery App</h1>
      <p className="main-subtitle">
        Καλωσορίσατε στην 1η ελληνική πλατφόρμα για παράδοση βιβλίων κατ’ οίκον! 
        Υποστηρίζουμε τοπικά βιβλιοπωλεία και συγγραφείς σε όλη την Ελλάδα.
      </p>

 <section className="book-section">
  <h2 className="section-title">🆕 Νέα Βιβλία</h2>
    <Slider
  dots={true}
  infinite={true}
  speed={500}
  autoplay={true}
  autoplaySpeed={3000} // κάθε 3 δευτερόλεπτα
  slidesToShow={3}
  slidesToScroll={1}
  responsive={[
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 1 } }
  ]}
  >
    {recentBooks.map((book) => (
      <div key={book._id} className="book-item">
        <div className="book-info">
          <div className="book-header">
            <span className="book-title">{book.title}</span>
            {isNewBook(book.createdAt) && (
              <span className="new-label">NEW</span>
            )}
          </div>
          <p className="book-description">{book.description}</p>
        </div>
      </div>
    ))}
  </Slider>


  
</section>
<div className="view-all-container">
  <Link to="/books" className="view-all-button">
    📚 Δείτε όλα τα βιβλία
  </Link>
</div>

<section className="book-section">
  <h2 className="section-title">⭐ Δημοφιλέστερα Βιβλία</h2>
  <Slider
  dots={true}
  infinite={true}
  speed={500}
  autoplay={true}
  autoplaySpeed={3000} // κάθε 3 δευτερόλεπτα
  slidesToShow={3}
  slidesToScroll={1}
  responsive={[
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 1 } }
  ]}
  >
    {bestSellers.map((book) => (
      <div key={book._id} className="book-item">
        <div className="book-info">
          <span className="book-title">{book.title}</span>
          <p className="book-description">{book.description}</p>
        </div>
      </div>
    ))}
  </Slider>

  
</section>

<section><div className="view-all-container">
  <Link to="/books" className="view-all-button">
    📚 Δείτε όλα τα βιβλία
  </Link>
</div></section>


      <section className="contact-section">
        <h2 className="section-title">📬 Επικοινωνία</h2>
        <p>
          Έχεις απορίες ή χρειάζεσαι βοήθεια με την παραγγελία σου; 
          Επικοινώνησε μαζί μας:
        </p>
        <p>
          <a href="mailto:bookdelivery@app.gr" className="contact-email">
            bookdelivery@app.gr
          </a>
        </p>
      </section>
    </div>
  );
};

export default MainPage;

