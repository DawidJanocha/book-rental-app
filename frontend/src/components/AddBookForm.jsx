import React, { useState } from 'react';
import axios from '../utils/axiosInstance';

// ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ ΝΕΟΥ ΒΙΒΛΙΟΥ ΑΠΟ SELLER
const AddBookForm = ({ onBookAdded }) => {
  // ΟΡΙΖΟΥΜΕ STATES ΓΙΑ ΤΑ ΠΕΔΙΑ ΤΗΣ ΦΟΡΜΑΣ
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // ΥΠΟΒΟΛΗ ΦΟΡΜΑΣ
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ΠΑΙΡΝΟΥΜΕ ΤΟ TOKEN ΑΠΟ ΤΟ LOCALSTORAGE
      const token = localStorage.getItem('token');

      // ΚΑΝΟΥΜΕ POST ΤΟ ΒΙΒΛΙΟ ΣΤΟ BACKEND
      const res = await axios.post(
        '/books',
        { title, author, description, price, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ΕΝΗΜΕΡΩΝΟΥΜΕ ΤΟΝ ΧΡΗΣΤΗ ΟΤΙ ΕΠΙΤΥΧΕ
      alert('📘 Το βιβλίο προστέθηκε!');
      onBookAdded(); // TRIGGER ΓΙΑ ΝΑ ΓΙΝΕΙ REFRESH

      // ΚΑΘΑΡΙΖΟΥΜΕ ΤΗ ΦΟΡΜΑ
      setTitle('');
      setAuthor('');
      setDescription('');
      setPrice('');
      setQuantity('');
    } catch (err) {
      // ΣΕ ΠΕΡΙΠΤΩΣΗ ΛΑΘΟΥΣ
      alert('❌ Σφάλμα προσθήκης: ' + (err.response?.data?.message || 'Άγνωστο σφάλμα'));
    }
  };

  // HTML ΤΗΣ ΦΟΡΜΑΣ
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <input
        type="text"
        placeholder="Τίτλος"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Συγγραφέας"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <textarea
        placeholder="Περιγραφή (προαιρετική)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <input
        type="number"
        placeholder="Τιμή Ενοικίασης (€)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        min={0}
        step="0.01"
        required
      />
      <input
        type="number"
        placeholder="Ποσότητα διαθέσιμη"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        min={1}
        required
      />
      <button type="submit">📚 Προσθήκη Βιβλίου</button>
    </form>
  );
};

export default AddBookForm;
