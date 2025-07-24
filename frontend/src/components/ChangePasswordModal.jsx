import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import './UserDetailsModal.css'; // ΧΡΗΣΙΜΟΠΟΙΟΥΜΕ ΤΟ ΙΔΙΟ CSS ΜΕ ΤΟ USERDETAILSMODAL

// MODAL ΓΙΑ ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ ΧΡΗΣΤΗ
const ChangePasswordModal = ({ isOpen, onClose }) => {
  // STATE ΓΙΑ ΠΑΛΙΟ ΚΑΙ ΝΕΟ ΚΩΔΙΚΟ
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState(''); // ΜΗΝΥΜΑ ΕΠΙΤΥΧΙΑΣ Η ΑΠΟΤΥΧΙΑΣ

  // ΕΝΗΜΕΡΩΣΗ STATE ΚΑΘΩΣ ΠΛΗΚΤΡΟΛΟΓΕΙ Ο ΧΡΗΣΤΗΣ
  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // ΑΠΟΣΤΟΛΗ ΝΕΩΝ ΚΩΔΙΚΩΝ ΣΤΟ BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/user/password', passwords);
      setMessage('Ο ΚΩΔΙΚΟΣ ΑΛΛΑΞΕ ΕΠΙΤΥΧΩΣ');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setMessage('ΣΦΑΛΜΑ ΣΤΗΝ ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ');
    }
  };

  // ΑΝ ΤΟ MODAL ΔΕΝ ΕΙΝΑΙ ΑΝΟΙΧΤΟ, ΜΗΝ ΔΕΙΞΕΙ ΤΙΠΟΤΑ
  if (!isOpen) return null;

  // ΕΜΦΑΝΙΣΗ ΤΟΥ MODAL
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ</h2>

        {message && <p className="user-profile-message">{message}</p>}

        <form onSubmit={handleSubmit} className="user-profile-form">
          <label>ΤΡΕΧΩΝ ΚΩΔΙΚΟΣ:</label>
          <input
            type="password"
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handleChange}
            required
          />

          <label>ΝΕΟΣ ΚΩΔΙΚΟΣ:</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />

          <button type="submit">ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ</button>
        </form>

        <button onClick={onClose} style={{ marginTop: '1rem' }}>
          ΚΛΕΙΣΙΜΟ
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
