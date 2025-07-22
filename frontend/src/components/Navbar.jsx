import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LoginRegister from './LoginRegister';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setUsername(user.username);
    } else {
      setRole(null);
      setUsername(null);
    }
  }, [user]);

  useEffect(() => {
    // Open login modal if ?login=1 is in the URL
    if (new URLSearchParams(location.search).get('login') === '1') {
      setShowLoginModal(true);
      // Optionally, remove the query from the URL after opening
      window.history.replaceState({}, document.title, '/');
    }
  }, [location]);

  useEffect(() => {
    const openLoginModal = () => setShowLoginModal(true);
    window.addEventListener('open-login-modal', openLoginModal);
    return () => window.removeEventListener('open-login-modal', openLoginModal);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setUsername(null);
    setShowLoginModal(false);
    setShowDropdown(false);
    navigate('/');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setRole(localStorage.getItem('role'));
    setUsername(localStorage.getItem('username'));
    navigate('/customer');
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          📚 Bookshop App
        </div>

        <div style={styles.rightSection}>
          {/* ✅ Αν ΔΕΝ είναι login, εμφάνιση μόνο login κουμπιού */}
          {!role && !showLoginModal && (
            <button onClick={() => setShowLoginModal(true)} style={styles.button}>
              🔐 Σύνδεση / Εγγραφή
            </button>
          )}

          {/* ✅ Αν είναι login, εμφάνιση όλων των υπολοίπων */}
          {role && (
            <>
              <button onClick={() => navigate('/books')} style={styles.button}>
                📖 Βιβλία
              </button>

              {role === 'customer' && (
                <button onClick={() => navigate('/cart')} style={styles.button}>
                  🛒 Καλάθι ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </button>
              )}

              <span style={styles.username}>👤 {username}</span>

              {/* Burger Menu */}
              <div style={styles.burgerWrapper}>
                <div style={styles.burger} onClick={() => setShowDropdown((prev) => !prev)}>
                  <div style={styles.line}></div>
                  <div style={styles.line}></div>
                  <div style={styles.line}></div>
                </div>

                {showDropdown && (
                  <div style={styles.dropdown}>
                    {role==='customer'&&(
                      <button onClick={() => navigate('/account')} style={styles.dropdownItem}>
                      👤 Λογαριασμός
                      </button>
                    )}
                    {role==='seller'&&(
                      <button onClick={() => navigate('/seller')} style={styles.dropdownItem}>
                      🧑‍💼 Πίνακας Πωλητή
                      </button>
                    )}
                    

                    {role === 'customer' && (
                      <button onClick={() => navigate('/order-history')} style={styles.dropdownItem}>
                        🧾 Παραγγελίες
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

      {/* Modal login/register */}
      {showLoginModal && (
        <LoginRegister
          closeModal={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );

};

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
