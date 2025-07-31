import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filteredRegion, setFilteredRegion] = useState('Όλες');
  const [filteredStatus, setFilteredStatus] = useState('Όλοι');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('admin/users');
        console.log('📦 Απόκριση backend:', res.data);
        const fetched = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.users)
          ? res.data.users
          : [];

        setUsers(fetched);
        console.log('✅ Φορτωμένοι χρήστες:', fetched);

        setLoading(false);
      } catch (err) {
        console.error('❌ Σφάλμα φόρτωσης χρηστών:', err);
      }
    };
    fetchUsers();
  }, []);

  const allRegions = [
    ...new Set(
      users.flatMap((u) =>
        u.role === 'customer'
          ? [u.region]
          : u.role === 'seller'
          ? [u.store?.region]
          : []
      )
    ),
  ].filter(Boolean);
  const regionOptions = ['Όλες', ...allRegions];

  const isInactive = (lastLogin) => {
    if (!lastLogin) return true;
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffDays = (now - loginDate) / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  };

  const filterByStatus = (user) => {
    const lastLogin = user.lastLogin || null;
    const isVerified = user.isVerified;

    if (filteredStatus === 'Όλοι') return true;
    if (filteredStatus === 'Ενεργοί') return isVerified && !isInactive(lastLogin);
    if (filteredStatus === 'Ανενεργοί') return isVerified && isInactive(lastLogin);
    if (filteredStatus === 'Σε εκκρεμότητα') return !isVerified || !lastLogin;

    return true;
  };

  const filteredUsers = users
    .filter((u) => u.role === 'customer')
    .filter(
      (u) =>
        (filteredRegion === 'Όλες' || u.region === filteredRegion) &&
        filterByStatus(u)
    );

  const filteredSeller = users
    .filter((u) => u.role === 'seller')
    .filter(
      (u) =>
        (filteredRegion === 'Όλες' || u.store?.region === filteredRegion) &&
        filterByStatus(u)
    );

  // 🔧 Debugging Logs
  console.log('📍 Επιλεγμένη Περιοχή:', filteredRegion);
  console.log('📌 Επιλεγμένη Κατάσταση:', filteredStatus);
  console.log('🧮 Φιλτραρισμένοι Πελάτες:', filteredUsers.length);
  console.log('🧮 Φιλτραρισμένοι Συνεργάτες:', filteredSeller.length);

  return (
    <div className="p-6">
      <h2 className="text-2xl  font-semibold mb-4">📋 Διαχείριση Χρηστών</h2>

      <div className="flex bg-zinc-800 flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="font-medium bg-zinc-800">📍 Φίλτρο Περιοχής:</label>
          <select
            className="border bg-zinc-800 border-gray-300 rounded px-3 py-1 mt-1"
            value={filteredRegion}
            onChange={(e) => setFilteredRegion(e.target.value)}
          >
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">📌 Κατάσταση:</label>
          <select
            className="border border-gray-300 rounded px-3 py-1 mt-1 bg-zinc-800"
            value={filteredStatus}
            onChange={(e) => setFilteredStatus(e.target.value)}
          >
            <option>Όλοι</option>
            <option>Ενεργοί</option>
            <option>Ανενεργοί</option>
            <option>Σε εκκρεμότητα</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">⏳ Φόρτωση χρηστών...</p>
      ) : (
        <div className="bg-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Συνεργάτες */}
          <div>
            <h3 className="text-xl font-semibold mb-2">🛍️ Συνεργάτες ({filteredSeller.length})</h3>
            {filteredSeller.length === 0 ? (
              <p className="text-gray-400">Δεν υπάρχουν συνεργάτες.</p>
            ) : (
              filteredSeller.map((seller) => (
                <div
                  key={seller._id}
                  className="  shadow rounded p-4 border-1-4  border-blue-300 mb-4  pt-4 mt-4 border-t border-blue-300"
                >
                  <p className="font-bold text-lg">{seller.username}</p>
                  <p className="text-sm text-gray-100">{seller.email}</p>
                  <p className="mt-2">📍 {seller.store?.region}</p>
                  <p>🏪 {seller.store?.storeName}</p>
                  <p>📞 {seller.store?.phone}</p>
                  <p>📬 {seller.store?.email}</p>

                  <div className="mt-3 border-t pt-2 text-sm text-gray-100">
                    <p>✅ Πωλήσεις: {seller.store?.stats?.totalSales || 0}</p>
                    <p>💰 Τζίρος: {seller.store?.stats?.totalRevenue || 0}€</p>
                    <p>📦 Εκκρεμείς: {seller.store?.stats?.totalPending || 0}</p>
                    <p>❌ Ακυρωμένες: {seller.store?.stats?.totalCanceled || 0}</p>
                  </div>

                  <p className="text-xs text-gray-300 mt-3">
                    🕒 Τελευταία Σύνδεση:{' '}
                    {seller.lastLogin
                      ? new Date(seller.lastLogin).toLocaleString('el-GR')
                      : 'Ποτέ'}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Πελάτες */}
          <div>
  <h3 className="text-xl font-semibold mb-2">👤 Πελάτες ({filteredUsers.length})</h3>
  {filteredUsers.length === 0 ? (
    <p className="text-gray-400">Δεν υπάρχουν πελάτες.</p>
  ) : (
    filteredUsers.map((user) => (
      <div
        key={user._id}
        className="shadow rounded p-4 border-1-4  border-blue-300 mb-4  pt-4 mt-4 border-t border-blue-300"
      >
        <p className="font-bold text-lg">{user.username}</p>
        <p className="text-sm text-gray-100">{user.email}</p>
        <p className="mt-2">📍 {user?.userDetails?.region || '—'}</p>
        <p>🏠 {user?.userDetails?.street || '—'}</p>
        <p>☎️ {user?.userDetails?.postalCode || '—'}</p>
        <p>🔔 {user?.userDetails?.doorbell || '—'}</p>
        <p>🔔 {user?.userDetails?.phone || '—'}</p>


        <p className="text-xs text-gray-300 mt-3">
          🕒 Τελευταία Σύνδεση:{' '}
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleString('el-GR')
            : 'Ποτέ'}
        </p>
      </div>
    ))
  )}
</div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
