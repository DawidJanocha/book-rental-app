import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 📌 Φόρτωση χρήστη από localStorage στην αρχή
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  // ✅ Επαλήθευση του token στο backend (προαιρετικό αλλά καλό για έλεγχο εγκυρότητας)
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data } = await axios.get('/auth/profile');
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data)); // Αν είναι οκ, ενημέρωσε το localStorage
      } catch (err) {
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // ✅ Login
  const login = async (credentials) => {
    const { data } = await axios.post('/auth/login', credentials);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token); // Αν θέλεις να κρατάς και το token χωριστά
    return data;
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
