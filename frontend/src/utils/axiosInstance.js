// src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Global μεταβλητή για αποτυχημένα login
let loginAttemptCount = 0;

// interceptor για να προσθέτει το JWT σε κάθε request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// interceptor για error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ✅ Αν είναι αποτυχημένο login
    if (status === 401 && window.location.pathname === '/') {
      loginAttemptCount++;

      if (loginAttemptCount >= 3) {
        window.dispatchEvent(new Event('login-lockout'));
        loginAttemptCount = 0; // reset
      }
    }

    if (status === 401) {
      localStorage.removeItem('token');
      alert('🚫 Η συνεδρία σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.');
      window.location.href = '/';
    }

    if (status === 403) {
      window.location.href = '/forbidden';
    }

    return Promise.reject(error);
  }
);

export default instance;

