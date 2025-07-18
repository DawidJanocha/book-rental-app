// src/components/BulkImport.jsx
import React, { useRef, useState } from 'react';
import axios from '../utils/axiosInstance';

const BulkImport = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [importedBooks, setImportedBooks] = useState([]);
  const fileInputRef = useRef(null); // 👉 για reset input
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('🚫 Παρακαλώ επίλεξε αρχείο .json ή .xlsx');

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const res = await axios.post('/books/import', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(res.data.message);
      setImportedBooks(res.data.importedBooks || []);
      if (onSuccess) onSuccess();

      // ✅ Reset input για να ξαναεπιλεγεί το ίδιο αρχείο
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('❌ Σφάλμα:', err);
      alert(err.response?.data?.message || '❌ Σφάλμα κατά το import');
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 mt-8 rounded shadow-md w-full max-w-lg">
      <h3 className="text-lg font-semibold mb-4">📦 Μαζική Εισαγωγή Βιβλίων</h3>
      <p className="text-sm mb-2 text-gray-400">Υποστηρίζονται αρχεία .json και .xlsx</p>

      <input
        type="file"
        accept=".json,.xlsx"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-medium"
      >
        ⬆️ Εισαγωγή Αρχείου
      </button>

      {importedBooks.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-bold mb-2">📘 Εισαγόμενα Βιβλία:</h4>
          <ul className="list-disc list-inside text-sm text-gray-200">
            {importedBooks.map((book, idx) => (
              <li key={idx}>
                {book.title} – {book.author} – {parseFloat(book.rentalPrice || book.price).toFixed(2)}€
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
