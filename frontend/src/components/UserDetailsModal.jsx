//  frontend/src/components/UserDetailsModal.jsx

import React, { useState } from 'react';
import './UserDetailsModal.css';
import axios from '../utils/axiosInstance';

const UserDetailsModal = ({ isOpen, onClose, userDetails, username, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(userDetails);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setEditedDetails({ ...editedDetails, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.post('/user/details', editedDetails);
      setMessage('✅ Τα στοιχεία ενημερώθηκαν.');
      onUpdate(editedDetails); 
      setIsEditing(false);
    } catch (err) {
      setMessage('❌ Σφάλμα κατά την ενημέρωση.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Στοιχεία {username}</h2>

        {message && <p className="user-profile-message">{message}</p>}

        {['firstName', 'lastName', 'street', 'region', 'postalCode', 'phone', 'floor', 'doorbell'].map((field) => (
          <div key={field} style={{ marginBottom: '0.5rem' }}>
            <label><strong>{field === 'firstName' ? 'Όνομα' :
                             field === 'lastName' ? 'Επώνυμο' :
                             field === 'street' ? 'Οδός' :
                             field === 'region' ? 'Περιοχή' :
                             field === 'postalCode' ? 'Τ.Κ.' : 
                             field === 'phone'? 'Τηλέφωνο':
                             field === 'floor'? 'Όροφος': 'Κουδούνι'}:</strong></label>
            {isEditing ? (
              <input
                type="text"
                name={field}
                value={editedDetails[field]}
                onChange={handleChange}
              />
            ) : (
              <p> {userDetails[field]}</p>
            )}
          </div>
        ))}

        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>Ενημέρωση Στοιχείων</button>
        ) : (
          <>
            <button onClick={handleUpdate}>Αποθήκευση</button>
            <button onClick={() => {
              setIsEditing(false);
              setEditedDetails(userDetails);
              setMessage('');
            }} style={{ marginTop: '0.5rem' }}>
              Ακύρωση
            </button>
          </>
        )}

        <button onClick={onClose} style={{ marginTop: '1.5rem' }}>
          Κλείσιμο
        </button>
      </div>
    </div>
  );
};

export default UserDetailsModal;
