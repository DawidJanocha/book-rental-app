// src/pages/CartPage.js

import React, { useState } from 'react';
import './CartPage.css';
import { useCart } from '../context/CartContext';
import axios from '../utils/axiosInstance';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const CartPage = () => {
  // ΠΡΟΣΠΕΛΑΣΗ ΤΟΥ CONTEXT ΤΟΥ ΚΑΛΑΘΙΟΥ
  const {
    cartItems,
    removeFromCart,
    updateQuantityCart,
    clearCart,
    getCartTotal,
  } = useCart();

  // STATES ΓΙΑ ΤΗΝ ΠΑΡΑΓΓΕΛΙΑ
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerComment, setCustomerComment] = useState('');

  // ΥΠΟΛΟΓΙΣΜΟΣ ΣΥΝΟΛΟΥ ΠΑΡΑΓΓΕΛΙΑΣ
  const total =
    typeof getCartTotal === 'function'
      ? Number(getCartTotal()) || 0
      : cartItems.reduce((acc, item) => acc + item.rentalPrice * item.quantity, 0);

  // ΧΕΙΡΙΣΜΟΣ ΑΛΛΑΓΗΣ ΠΟΣΟΤΗΤΑΣ ΠΡΟΪΟΝΤΟΣ
  const handleQuantityChange = (productId, delta) => {
    const item = cartItems.find((item) => item._id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantityCart(productId, delta);
    }
  };

  // ΥΠΟΒΟΛΗ ΠΑΡΑΓΓΕΛΙΑΣ
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setErrorMessage('Το καλάθι είναι άδειο.');
      return;
    }

    try {
      setIsProcessing(true);

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token) {
        setErrorMessage('Δεν είστε συνδεδεμένος.');
        setIsProcessing(false);
        return;
      }

      const storeId = cartItems[0]?.storeId;

      const items = cartItems.map((item) => ({
        bookId: item._id,
        title: item.title,
        price: Number(item.rentalPrice),
        quantity: item.quantity,
      }));

      const response = await axios.post(
        '/order/complete',
        {
          items,
          storeId,
          totalCost: total.toFixed(2),
          customerComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        clearCart();
        setSuccessMessage('Η παραγγελία ολοκληρώθηκε με επιτυχία!');
        setMessage('');
        setComments('');
      } else {
        setErrorMessage('Κάτι πήγε στραβά κατά την παραγγελία.');
      }
    } catch (error) {
      setErrorMessage('Σφάλμα κατά την παραγγελία.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="cart-page">
      <h2>🛒 Το καλάθι μου</h2>

      {cartItems.length === 0 ? (
        <p>Το καλάθι σου είναι άδειο.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <h3>{item.name}</h3>
              <p>🍽️ Τίτλος: {item.title}</p>
              <p>📜 Περιγραφή: {item.description}</p>
              <p>
                💰 Τιμή:{' '}
                {item.price !== undefined ? `${Number(item.rentalPrice).toFixed(2)} €` : 'Χωρίς τιμή'}
              </p>

              {/* ΠΛΗΚΤΡΑ ΑΛΛΑΓΗΣ ΠΟΣΟΤΗΤΑΣ */}
              <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦 Ποσότητα:</span>
                <button
                  onClick={() => handleQuantityChange(item._id, -1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#f3f4f6',
                    color: '#111',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <FaMinus />
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, 1)}
                  disabled={item.quantity >= (item.quantityAvailable ?? Infinity)}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: item.quantity >= (item.quantityAvailable ?? Infinity) ? '#e5e7eb' : '#fbbf24',
                    color: item.quantity >= (item.quantityAvailable ?? Infinity) ? '#9ca3af' : '#111',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: item.quantity >= (item.quantityAvailable ?? Infinity) ? 'not-allowed' : 'pointer',
                    opacity: item.quantity >= (item.quantityAvailable ?? Infinity) ? 0.6 : 1,
                    transition: 'background 0.2s, color 0.2s, opacity 0.2s',
                  }}
                  title={item.quantity >= (item.quantityAvailable ?? Infinity) ? 'Έφτασες το μέγιστο διαθέσιμο' : 'Αύξηση ποσότητας'}
                >
                  <FaPlus />
                </button>
              </div>

              {/* ΚΟΥΜΠΙ ΑΦΑΙΡΕΣΗΣ ΑΠΟ ΤΟ ΚΑΛΑΘΙ */}
              <button
                className="remove-button"
                onClick={() => removeFromCart(item._id)}
              >
                <FaTrash /> Αφαίρεση
              </button>
            </div>
          ))}

          {/* ΠΕΡΙΛΗΨΗ ΠΑΡΑΓΓΕΛΙΑΣ */}
          <div className="cart-summary">
            <p>🧾 Προϊόντα: {cartItems.length}</p>
            <p>💶 Σύνολο: {total.toFixed(2)} €</p>
            <textarea
              placeholder="📝 Προσθέστε προαιρετικά σχόλια..."
              value={customerComment}
              onChange={(e) => setCustomerComment(e.target.value)}
            />
            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ Επεξεργασία...' : '✅ Ολοκλήρωση Παραγγελίας'}
            </button>

            {/* ΜΗΝΥΜΑΤΑ ΕΠΙΤΥΧΙΑΣ / ΣΦΑΛΜΑΤΟΣ */}
            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
