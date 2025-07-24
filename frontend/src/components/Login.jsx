import React, { useState } from 'react';
import LoginModal from './components/LoginModal';

const App = () => {
  // ΔΗΛΩΣΗ ΚΑΤΑΣΤΑΣΗΣ ΓΙΑ ΤΟ MODAL ΣΥΝΔΕΣΗΣ / ΕΓΓΡΑΦΗΣ
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ΑΝΟΙΓΜΑ ΤΟΥ MODAL
  const openModal = () => setIsModalOpen(true);

  // ΚΛΕΙΣΙΜΟ ΤΟΥ MODAL
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      {/* ΚΟΥΜΠΙ ΓΙΑ ΕΜΦΑΝΙΣΗ ΤΟΥ MODAL */}
      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ΣΥΝΔΕΣΗ / ΕΓΓΡΑΦΗ
      </button>

      {/* COMPONENT ΓΙΑ ΤΟ LOGIN / REGISTER MODAL */}
      <LoginModal isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  );
};

export default App;
