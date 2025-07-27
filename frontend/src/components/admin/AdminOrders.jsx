import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/order/admin/orders/all');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setError('Σφάλμα κατά τη φόρτωση των παραγγελιών');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const exportToCSV = () => {
    const header = ['Order ID', 'Ημερομηνία', 'Κατάστημα', 'Πελάτης', 'Σύνολο', 'Κατάσταση'];
    const rows = filteredOrders.map((order) => [
      order._id,
      new Date(order.createdAt).toLocaleString(),
      order.store?.storeName || '',
      order.customer?.username || '',
      order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : '',
      order.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderOrderRow = (order, index) => {
    const storeName = order.store?.storeName || '—';
    const customerName = order.customer?.username || '—';
    const total = order.totalPrice ? `${parseFloat(order.totalPrice).toFixed(2)}€` : '—';

    let statusElement = <span className="text-gray-400">—</span>;
    if (order.status === 'confirmed') {
      statusElement = <span className="text-green-400">✅ Επιβεβαιωμένη</span>;
    } else if (order.status === 'pending') {
      statusElement = <span className="text-yellow-400">⏳ Εκκρεμεί</span>;
    } else if (order.status === 'declined') {
      statusElement = <span className="text-red-400">❌ Ακυρώθηκε</span>;
    }

    return (
      <tr key={order._id || index} className="border-b border-gray-700 hover:bg-zinc-800">
        <td className="px-3 py-2">{order._id}</td>
        <td className="px-3 py-2">{new Date(order.createdAt).toLocaleString()}</td>
        <td className="px-3 py-2">{storeName}</td>
        <td className="px-3 py-2">{customerName}</td>
        <td className="px-3 py-2">{total}</td>
        <td className="px-3 py-2">{statusElement}</td>
      </tr>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-yellow-400 mb-4">📦 Όλες οι Παραγγελίες</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setActiveFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeFilter === 'confirmed'
              ? 'bg-green-500 text-black'
              : 'bg-zinc-700 text-white hover:bg-zinc-600'
          }`}
        >
          ✅ Επιβεβαιωμένες
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeFilter === 'pending'
              ? 'bg-yellow-500 text-black'
              : 'bg-zinc-700 text-white hover:bg-zinc-600'
          }`}
        >
          ⏳ Εκκρεμείς
        </button>
        <button
          onClick={() => setActiveFilter('declined')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeFilter === 'declined'
              ? 'bg-red-500 text-black'
              : 'bg-zinc-700 text-white hover:bg-zinc-600'
          }`}
        >
          ❌ Ακυρωμένες
        </button>

        <button
          onClick={fetchAllOrders}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black font-semibold hover:bg-blue-600"
        >
          🔄 Ανανέωση Λίστας
        </button>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
        >
          📁 Εξαγωγή CSV
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Φόρτωση...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-yellow-400">
              <tr>
                <th className="px-3 py-2 text-left">Order ID</th>
                <th className="px-3 py-2 text-left">Ημερομηνία</th>
                <th className="px-3 py-2 text-left">Κατάστημα</th>
                <th className="px-3 py-2 text-left">Πελάτης</th>
                <th className="px-3 py-2 text-left">Σύνολο</th>
                <th className="px-3 py-2 text-left">Κατάσταση</th>
              </tr>
            </thead>
            <tbody>{filteredOrders.map(renderOrderRow)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
