// src/context/CartContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';

// Δημιουργία context
const CartContext = createContext();

// Hook για πρόσβαση
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Φόρτωση από localStorage κατά το mount
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  //  Αποθήκευση στο localStorage όταν αλλάζει το καλάθι
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Προσθήκη βιβλίου στο καλάθι
  // Ελέγχουμε αν το storeId και το rentalPrice είναι έγκυρα
 const addToCart = (book) => {
  setCartItems((prevItems) => {
    const existingItem = prevItems.find((item) => item._id === book._id);
    console.log('Προσθήκη βιβλίου:', book);


// Ελέγχουμε αν το storeId είναι έγκυρο
    const validStoreId =
      typeof book.storeId === 'string' && book.storeId.length === 24
        ? book.storeId
        : book.store?._id && book.store._id.length === 24
        ? book.store._id
        : null;

    if (!validStoreId) {
      console.warn('❌ Προϊόν χωρίς έγκυρο storeId:', book);
      alert('Αυτό το προϊόν δεν μπορεί να προστεθεί στο καλάθι (λείπει storeId).');
      return prevItems;
    }


// Ελέγχουμε αν το rentalPrice είναι έγκυρο
    const rawPrice =
      typeof book.rentalPrice === 'object' && book.rentalPrice !== null
        ? parseFloat(book.rentalPrice.$numberDecimal || 0)
        : parseFloat(book.rentalPrice || 0);


// Ελέγχουμε αν το rawPrice είναι έγκυρο
    const available = Number(book.quantity);

    if (existingItem) {
      console.log('Διαθεσιμότητα:', available);
      console.log('Υπάρχουσα ποσότητα:', existingItem.quantity);
      // Allow adding until you reach the available quantity
      if (existingItem.quantity >= available) {
        alert(`Δεν μπορείς να προσθέσεις περισσότερα αντίτυπα από τα διαθέσιμα (${available}).`);
        return prevItems;
      }
      return prevItems.map((item) =>
        item._id === book._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Επιστρέφουμε νέο αντικείμενο με έγκυρο storeId και rentalPrice
      return [
        ...prevItems,
        {
          ...book,
          rentalPrice: rawPrice,
          quantity: 1,
          storeId: validStoreId,
        },
      ];
    }
  });
};



  // Αφαίρεση προϊόντος
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  // Καθαρισμός καλαθιού
  const clearCart = () => {
    setCartItems([]);
  };

  // Ενημέρωση ποσότητας
  const updateQuantity = (bookId, amount, available) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === bookId) {
          const newQuantity = Math.max(1, Math.min(item.quantity + amount, available));
          if (newQuantity > available) {
            alert(`Δεν μπορείς να προσθέσεις περισσότερα αντίτυπα από τα διαθέσιμα (${available}).`);
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
// Ενημέρωση ποσότητας στο καλάθι
// Ελέγχουμε αν το productId είναι έγκυρο
  const updateQuantityCart = (productId, delta) => {
  setCartItems((prevItems) =>
    prevItems.map((item) =>
      item._id === productId
        ? { ...item, quantity: Math.max(1, Number(item.quantity) + Number(delta)) }
        : item
    )
  );
};

  // Υπολογισμός συνολικού κόστους
  const getCartTotal = () => {
    return cartItems
      .reduce((total, item) => total + (item.rentalPrice || 0) * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        updateQuantityCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getCartTotal, // ✅ νέο
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
