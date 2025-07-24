import React, { useState } from 'react';
import axios from '../utils/axiosInstance';

 // Σελίδα φόρμας επικοινωνίας για αποστολή μηνυμάτων
// Περιλαμβάνει πεδία για όνομα, email και μήνυμα



const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    try {
      await axios.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Παρουσιάστηκε σφάλμα. Προσπαθήστε ξανά.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          📬 Φόρμα Επικοινωνίας
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Όνομα
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Το όνομά σας"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Το email σας"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Μήνυμα
            </label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Το μήνυμά σας..."
              rows="5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 rounded-lg transition duration-300"
          >
            Αποστολή
          </button>
{ console.log('Success:', success)}
          {success && (
            <p className="text-green-600 font-medium text-center mt-2">
              ✅ Το μήνυμά σας εστάλη με επιτυχία!
            </p>
          )}
          {error && (
            <p className="text-red-600 font-medium text-center mt-2">
              ❌ {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
