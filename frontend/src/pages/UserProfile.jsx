import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import './UserProfile.css';
import UserDetailsModal from '../components/UserDetailsModal';
import ChangePasswordModal from '../components/ChangePasswordModal';


// Σελίδα Προφίλ Χρήστη
// Εμφανίζει τα στοιχεία του χρήστη και επιτρέπει την επεξεργασία τους
// Περιλαμβάνει φόρμα για ενημέρωση στοιχείων και modal για αλλαγή κωδικού      
const UserProfile = () => {
  const [userDetails, setUserDetails] = useState({
  firstName: '',
  lastName: '',
  street: '',
  region: '',
  postalCode: '',
  phone: '',
  floor: '',
  doorbell: ''
});
  const [originalDetails, setOriginalDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);


  // Κατάσταση για τα στοιχεία χρήστη 
  useEffect(() => {
    const fetchUserDetails = async () => {
      
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
      }

    };

    fetchUserDetails();
  }, []);


  //  Συνάρτηση για την επεξεργασία των στοιχείων χρήστη
  // Ενημερώνει την κατάσταση με τα νέα στοιχεία και εμφανίζει μήνυμα
  const handleChange = (e) => {
    setUserDetails(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  // Συνάρτηση για την υποβολή της φόρμας
  // Στέλνει τα ενημερωμένα στοιχεία στο backend και εμφανίζει μήνυμα επιτυχίας
  // Αν η υποβολή είναι επιτυχής, ενημερώνει την κατάσταση και  κλείνει το modal
  // Αν αποτύχει, εμφανίζει μήνυμα σφάλματος    
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


  // Συνάρτηση για την ενημέρωση των στοιχείων χρήστη
  // Ενημερώνει την κατάσταση με τα νέα στοιχεία και κλείνει το modal         
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
              <input name="firstName" value={userDetails?.firstName || ''} onChange={handleChange} />

              <label>Επώνυμο:</label>
              <input name="lastName" value={userDetails?.lastName || ''} onChange={handleChange} />

              <label>Οδός:</label>
              <input name="street" value={userDetails?.street || ''} onChange={handleChange} />

              <label>Περιοχή:</label>
              <input name="region" value={userDetails?.region || ''} onChange={handleChange} />

              <label>Τ.Κ.:</label>
              <input name="postalCode" value={userDetails?.postalCode || ''} onChange={handleChange} />

              <label>Τηλέφωνο:</label>
              <input name="phone" value={userDetails?.phone || ''} onChange={handleChange} />

              <label>Όροφος:</label>
              <input name="floor" value={userDetails?.floor || ''} onChange={handleChange} />

              <label>Κουδούνι:</label>
              <input name="doorbell" value={userDetails?.doorbell || ''} onChange={handleChange} />

              <button type="submit">Αποθήκευση</button>
            </form>
          </>
        )}
       {/*Αν τα στοιχεία έχουν υποβληθεί, εμφανίζουμε κουμπιά για προβολή ή αλλαγή κωδικού */}
        {detailsSubmitted && userDetails && (
          <>
            <div className="user-profile-button-row">
              <button onClick={() => {
                setShowDetailsModal(true);
                setShowPasswordModal(false);
              }}>
                Προβολή Στοιχείων
              </button>
                {/* Κουμπί για αλλαγή κωδικού   */}
              <button onClick={() => {
                setShowPasswordModal(true);
                setShowDetailsModal(false);
              }}>
                Αλλαγή Κωδικού
              </button>
            </div>
              {/* Ανάλογα με το ποιο modal είναι ανοιχτό, εμφανίζουμε το αντίστοιχο περιεχόμενο */}
            <div className="user-profile-modal-content">
              {userDetails && showDetailsModal && (
                <UserDetailsModal
                  isOpen={true}
                  onClose={() => setShowDetailsModal(false)}
                  userDetails={userDetails}
                  username={username}
                  onUpdate={handleUpdate}
                />
              )}
                 {/* Modal για αλλαγή κωδικού */}
              {userDetails && showPasswordModal && (
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
