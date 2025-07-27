// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import AdminBooks from '../components/admin/AdminBooks';
import AdminUsers from '../components/admin/AdminUsers';
import AdminOrders from '../components/admin/AdminOrders';
import AdminStats from '../components/admin/AdminStats';
// AdminDashboard component

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('books');

  const renderContent = () => {
    if (activeTab === 'books') return <AdminBooks />;
    if (activeTab === 'users') return <AdminUsers /> ;

if (activeTab === 'orders') return <AdminOrders />;
if (activeTab === 'stats') return <AdminStats />;
;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">📊 Admin Dashboard</h1>
        <p className="text-gray-400 mb-6">Καλωσήρθες, Admin! Επέλεξε ενότητα:</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'books'
                ? 'bg-yellow-500 text-black shadow'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            📚 Βιβλία
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-yellow-500 text-black shadow'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            👥 Χρήστες
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-yellow-500 text-black shadow'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            📦 Παραγγελίες
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'stats'
                ? 'bg-yellow-500 text-black shadow'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            📈 Στατιστικά
          </button>
        </div>

        <div className="bg-[#1F2937] p-6 rounded-xl border border-gray-700 shadow-md">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
