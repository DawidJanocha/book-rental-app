import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../utils/axiosInstance';

const EmailVerification = () => {
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');  // <-- από το query string

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/auth/verify-email?token=${token}`);

        setStatus(res.data.message || '✅ Επιτυχής επιβεβαίωση! Μεταφορά σε λίγο...');

        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        setStatus(err?.response?.data?.message || '❌ Η επιβεβαίωση απέτυχε');
      }
    };
    if (token) verify();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">📧 Επιβεβαίωση Email</h2>
        <p className="mb-6">{status}</p>
        <Link to="/" className="text-blue-400 hover:underline">
          🔐 Επιστροφή στη σύνδεση
        </Link>
      </div>
    </div>
  );
};

export default EmailVerification;

