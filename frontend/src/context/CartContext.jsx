// src/context/CartContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';

// Δημιουργία context
const CartContext = createContext();

// Hook για πρόσβαση
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 👉 Φόρτωση από localStorage κατά το mount
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  // 👉 Αποθήκευση στο localStorage όταν αλλάζει το καλάθι
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ➕ Προσθήκη προϊόντος
 const addToCart = (book) => {
  setCartItems((prevItems) => {
    const existingItem = prevItems.find((item) => item._id === book._id);

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

    const rawPrice =
      typeof book.rentalPrice === 'object' && book.rentalPrice !== null
        ? parseFloat(book.rentalPrice.$numberDecimal || 0)
        : parseFloat(book.rentalPrice || 0);

    if (existingItem) {
      // ✅ Αν υπάρχει ήδη στο καλάθι, αύξησε ποσότητα
      return prevItems.map((item) =>
        item._id === book._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // ✅ Αν είναι καινούριο, πρόσθεσέ το με storeId
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



  // ➖ Αφαίρεση προϊόντος
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  // ❌ Καθαρισμός καλαθιού
  const clearCart = () => {
    setCartItems([]);
  };

  // 🔁 Ενημέρωση ποσότητας
  const updateQuantity = (bookId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === bookId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  // 💰 Υπολογισμός συνολικού κόστους
  const getCartTotal = () => {
    return cartItems
      .reduce((total, item) => total + (item.rentalPrice || 0) * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
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
