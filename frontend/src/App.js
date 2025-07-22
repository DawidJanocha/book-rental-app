// src/App.js
import React, { useContext } from 'react';
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

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Navbar />
      <Routes>
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

        <Route path="/books" element={ <ProtectedRoute> <CustomerPage /> </ProtectedRoute>} />

      </Routes>
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
