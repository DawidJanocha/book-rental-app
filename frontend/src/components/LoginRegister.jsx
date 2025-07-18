// src/components/LoginRegister.jsx
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const LoginRegister = ({ onLoginSuccess, closeModal }) => {
  // 🔐 States για input πεδία
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('customer');
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();

  // 🚀 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister
      ? { email, password, username, role }
      : { email, password };

    try {
      const response = await axios.post(endpoint, payload);

      // ✅ Εγγραφή επιτυχής
      if (isRegister && response.status === 201) {
        alert('✅ Εγγραφή επιτυχής. Συνδέσου τώρα!');
        setIsRegister(false);
        return;
      }

      // ✅ Σύνδεση επιτυχής
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', user.username);
      localStorage.setItem('email', user.email);

      console.log(`🔐 Σύνδεση χρήστη: ${user.username} | Ρόλος: ${user.role} | Email: ${user.email}`);

      // 🔄 Κλείσιμο modal (αν υπάρχει)
      if (closeModal) closeModal();

      // ✅ Ενημέρωση γονικού (Navbar)
      if (onLoginSuccess) onLoginSuccess();

      // 🔁 Redirect ανάλογα με τον ρόλο
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
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        {isRegister ? '📝 Εγγραφή' : '🔐 Σύνδεση'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Όνομα χρήστη"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ marginBottom: 10, padding: 10 }}
            />

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

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: 10, padding: 10 }}
        />

        <input
          type="password"
          placeholder="Κωδικός"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 20, padding: 10 }}
        />

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

      {/* 🔄 Εναλλαγή σύνδεσης/εγγραφής */}
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
