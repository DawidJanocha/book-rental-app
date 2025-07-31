// src/components/LoginModal.jsx
import React, { useState, useContext } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  const navigate = useNavigate();
  const { login, setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isRegister
      ? { email, password, username, role }
      : { email, password };

    try {
      if (isRegister) {
        const res = await axios.post('/auth/register', payload);
        if (res.status === 201) {
          alert('✅ Εγγραφή επιτυχής. Κάνε σύνδεση!');
          setIsRegister(false);
          return;
        }
      } else {
        const { user, token } = await login(payload);
        setUser(user);

        if (user.role === 'customer') {
          navigate('/books');
        } else if (user.role === 'seller') {
          navigate('/seller');
        } else if (user.role === 'admin') {
          navigate('/admin-dashboard');
        }

        onClose();
      }
    } catch (err) {
      setFailedAttempts((prev) => prev + 1);
      if (failedAttempts + 1 >= 3) {
        alert('🚫 Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά αργότερα.');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="relative bg-zinc-900 text-white rounded-xl shadow-xl px-8 pt-10 pb-6 w-full max-w-md border border-gray-700 transition-all duration-300 ease-out scale-95 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-lg font-bold"
        >
          ✖
        </button>

        <h2 className="text-center text-2xl font-bold mb-6">
          {isRegister ? '📝 Εγγραφή Χρήστη' : '🔐 Σύνδεση Χρήστη'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Όνομα χρήστη"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-800 p-2 rounded text-white placeholder-gray-400 border border-gray-600"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-gray-800 p-2 rounded text-white border border-gray-600"
              >
                <option value="customer">Πελάτης</option>
                <option value="seller">Συνεργάτης</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-800 p-2 rounded text-white placeholder-gray-400 border border-gray-600"
          />

          <input
            type="password"
            placeholder="Κωδικός"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-800 p-2 rounded text-white placeholder-gray-400 border border-gray-600"
          />

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded transition"
          >
            {isRegister ? 'Εγγραφή' : 'Σύνδεση'}
          </button>
        </form>

        <div className="flex flex-col items-center mt-6 gap-2">
          {!isRegister && (
  <div className="mt-2 text-center">
  <a href="#" className="text-sm text-blue-400 hover:underline">
    {/* Ξέχασες τον κωδικό σου; */}
  </a>
  <Link
    to="/password-resend"
    onClick={onClose}
    className="text-sm text-blue-400 hover:underline"
   >
    Ξέχασες τον κωδικό σου;
   </Link>
  </div>
)}

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-400 hover:underline text-sm"
          >
            {isRegister
              ? 'Έχεις λογαριασμό; Σύνδεση'
              : 'Δεν έχεις λογαριασμό; Εγγραφή'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
