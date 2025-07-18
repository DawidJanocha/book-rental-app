import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Λογοτεχνία', 'Ιστορία', 'Παιδικά', 'Επιστημονικά',
  'Μαγειρική', 'Εκμάθηση Ξένων Γλωσσών', 'Κόμικς', 'Μυθιστορήματα'
];

const SellerStoreForm = () => {
  const [form, setForm] = useState({
    storeName: '',
    afm: '',
    address: '',
    postalCode: '',
    region: '',
    phone: '',
    email: '',
    bookCategories: [],
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (category) => {
    setForm((prev) => ({
      ...prev,
      bookCategories: prev.bookCategories.includes(category)
        ? prev.bookCategories.filter((cat) => cat !== category)
        : [...prev.bookCategories, category],
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) return alert('Χρειάζεται σύνδεση');

  try {
    await axios.post('/stores', form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('✅ Το κατάστημα δημιουργήθηκε!');
  } catch (err) {
    console.error(err);
    alert('❌ Σφάλμα κατά τη δημιουργία του καταστήματος');
  }
};


  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🛍 Δημιουργία Καταστήματος</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input type="text" name="storeName" placeholder="Όνομα καταστήματος" value={form.storeName} onChange={handleChange} required className="input" />
        <input type="text" name="afm" placeholder="ΑΦΜ" value={form.afm} onChange={handleChange} required className="input" />
        <input type="text" name="address" placeholder="Διεύθυνση" value={form.address} onChange={handleChange} required className="input" />
        <input type="text" name="postalCode" placeholder="Τ.Κ." value={form.postalCode} onChange={handleChange} required className="input" />
        <input type="text" name="region" placeholder="Νομός / Περιοχή" value={form.region} onChange={handleChange} required className="input" />
        <input type="tel" name="phone" placeholder="Τηλέφωνο" value={form.phone} onChange={handleChange} required className="input" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input" />

        <div>
          <p className="font-semibold text-gray-700 mb-2">📚 Κατηγορίες Βιβλίων</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.bookCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="form-checkbox"
                />
                <span className="text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4">
          ✅ Υποβολή Καταστήματος
        </button>
      </form>
    </div>
  );
};

export default SellerStoreForm;
