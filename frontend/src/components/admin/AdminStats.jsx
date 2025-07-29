// frontend/src/components/AdminStats.jsx

import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [region, setRegion] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [availableRegions, setAvailableRegions] = useState([]);

  const fetchStats = async () => {
    try {
      let url = '/admin/stats/platform';
      const params = [];
      if (region) params.push(`region=${encodeURIComponent(region)}`);
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length) url += `?${params.join('&')}`;

      const response = await axios.get(url);
      setStats(response.data);

      // Συλλογή μοναδικών regions για dropdown
      const regions = [...new Set(response.data.stores.map(s => s.region))];
      setAvailableRegions(regions);
    } catch (err) {
      console.error('Σφάλμα κατά τη λήψη στατιστικών:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [region, from, to]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">📈 Στατιστικά Πλατφόρμας</h2>
        <div className="text-6xl font-bold text-right text-green-600">
          €{stats?.totalPlatformProfit?.toFixed(2) || '0.00'}
          <p className="text-sm font-normal text-gray-500 mt-2">12% από κάθε store.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          className="border border-gray-300 rounded px-4 py-2"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">Όλοι οι νομοί</option>
          {availableRegions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <input
          type="date"
          className="border border-gray-300 rounded px-4 py-2"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          type="date"
          className="border border-gray-300 rounded px-4 py-2"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Κατάστημα</th>
              <th className="px-4 py-2 border-b text-left">Νομός</th>
              <th className="px-4 py-2 border-b text-left">Έσοδα (€)</th>
              <th className="px-4 py-2 border-b text-left">Κέρδος Πλατφόρμας (€)</th>
            </tr>
          </thead>
          <tbody>
            {stats?.stores?.map((store) => (
              <tr key={store.storeId} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{store.storeName}</td>
                <td className="px-4 py-2 border-b">{store.region}</td>
                <td className="px-4 py-2 border-b">€{store.totalIncome.toFixed(2)}</td>
                <td className="px-4 py-2 border-b text-green-600 font-semibold">
                  €{store.platformProfit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStats;
