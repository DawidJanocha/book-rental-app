import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import './UserProfile.css';
import UserDetailsModal from '../components/UserDetailsModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [originalDetails, setOriginalDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log('📦 Fetching user details...')
      try {
        const { data } = await axios.get('/user/details');
        const cleanData = {
          firstName: data?.firstName || '',
          lastName: data?.lastName || '',
          street: data?.street || '',
          region: data?.region || '',
          postalCode: data?.postalCode || '',
          phone: data?.phone || '',
          floor: data?.floor || '',
          doorbell: data?.doorbell || ''
        };
        setUserDetails(cleanData);
        setOriginalDetails(cleanData);
        setUsername(data.username || '');
        setDetailsSubmitted(
         Object.values(cleanData).every(val => String(val).trim() !== '')
);
      } catch (err) {
            console.error('❌ FULL FETCH ERROR:', err);
            setMessage('Error loading user details: ' + (err.response?.data?.message || err.message));
      }

    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setUserDetails(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/user/details', userDetails);
      setMessage('Τα στοιχεία αποθηκεύτηκαν.');
      setOriginalDetails(userDetails);
      setDetailsSubmitted(true);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('❌ Αποτυχία αποθήκευσης:', err);
      setMessage('Αποτυχία αποθήκευσης.');
    }
  };

  const handleUpdate = (updatedUser) => {
    setUserDetails(updatedUser);
    setOriginalDetails(updatedUser);
    setDetailsSubmitted(true);
    setShowDetailsModal(false);
  };

  return (
    <div className="user-profile-wrapper">
      <div className="user-profile-box">
        {!detailsSubmitted && userDetails && (
          <>
            <h2>Συμπλήρωσε τα Στοιχεία σου</h2>
            {message && <p className="user-profile-message">{message}</p>}

            <form onSubmit={handleSubmit} className="user-profile-form">
              <label>Όνομα:</label>
              <input name="firstName" value={userDetails.firstName} onChange={handleChange} />

              <label>Επώνυμο:</label>
              <input name="lastName" value={userDetails.lastName} onChange={handleChange} />

              <label>Οδός:</label>
              <input name="street" value={userDetails.street} onChange={handleChange} />

              <label>Περιοχή:</label>
              <input name="region" value={userDetails.region} onChange={handleChange} />

              <label>Τ.Κ.:</label>
              <input name="postalCode" value={userDetails.postalCode} onChange={handleChange} />

              <label>Τηλέφωνο:</label>
              <input name="phone" value={userDetails.phone} onChange={handleChange} />

              <label>Όροφος:</label>
              <input name="floor" value={userDetails.floor} onChange={handleChange} />

              <label>Κουδούνι:</label>
              <input name="doorbell" value={userDetails.doorbell} onChange={handleChange} />

              <button type="submit">Αποθήκευση</button>
            </form>
          </>
        )}

        {detailsSubmitted && userDetails && (
          <>
            <div className="user-profile-button-row">
              <button onClick={() => {
                setShowDetailsModal(true);
                setShowPasswordModal(false);
              }}>
                Προβολή Στοιχείων
              </button>

              <button onClick={() => {
                setShowPasswordModal(true);
                setShowDetailsModal(false);
              }}>
                Αλλαγή Κωδικού
              </button>
            </div>

            <div className="user-profile-modal-content">
              {showDetailsModal && (
                <UserDetailsModal
                  isOpen={true}
                  onClose={() => setShowDetailsModal(false)}
                  userDetails={userDetails}
                  username={username}
                  onUpdate={handleUpdate}
                />
              )}

              {showPasswordModal && (
                <ChangePasswordModal
                  isOpen={true}
                  onClose={() => setShowPasswordModal(false)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
