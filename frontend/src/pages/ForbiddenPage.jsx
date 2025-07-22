import React from 'react';

export default function ForbiddenPage() {

  const handleOpenLogin = () => {
    window.location.href = '/?login=1';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">403 - Απαγορεύεται</h1>
        <p className="text-gray-700 mb-4">
          Δεν έχετε τα απαραίτητα δικαιώματα για αυτή τη σελίδα.
        </p>
        <button
          onClick={handleOpenLogin}
          className="inline-block mt-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded transition"
        >
          Μετάβαση στη σελίδα σύνδεσης
        </button>
      </div>
    </div>
  );
}