// src/components/LoginModal.jsx
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';


function LoginModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
    const handleSubmit = async (e) => {
    e.preventDefault();

    const data = isRegister
      ? { email, password, username, role }
      : { email, password };

    try {
      const res = await axios.post(
        isRegister ? '/auth/register' : '/auth/login',
        data
      );

      if (isRegister && res.status === 201) {
        alert('✅ Εγγραφή επιτυχής. Κάνε σύνδεση!');
        setIsRegister(false);
        return;
      }

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);

      if (user.role === 'customer') {
        navigate('/');
      } else if (user.role === 'partner') {
        navigate('/partner-dashboard');
      }

      onClose();
    } catch (err) {
      alert('❌ Σφάλμα: ' + (err.response?.data?.message || 'Άγνωστο σφάλμα'));
    }
  };
    return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isRegister ? 'Εγγραφή Χρήστη' : 'Σύνδεση Χρήστη'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Όνομα χρήστη"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Πελάτης</option>
                <option value="partner">Συνεργάτης</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Κωδικός"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="submit-btn">
            {isRegister ? 'Εγγραφή' : 'Σύνδεση'}
          </button>
        </form>

        <div className="modal-footer">
          <button onClick={() => setIsRegister(!isRegister)} className="toggle-btn">
            {isRegister ? 'Έχεις λογαριασμό; Σύνδεση' : 'Δεν έχεις λογαριασμό; Εγγραφή'}
          </button>
          <button onClick={onClose} className="close-btn">Έξοδος</button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;