// src/components/Navbar.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { user, logout } = useContext(AuthContext);

  // ΚΡΑΤΑΜΕ ΚΑΤΑΣΤΑΣΗ ΓΙΑ ΝΑ ΔΕΙΧΝΟΥΜΕ Η ΟΧΙ ΤΟ DROPDOWN
  const [showDropdown, setShowDropdown] = useState(false);

  // ΕΛΕΓΧΟΥΜΕ ΑΝ Η URL ΠΕΡΙΕΧΕΙ login=1 ΓΙΑ ΝΑ ΑΝΟΙΞΕΙ ΤΟ MODAL
  useEffect(() => {
    if (new URLSearchParams(location.search).get('login') === '1') {
      onLoginClick();
      window.history.replaceState({}, document.title, '/');
    }
  }, [location, onLoginClick]);

  // LOGOUT ΤΟΥ ΧΡΗΣΤΗ
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <>
      <nav style={styles.navbar}>
        {/* ΛΟΓΟΤΥΠΟ ΠΟΥ ΚΑΝΕΙ REDIRECT ΣΤΗΝ ΑΡΧΙΚΗ */}
        <div style={styles.logo} onClick={() => navigate('/')}>
          📚 Bookshop App
        </div>

        <div style={styles.rightSection}>
          {/* ΑΝ ΔΕΝ ΕΙΝΑΙ ΣΥΝΔΕΔΕΜΕΝΟΣ Ο ΧΡΗΣΤΗΣ */}
          {!user && (
            <button onClick={onLoginClick} style={styles.button}>
              🔐 Σύνδεση / Εγγραφή
            </button>
          )}

          {/* ΑΝ ΕΙΝΑΙ ΣΥΝΔΕΔΕΜΕΝΟΣ */}
          {user && (
            <>
              {/* ΠΛΗΚΤΡΟ ΒΙΒΛΙΑ */}
              <button onClick={() => navigate('/books')} style={styles.button}>
                📖 Βιβλία
              </button>

              {/* ΑΝ ΕΙΝΑΙ CUSTOMER, ΔΕΙΧΝΟΥΜΕ ΚΑΛΑΘΙ */}
              {user.role === 'customer' && (
                <button onClick={() => navigate('/cart')} style={styles.button}>
                  🛒 Καλάθι ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </button>
              )}

              {/* ΠΡΟΒΟΛΗ USERNAME */}
              <span style={styles.username}>👤 {user.username}</span>

              {/* BURGER MENU ΓΙΑ ΠΡΟΦΙΛ / ΠΙΝΑΚΑ / ΑΠΟΣΥΝΔΕΣΗ */}
              <div style={styles.burgerWrapper}>
                <div style={styles.burger} onClick={() => setShowDropdown((prev) => !prev)}>
                  <div style={styles.line}></div>
                  <div style={styles.line}></div>
                  <div style={styles.line}></div>
                </div>

                {/* DROPDOWN ΜΕΝΟΥ */}
                {showDropdown && (
                  <div style={styles.dropdown}>
                    {user.role === 'customer' && (
                      <>
                        <button onClick={() => navigate('/account')} style={styles.dropdownItem}>
                          👤 Λογαριασμός
                        </button>
                        <button onClick={() => navigate('/order-history')} style={styles.dropdownItem}>
                          🧾 Παραγγελίες
                        </button>
                      </>
                    )}
                    {user.role === 'seller' && (
                      <button onClick={() => navigate('/seller')} style={styles.dropdownItem}>
                        🧑‍💼 Πίνακας Πωλητή
                      </button>
                    )}
                    <button onClick={handleLogout} style={styles.dropdownItem}>
                      🚪 Αποσύνδεση
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

// ΣΤΥΛ ΓΙΑ ΤΟ NAVBAR ΚΑΙ ΤΑ ΕΞΑΡΤΩΜΕΝΑ ΣΤΟΙΧΕΙΑ
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ccc',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
  },
  button: {
    padding: '0.4rem 1rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  username: {
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#333',
  },
  burgerWrapper: {
    position: 'relative',
    cursor: 'pointer',
  },
  burger: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0.5rem',
  },
  line: {
    width: '25px',
    height: '3px',
    backgroundColor: '#333',
  },
  dropdown: {
    position: 'absolute',
    top: '2.5rem',
    right: 0,
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    borderRadius: '4px',
    overflow: 'hidden',
    zIndex: 1001,
  },
  dropdownItem: {
    padding: '0.75rem 1.5rem',
    width: '100%',
    backgroundColor: '#fff',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.95rem',
    borderBottom: '1px solid #eee',
  },
};

export default Navbar;

