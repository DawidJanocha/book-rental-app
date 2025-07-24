// src/components/LoginRegister.jsx
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const LoginRegister = ({ onLoginSuccess, closeModal }) => {
  // ΔΗΛΩΝΟΥΜΕ STATES ΓΙΑ ΤΑ INPUT ΠΕΔΙΑ ΤΟΥ LOGIN / REGISTER
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('customer');
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();

  // ΣΥΝΑΡΤΗΣΗ ΥΠΟΒΟΛΗΣ ΦΟΡΜΑΣ (LOGIN Ή REGISTER)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister
      ? { email, password, username, role }
      : { email, password };

    try {
      const response = await axios.post(endpoint, payload);

      // ΑΝ ΓΙΝΕΤΑΙ REGISTER ΚΑΙ ΕΙΝΑΙ ΕΠΙΤΥΧΕΣ
      if (isRegister && response.status === 201) {
        alert('✅ Εγγραφή επιτυχής. Συνδέσου τώρα!');
        setIsRegister(false);
        return;
      }

      // ΑΝ ΓΙΝΕΤΑΙ LOGIN
      const { token, user } = response.data;

      // ΑΠΟΘΗΚΕΥΟΥΜΕ ΤΑ ΣΤΟΙΧΕΙΑ ΣΤΟ LOCALSTORAGE
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', user.username);
      localStorage.setItem('email', user.email);

      // ΚΛΕΙΝΟΥΜΕ MODAL ΑΝ ΥΠΑΡΧΕΙ
      if (closeModal) closeModal();

      // ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟΝ ΓΟΝΙΚΟ COMPONENT ΟΤΙ ΕΓΙΝΕ ΣΥΝΔΕΣΗ
      if (onLoginSuccess) onLoginSuccess();

      // ΚΑΝΟΥΜΕ REDIRECT ΜΕ ΒΑΣΗ ΤΟΝ ΡΟΛΟ
      if (user.role === 'customer') {
        navigate('/customer');
      } else if (user.role === 'seller') {
        navigate('/seller');
      }

    } catch (err) {
      console.error('Login/Register error:', err);
      alert('❌ Σφάλμα: ' + (err.response?.data?.message || 'Άγνωστο σφάλμα'));
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '60px auto',
      padding: 24,
      border: '1px solid #ccc',
      borderRadius: 10,
      backgroundColor: '#f9f9f9'
    }}>
      {/* ΤΙΤΛΟΣ ΠΑΝΩ ΑΠΟ ΤΗ ΦΟΡΜΑ */}
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        {isRegister ? '📝 Εγγραφή' : '🔐 Σύνδεση'}
      </h2>

      {/* ΦΟΡΜΑ ΣΥΝΔΕΣΗΣ Ή ΕΓΓΡΑΦΗΣ */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        {isRegister && (
          <>
            {/* ΠΕΔΙΟ ΟΝΟΜΑ ΧΡΗΣΤΗ (ΜΟΝΟ ΣΤΗΝ ΕΓΓΡΑΦΗ) */}
            <input
              type="text"
              placeholder="Όνομα χρήστη"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ marginBottom: 10, padding: 10 }}
            />

            {/* ΕΠΙΛΟΓΗ ΡΟΛΟΥ */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ marginBottom: 10, padding: 10 }}
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </>
        )}

        {/* ΠΕΔΙΟ EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: 10, padding: 10 }}
        />

        {/* ΠΕΔΙΟ ΚΩΔΙΚΟΣ */}
        <input
          type="password"
          placeholder="Κωδικός"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 20, padding: 10 }}
        />

        {/* ΚΟΥΜΠΙ ΥΠΟΒΟΛΗΣ ΦΟΡΜΑΣ */}
        <button
          type="submit"
          style={{
            padding: 10,
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: 4
          }}
        >
          {isRegister ? 'Δημιουργία Λογαριασμού' : 'Σύνδεση'}
        </button>
      </form>

      {/* ΚΟΥΜΠΙ ΕΝΑΛΛΑΓΗΣ ΣΕ ΣΥΝΔΕΣΗ / ΕΓΓΡΑΦΗ */}
      <button
        onClick={() => setIsRegister(!isRegister)}
        style={{
          marginTop: 15,
          background: 'none',
          border: 'none',
          color: '#007bff',
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
      >
        {isRegister
          ? 'Έχεις ήδη λογαριασμό; Σύνδεση'
          : 'Δεν έχεις λογαριασμό; Εγγραφή'}
      </button>
    </div>
  );
};

export default LoginRegister;
