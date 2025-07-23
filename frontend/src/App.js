// src/App.js
import React, { useContext, useState } from 'react';
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

function AppContent() {
  const { user } = useContext(AuthContext);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginOpen = () => setIsLoginModalOpen(true);
  const handleLoginClose = () => setIsLoginModalOpen(false);

  return (
    <>
      <Navbar onLoginClick={handleLoginOpen} />

      <Routes>
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/" element={<Navigate to="/mainpage" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/seller" element={<SellerPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<UserProfile />} />
        <Route path="/verify/:token" element={<EmailVerification />} />
        <Route path="/store/create" element={<SellerStoreForm />} />
        <Route path="/storecreate" element={<StoreCreate />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/store/:storeId" element={<StoreDetails />} />
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
