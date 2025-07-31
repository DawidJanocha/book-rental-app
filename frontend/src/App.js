// src/App.js
import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerPage from './pages/CustomerPage';
import SellerPage from './pages/SellerPage';
import CartPage from './pages/CartPage';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import EmailVerification from './pages/EmailVerification';
import SellerStoreForm from './components/SellerStoreForm';
import StoreCreate from './pages/StoreCreate';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/OrderHistory'; 
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import StoreDetails from './pages/StoreDetails';
import ForbiddenPage from './pages/ForbiddenPage';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import LoginModal from './components/LoginModal';
import AdminDashboard from './pages/AdminDashboard';
import ContactForm from './pages/ContactForm';
import { useLocation } from "react-router-dom";
import PasswordResend from './pages/PasswordResend';
import PasswordReset from './pages/PasswordReset'; // αν έχεις σελίδα reset



// Κύρια συνάρτηση του App που περιέχει τις διαδρομές και το περιεχόμενο της εφαρμογής
// Χρησιμοποιεί το AuthProvider για να παρέχει το context του χρήστη σε όλη την εφαρμογή
// Χρησιμοποιεί το CartProvider για να παρέχει το καλάθι αγορών   
function AppContent() {
  const { user } = useContext(AuthContext);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("loginModal") === "open") {
    setIsLoginModalOpen(true);
    // Remove the query param from the URL
    const newParams = new URLSearchParams(location.search);
    newParams.delete("loginModal");
    window.history.replaceState({}, '', `${location.pathname}?${newParams.toString()}`);
  }
  }, [location]);
  
// Συνάρτηση για το άνοιγμα και κλείσιμο του modal σύνδεσης
  // Χρησιμοποιείται για να εμφανίζει το modal σύνδεσης όταν ο χρήστης δεν είναι συνδεδεμένος
  // και να το κλείνει όταν ο χρήστης συνδεθεί ή ακυρώσει τη σύνδεση
  // Επίσης, χρησιμοποιείται για να ανακατευθύνει τον χρήστη  
  const handleLoginOpen = () => setIsLoginModalOpen(true);

  // Συνάρτηση για το κλείσιμο του modal σύνδεσης
  // Χρησιμοποιείται για να κλείνει το modal όταν ο χρήστης ολο κληρώσει τη σύνδεση ή ακυρώσει τη διαδικασία
  // Επίσης, μπορεί να ανακατευθύνει τον χρήστη σε άλλη σελίδα αν χρειάζεται
  // π.χ. στο κύριο περιεχόμενο της εφαρμογής ή σε μια σελίδα προφίλ
  // Αν ο χρήστης είναι συνδεδεμένος, το modal δεν εμφανίζεται
  const handleLoginClose = () => setIsLoginModalOpen(false);
  

  return (
    <>
      <Navbar onLoginClick={handleLoginOpen} />

      <Routes>
        <Route path="/mainpage" element={<MainPage />} /> {/*// Κύρια σελίδα της εφαρμογής*/}
        <Route path="/" element={<Navigate to="/mainpage" replace />} /> {/*// Ανακατεύθυνση στην κύρια σελίδα*/}
        <Route path="/register" element={<Navigate to="/" replace />} /> {/*// Ανακατεύθυνση στη σελίδα σύνδεσης  */} 
        <Route path="/login" element={<Navigate to="/" replace />} /> {/*// Ανακατεύθυνση στη σελίδα σύνδεσης*/}
        <Route path="/customer" element={<CustomerPage />} /> {/*// Σελίδα πελάτη με προϊόντα και καλάθι αγορών*/}
        <Route path="/seller" element={<SellerPage />} /> {/*// Σελίδα πωλητή με δυνατότητα διαχείρισης καταστήματος και προϊόντων*/}
        <Route path="/cart" element={<CartPage />} />  {/* // Σελίδα καλαθιού αγορών με δυνατότητα προβολής και επεξεργασίας προϊόντων*/}
        <Route path="/account" element={<UserProfile />} />   {/*// Σελίδα προφίλ χρήστη με δυνατότητα προβολής και επεξεργασίας στοιχείων*/}
        <Route path="/verify/:token" element={<EmailVerification />} />  {/* // Σελίδα επαλήθευσης email με βάση το token που αποστέλλεται κατά την εγγραφή*/}
        <Route path="/store/create" element={<SellerStoreForm />} />   {/* // Σελίδα δημιουργίας καταστήματος για πωλητές*/}
        <Route path="/storecreate" element={<StoreCreate />} />  {/* // Σελίδα δημιουργίας καταστήματος για πωλητές*/}
        <Route path="/forbidden" element={<ForbiddenPage />} />  {/* // Σελίδα απαγορευμένης πρόσβασης για χρήστες που δεν έχουν δικαίωμα πρόσβασης σε συγκεκριμένες λειτουργίες*/}
        <Route path="/store/:storeId" element={<StoreDetails />} />  {/* // Σελίδα προβολής καταστήματος με βάση το storeId*/}
        <Route path="/contact" element={<ContactForm />} /> {/* // Σελίδα επικοινωνίας για αποστολή μηνυμάτων ή ερωτήσεων*/}    
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
         <Route path="/password-resend" element={<PasswordResend />} />
        <Route path="/password-reset" element={<PasswordReset />} />

          <Route
          path="/order-history"
          element={
            <ProtectedRoute role="customer">
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <CustomerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      {isLoginModalOpen && <LoginModal onClose={handleLoginClose} />}
      <Footer />
    </>
  );
}

function App() {

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}




export default App;
