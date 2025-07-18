import React, { useState } from 'react';
import LoginModal from './components/LoginModal';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Σύνδεση / Εγγραφή
      </button>

      <LoginModal isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  );
};

export default App;
