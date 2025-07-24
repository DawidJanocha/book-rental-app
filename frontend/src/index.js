import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // <-- πρόσθεσε αυτό
// Προσθέτουμε το AuthProvider για να παρέχουμε το context του χρήστη σε όλη την εφαρμογή 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* <-- τύλιξε το App */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);