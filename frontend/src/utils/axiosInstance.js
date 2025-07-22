import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001/api', // ✅ backend base
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👉 interceptor για να προσθέτει το JWT σε κάθε request
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

// 👉 interceptor για χειρισμό error 401 κ.λπ.
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // π.χ. redirect ή εμφάνιση modal login
      window.location.href = '/';
    }
    if (error.response && error.response.status === 403) {
      window.location.href = '/forbidden';
    }
    return Promise.reject(error);
  }
);

export default instance;

