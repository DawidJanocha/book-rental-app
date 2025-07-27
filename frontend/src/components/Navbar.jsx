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

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('login') === '1') {
      onLoginClick();
      window.history.replaceState({}, document.title, '/');
    }
  }, [location, onLoginClick]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate('/')}
      >
        📚 Bookshop App
      </div>

      <div className="flex items-center gap-4 relative">
        {!user && (
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
          >
            🔐 Σύνδεση / Εγγραφή
          </button>
        )}

        {user && (
          <>
            <button
              onClick={() => navigate('/books')}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            >
              📖 Βιβλία
            </button>

            {user.role === 'customer' && (
              <button
                onClick={() => navigate('/cart')}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
              >
                🛒 Καλάθι ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
            )}

            <span className="font-semibold text-gray-700">
              👤 {user.username}
            </span>

            <div className="relative">
              <div
                className="flex flex-col gap-[4px] p-2 cursor-pointer"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <div className="w-[25px] h-[3px] bg-gray-800"></div>
                <div className="w-[25px] h-[3px] bg-gray-800"></div>
                <div className="w-[25px] h-[3px] bg-gray-800"></div>
              </div>

              {showDropdown && (
                <div className="absolute top-[2.5rem] right-0 bg-white shadow-lg rounded border border-gray-100 z-50">
                  {user.role === 'customer' && (
                    <>
                      <button
                        onClick={() => navigate('/account')}
                        className="w-full text-left px-6 py-3 text-sm hover:bg-gray-100"
                      >
                        👤 Λογαριασμός
                      </button>
                      <button
                        onClick={() => navigate('/order-history')}
                        className="w-full text-left px-6 py-3 text-sm hover:bg-gray-100"
                      >
                        🧾 Παραγγελίες
                      </button>
                    </>
                  )}

                  {user.role === 'seller' && (
                    <button
                      onClick={() => navigate('/seller')}
                      className="w-full text-left px-6 py-3 text-sm hover:bg-gray-100"
                    >
                      🧑‍💼 Πίνακας Πωλητή
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin-dashboard')}
                      className="w-full text-left px-6 py-3 text-sm hover:bg-gray-100"
                    >
                      🛠️ Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-3 text-sm hover:bg-gray-100"
                  >
                    🚪 Αποσύνδεση
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
