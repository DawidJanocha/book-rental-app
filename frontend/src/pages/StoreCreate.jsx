// src/pages/StoreCreate.jsx
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import SellerStoreForm from '../components/SellerStoreForm';


// Σελίδα δημιουργίας καταστήματος για πωλητές
// Περιλαμβάνει φόρμα για καταχώρηση στοιχείων καταστήματος και κατηγοριών βιβλίων
// Μετά την υποβολή, αποστέλλει τα δεδομένα στο backend και κατευθύνει τον χρήστη στο dashboard του πωλητή
// Χρησιμοποιεί το axios για αιτήματα HTTP και το useNavigate για πλοήγηση
// Περιλαμβάνει πεδία για όνομα καταστήματος, ΑΦΜ, δι εύθυνση, ταχυδρομικό κώδικα, νομό, τηλέφωνο, email και κατηγορίες βιβλίων
// Προσφέρει δυνατότητα προσθήκης κατηγοριών βιβλίων με δυναμική προσθήκη πεδίων      
  const StoreCreate = () => {
    const [formData, setFormData] = useState({
    storeName: '',
    afm: '',
    address: '',
    postalCode: '',
    region: '',
    phone: '',
    email: '',
    bookCategories: [],
  });

  // Κατάσταση για τις κατηγορίες βιβλίων 
  const [categoriesInput, setCategoriesInput] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');



  // Έλεγχος αν ο χρήστης είναι συνδεδεμένος
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // Προσθήκη κατηγορίας βιβλίου
  const handleAddCategory = () => {
    if (categoriesInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        bookCategories: [...prev.bookCategories, categoriesInput.trim()],
      }));
      setCategoriesInput('');
    }
  };


  // Υποβολή της φόρμας για δημιουργία καταστήματος
  // Στέλνει τα δεδομένα στο backend και αν όλα είναι εντάξει,
   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/stores', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Το κατάστημα δημιουργήθηκε!');
      navigate('/seller'); // ➡️ Επιστροφή στο dashboard
    } catch (err) {
      console.error('❌ Store creation error:', err);
      alert(err?.response?.data?.message || '❌ Σφάλμα δημιουργίας καταστήματος');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl mb-4 font-semibold">📚 Δημιουργία Καταστήματος</h2>

        <input className="input" type="text" name="storeName" placeholder="Όνομα καταστήματος" value={formData.storeName} onChange={handleChange} required />
        <input className="input" type="text" name="afm" placeholder="ΑΦΜ" value={formData.afm} onChange={handleChange} required />
        <input className="input" type="text" name="address" placeholder="Διεύθυνση" value={formData.address} onChange={handleChange} required />
        <input className="input" type="text" name="postalCode" placeholder="Τ.Κ." value={formData.postalCode} onChange={handleChange} required />
        <input className="input" type="text" name="region" placeholder="Νομός" value={formData.region} onChange={handleChange} required />
        <input className="input" type="text" name="phone" placeholder="Τηλέφωνο" value={formData.phone} onChange={handleChange} required />
        <input className="input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

        <div className="mt-4">
          <label className="block mb-1 font-semibold">Κατηγορίες Βιβλίων</label>
          <div className="flex gap-2">
            <input
              className="input flex-grow"
              type="text"
              placeholder="Π.χ. Λογοτεχνία"
              value={categoriesInput}
              onChange={(e) => setCategoriesInput(e.target.value)}
            />
            <button type="button" className="bg-green-600 px-3 rounded" onClick={handleAddCategory}>
              ➕
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.bookCategories.map((cat, index) => (
              <span key={index} className="inline-block bg-gray-700 text-sm px-2 py-1 rounded mr-2 mt-1">
                {cat}
              </span>
            ))}
          </div>
        </div>
      <SellerStoreForm />

        <button type="submit" className="w-full bg-blue-600 mt-6 py-2 rounded font-semibold hover:bg-blue-700">
          Δημιουργία Καταστήματος
        </button>
      </form>
    </div>
  );
};

export default StoreCreate;
