import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import './UserDetailsModal.css'; // Χρησιμοποιούμε το ίδιο CSS με το UserDetailsModal

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/user/password', passwords);
      setMessage('✅ Ο κωδικός άλλαξε επιτυχώς.');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setMessage('❌ Σφάλμα στην αλλαγή κωδικού.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Αλλαγή Κωδικού</h2>

        {message && <p className="user-profile-message">{message}</p>}

        <form onSubmit={handleSubmit} className="user-profile-form">
          <label>Τρέχων Κωδικός:</label>
          <input
            type="password"
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handleChange}
            required
          />

          <label>Νέος Κωδικός:</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />

          <button type="submit">Αλλαγή Κωδικού</button>
        </form>

        <button onClick={onClose} style={{ marginTop: '1rem' }}>
          Κλείσιμο
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
