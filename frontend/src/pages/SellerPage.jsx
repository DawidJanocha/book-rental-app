// src/pages/SellerPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import BulkImport from '../components/BulkImport';

const SellerPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // States
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', description: '', quantity: 1, price: 0 });
  const [editForm, setEditForm] = useState({ title: '', author: '', description: '', quantity: 1, price: 0 });
  const [editingBookId, setEditingBookId] = useState(null);
  const [activeTab, setActiveTab] = useState('myBooks');
  const [store, setStore] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deliveryTimes, setDeliveryTimes] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [declinedOrders, setDeclinedOrders] = useState([]);

// Δημιουργία επιλογών 15' - 3h
const generateDeliveryOptions = () => {
  const options = [];
  for (let minutes = 15; minutes <= 180; minutes += 15) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let label = '';
    if (hours > 0) label += `${hours} ώρα${hours > 1 ? 'ς' : ''}`;
    if (mins > 0) label += `${hours > 0 ? ' ' : ''}${mins} λεπτά`;
    options.push({ value: label, label });
  }
  return options;
};


  // Ανάκτηση βιβλίων (με useCallback για να μη δίνει warning το useEffect)
  const fetchMyBooks = useCallback(async () => {
    try {
      const res = await axios.get('/books/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      alert('❌ Σφάλμα κατά την ανάκτηση των βιβλίων σου');
    }
  }, [token]);

  // Ανάκτηση καταστήματος
  const fetchMyStore = useCallback(async () => {
    try {
      const res = await axios.get('/stores/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStore(res.data);
    } catch (err) {
      console.error('❌ Σφάλμα ανάκτησης καταστήματος:', err);
    }
  }, [token]);


  // Ανάκτηση Στατιστικών Πωλήσεων
  const fetchSalesStats = useCallback(async () => {
    try {
      const res = await axios.get('/sales/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesStats(res.data);
    } catch (err) {
      alert('❌ Σφάλμα κατά την ανάκτηση των στατιστικών πωλήσεων');
    }
  }, [token]);

  // On Mount
  useEffect(() => {
    fetchMyBooks();
    fetchMyStore();
  }, [fetchMyBooks, fetchMyStore]);

   useEffect(() => {
    if (activeTab === 'salesStats') {
      fetchSalesStats();
    }
  }, [activeTab, fetchSalesStats]);

  // Προσθήκη βιβλίου
  const handleAdd = async (e) => {
  e.preventDefault();

  // 👉 Καθαρισμός τιμής (π.χ. 10,99 -> 10.99)
  const cleanPrice = parseFloat(form.price.toString().replace(',', '.'));
  const cleanQuantity = parseInt(form.quantity);

  // 🔍 Έλεγχος εγκυρότητας τιμών
  if (isNaN(cleanPrice) || cleanPrice < 0) {
    return alert('❌ Η τιμή ενοικίασης πρέπει να είναι ένας έγκυρος αριθμός (π.χ. 9.99)');
  }

  if (isNaN(cleanQuantity) || cleanQuantity < 1) {
    return alert('❌ Η ποσότητα πρέπει να είναι ένας αριθμός μεγαλύτερος ή ίσος του 1');
  }

  if (!form.title.trim()) {
    return alert('❌ Συμπλήρωσε τίτλο βιβλίου');
  }

  try {
    // 📦 Αποστολή καθαρών τιμών
    await axios.post(
      '/books',
      {
        ...form,
        price: cleanPrice,
        quantity: cleanQuantity,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert('✅ Το βιβλίο προστέθηκε');
    setForm({ title: '', author: '', description: '', quantity: 1, price: '' });
    fetchMyBooks();
  } catch (err) {
    alert('❌ Σφάλμα κατά την προσθήκη βιβλίου');
  }
};

  // Εκκίνηση επεξεργασίας
  const startEditing = (book) => {
    setEditingBookId(book._id);
    setEditForm({
      title: book.title,
      author: book.author || '',
      description: book.description || '',
      quantity: book.quantity || 1,
      price: parseFloat(book.rentalPrice?.$numberDecimal || book.rentalPrice || 0).toFixed(2),
    });
  };

  // Ενημέρωση βιβλίου
  const handleUpdate = async (e) => {
  e.preventDefault();

  const cleanPrice = parseFloat(editForm.price.toString().replace(',', '.'));
  const cleanQuantity = parseInt(editForm.quantity);

  // 🔍 Validation
  if (!editForm.title.trim()) {
    return alert('❌ Συμπλήρωσε τίτλο βιβλίου');
  }

  if (isNaN(cleanPrice) || cleanPrice < 0) {
    return alert('❌ Η τιμή πρέπει να είναι ένας έγκυρος αριθμός (π.χ. 9.99)');
  }

  if (isNaN(cleanQuantity) || cleanQuantity < 1) {
    return alert('❌ Η ποσότητα πρέπει να είναι τουλάχιστον 1');
  }

  try {
    await axios.put(
      `/books/${editingBookId}`,
      {
        ...editForm,
        price: cleanPrice,
        quantity: cleanQuantity,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert('✅ Ενημέρωση επιτυχής');
    setEditingBookId(null);
    fetchMyBooks();
  } catch (err) {
    alert('❌ Σφάλμα κατά την ενημέρωση βιβλίου');
  }
};

  // Διαγραφή μεμονωμένου βιβλίου
  const handleDelete = async (bookId) => {
    if (!window.confirm('🗑️ Είσαι σίγουρος ότι θες να διαγράψεις αυτό το βιβλίο;')) return;
    try {
      await axios.delete(`/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Το βιβλίο διαγράφηκε');
      fetchMyBooks();
    } catch (err) {
      alert('❌ Σφάλμα κατά τη διαγραφή');
    }
  };

  // Μαζική διαγραφή
  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ Είσαι σίγουρος ότι θες να διαγράψεις ΟΛΑ σου τα βιβλία;')) return;
    try {
      await axios.delete('/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Όλα τα βιβλία διαγράφηκαν');
      fetchMyBooks();
    } catch (err) {
      alert('❌ Σφάλμα στη μαζική διαγραφή');
    }
  };

  const fetchOrders = useCallback(async () => {
  try {
    const res = await axios.get('/order/seller');
    setOrders(res.data);
    console.log("Orders",res)
    setPendingOrders(res.data.filter(order => order.status === 'pending'));
    setAcceptedOrders(res.data.filter(order => order.status === 'confirmed'));
    setDeclinedOrders(res.data.filter(order => order.status === 'declined'));
  } catch (err) {
    console.error('Σφάλμα ανάκτησης παραγγελιών:', err);
  }
}, []);

useEffect(() => {
  fetchOrders();
}, []);

const handleAcceptOrder = async (orderId) => {
  const estimatedTime = deliveryTimes[orderId];
  if (!estimatedTime) {
    alert('❌ Παρακαλώ επίλεξε χρόνο παράδοσης');
    return;
  }

  try {
    await axios.put(`/order/confirm/${orderId}`, {
      estimatedDeliveryTime: estimatedTime,
    });

    alert('✅ Η παραγγελία επιβεβαιώθηκε');
    fetchOrders();
  } catch (err) {
    console.error('Σφάλμα επιβεβαίωσης παραγγελίας:', err);
    alert('❌ Σφάλμα στην αποδοχή παραγγελίας');
  }
};

const handleDenyOrder = async (orderId) => {
  try {
    await axios.put(`/order/deny/${orderId}`, { status: 'declined' }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('❌ Η παραγγελία απορρίφθηκε');
    fetchOrders();
  } catch (err) {
    alert('❌ Σφάλμα στην απόρριψη παραγγελίας');
  }
};

const calculateTotal = (order) => {
  if (order.totalPrice?.$numberDecimal) {
    return Number(order.totalPrice.$numberDecimal).toFixed(2);
  }
  return order.items?.reduce((sum, item) => {
    const price = Number(item.price?.$numberDecimal || item.price || 0);
    return sum + price * item.quantity;
  }, 0).toFixed(2);
};


 return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-3xl font-bold mb-6">📦 Πίνακας Πωλητή</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-700 pb-2">
        <button className={`${activeTab === 'storeInfo' ? 'text-blue-400' : 'text-white'} font-semibold`} onClick={() => setActiveTab('storeInfo')}>🏪 Κατάστημα</button>
        <button className={`${activeTab === 'addBook' ? 'text-blue-400' : 'text-white'} font-semibold`} onClick={() => setActiveTab('addBook')}>➕ Προσθήκη Βιβλίου</button>
        <button className={`${activeTab === 'myBooks' ? 'text-blue-400' : 'text-white'} font-semibold`} onClick={() => setActiveTab('myBooks')}>📚 Τα Βιβλία μου</button>
        <button className={`${activeTab === 'salesStats' ? 'text-blue-400' : 'text-white'} font-semibold`} onClick={() => setActiveTab('salesStats')}>📊 Στατιστικά πωλήσεων</button>
        <button className={`${activeTab === 'pendingOrders' ? 'text-blue-400' : 'text-white'} font-semibold`} onClick={() => setActiveTab('pendingOrders')}>📦 Παραγγελίες ({pendingOrders?.length || 0})</button>
        <button className={`${activeTab === 'history' ? 'text-blue-400' : 'text-white'} font-semibold`} onClick={() => setActiveTab('history')}>📜 Ιστορικό</button>
      </div>

      {/* Περιεχόμενο ανά tab */}
      {activeTab === 'storeInfo' && (
        <div className="space-y-4 max-w-lg">
          {store ? (
            <div className="bg-slate-800 p-6 rounded-lg shadow-md text-white text-[16px] space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-pink-400">🌸</span>
                <span className="font-semibold">Όνομα:</span>
                <span className="text-gray-300">{store.storeName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400">📍</span>
                <span className="font-semibold">Διεύθυνση:</span>
                <span className="text-gray-300">{store.address}, {store.postalCode}, {store.region}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400">📞</span>
                <span className="font-semibold">Τηλέφωνο:</span>
                <span className="text-gray-300">{store.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400">📧</span>
                <span className="font-semibold">Email:</span>
                <span className="text-gray-300">{store.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400">📚</span>
                <span className="font-semibold">Κατηγορίες:</span>
                <span className="text-gray-300">{store.bookCategories?.join(', ')}</span>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4 text-red-400">❌ Δεν έχεις καταχωρήσει ακόμα κατάστημα.</p>
              <button onClick={() => navigate('/store/create')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">➕ Δημιουργία Καταστήματος</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'addBook' && (
        <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleAdd} className="bg-slate-800 p-4 rounded shadow space-y-4 mt-6">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Τίτλος Βιβλίου</label>
            <input
              type="text"
              placeholder="Τίτλος"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Συγγραφέας</label>
            <input
              type="text"
              placeholder="Συγγραφέας"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Περιγραφή</label>
            <input
              type="text"
              placeholder="Περιγραφή"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Διαθέσιμα Αντίτυπα</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Τιμή Ενοικίασης (€)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="π.χ. 3.50"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            ➕ Προσθήκη Βιβλίου
          </button>
           <BulkImport onSuccess={fetchMyBooks} />
        </form>
        </div>
      )}

      {activeTab === 'myBooks' && (
        <ul className="space-y-4 max-w-lg">
          {books.map((book) => (
            <li key={book._id} className="bg-gray-800 p-4 rounded">
              <div className="bg-slate-800 text-white p-4 rounded mb-3 shadow flex justify-between items-start">
                {/* Αριστερά: Τίτλος + συγγραφέας */}
                <div>
                  <div className="font-semibold text-lg">{book.title}</div>
                  <div className="text-sm text-gray-300">από {book.author}</div>
                </div>

                {/* Δεξιά: Τιμή + κουμπιά */}
                <div className="flex flex-col items-end text-right space-y-1">
                  <div className="text-yellow-400 font-bold text-lg font-mono">
                    {Number(book.rentalPrice?.$numberDecimal || book.rentalPrice || 0).toFixed(2)} €
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <button onClick={() => startEditing(book)} className="text-blue-400 hover:text-blue-500 flex items-center">
                      🖉 <span className="ml-1">Επεξεργασία</span>
                    </button>
                    <button onClick={() => handleDelete(book._id)} className="text-red-400 hover:text-red-500 flex items-center">
                      🗑️ <span className="ml-1">Διαγραφή</span>
                    </button>
                  </div>
                </div>
              </div>

              {editingBookId === book._id && (
                <form onSubmit={handleUpdate} className="bg-slate-800 p-4 rounded shadow space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Τίτλος Βιβλίου</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Συγγραφέας</label>
                  <input
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Περιγραφή</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Διαθεσιμότητα</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Τιμή Ενοικίασης (€)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full p-2 rounded bg-slate-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    💾 Αποθήκευση
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBookId(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    ❌ Άκυρο
                  </button>
                </div>
              </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'salesStats' && salesStats && (
        <div className="space-y-4 max-w-lg">
          <h3 className="text-2xl font-semibold">Στατιστικά Αγορών</h3>
          <p><strong>Σύνολο Πωλήσεων:</strong> {salesStats.totalSales} €</p>
          <p><strong>Σύνολο Παραγγελιών:</strong> {salesStats.totalOrders}</p>
        </div>
      )}

  {activeTab === 'pendingOrders' && (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">
          📦 Παραγγελίες προς επιβεβαίωση
        </h2>

    {pendingOrders.length === 0 ? (
      <p>Δεν υπάρχουν εκκρεμείς παραγγελίες.</p>
    ) : (
      pendingOrders.map((order) => (
          <div key={order._id} className="bg-slate-800 rounded-lg shadow p-4 space-y-2">
      <div className="text-white text-sm space-y-1">
        <p>👤 <span className="font-semibold">Πελάτης:</span> {order.customer.username}</p>
        <p>🔐 <span className="font-semibold">Κωδικός Παραγγελίας:</span> {order._id}</p>
        <p>🕒 <span className="font-semibold">Ημερομηνία:</span> {new Date(order.createdAt).toLocaleString('el-GR')}</p>
        <p>📦 <span className="font-semibold">Προϊόντα:</span></p>
        <ul className="ml-4 list-disc">
          {order.items.map((item, idx) => (
             <div
              key={idx}
              className="bg-slate-800 rounded-md p-2 mb-2 text-sm text-white flex justify-between items-center shadow-sm border border-gray-700"
            >
              {/* Όνομα Προϊόντος */}
              <div className="flex items-center gap-2 w-full">
                <div className="text-blue-400">■</div>
                <div className="font-medium">{item.title}</div>
              </div>

              {/* Ποσότητα */}
              <div className="text-sm text-gray-300 mx-3 whitespace-nowrap">
                ×{item.quantity}
              </div>

              {/* Τιμή */}
              <div className="text-yellow-400 font-semibold whitespace-nowrap">
                {item.price.toFixed(2)} €
              </div>
            </div>
          ))}
        </ul>
        <p>💰 <span className="font-semibold">Σύνολο:</span> {calculateTotal(order)} €</p>
      </div>
           <label style={{ marginTop: '0.5rem' }}>
      Εκτιμώμενος Χρόνος Παράδοσης:
    </label>
    <select
      value={deliveryTimes[order._id] || ''}
      onChange={(e) =>
        setDeliveryTimes({ ...deliveryTimes, [order._id]: e.target.value })
      }
      className="w-full px-3 py-2 bg-slate-900 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"    >
      <option value="">-- Επιλέξτε Χρόνο --</option>
      {generateDeliveryOptions().map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
          <div className="flex gap-4 mt-3">
            <button onClick={() => handleAcceptOrder(order._id)} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">✅ Αποδοχή</button>
            <button onClick={() => handleDenyOrder(order._id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">❌ Απόρριψη</button>
          </div>
        </div>
      ))
    )}
  </div>
)}{activeTab === 'history' && (
<div className="mt-6">
  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
    📜 Ιστορικό Παραγγελιών
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Αποδεκτές Παραγγελίες */}
    <div className="bg-green-900/20 border border-green-700 p-4 rounded-md shadow">
      <h3 className="text-green-400 font-semibold mb-3">
        ✅ Αποδεκτές Παραγγελίες ({acceptedOrders.length})
      </h3>

      {acceptedOrders.map((order, index) => (
        <div key={index} className="bg-slate-800 p-3 rounded-md mb-4 shadow-md">
          <p className="text-sm text-white">
            <strong>👤 Πελάτης:</strong> {order?.customer.username}
          </p>
          <p className="text-sm text-white">
            <strong>📅 Ημερομηνία:</strong> {new Date(order.createdAt).toLocaleString('el-GR')}
          </p>
          <p className="text-sm text-white">
            <strong>⏱ Εκτιμώμενος χρόνος:</strong>{' '}
            {order.estimatedTime || '—'}
          </p>

          <div className="mt-2">
            <p className="text-sm text-white font-semibold mb-1">📦 Προϊόντα:</p>
            {order.items.map((prod, i) => (
              <div
                key={i}
                className="bg-slate-700 px-3 py-2 mb-1 rounded flex justify-between items-center text-sm text-white"
              >
                <span className="flex-1">{prod.title || "Άγνωστο Βιβλίο"}</span>
                <span className="w-10 text-center text-gray-300">×{prod.quantity}</span>
                <span className="w-14 text-right text-yellow-400 font-semibold">
                  {prod.price.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>

          <p className="mt-2 text-right font-bold text-green-300">
            Σύνολο:  {calculateTotal(order)} €
          </p>
        </div>
      ))}
    </div>

    {/* Απορριφθείσες Παραγγελίες */}
    <div className="bg-red-900/20 border border-red-700 p-4 rounded-md shadow">
      <h3 className="text-red-400 font-semibold mb-3">
        ❌ Απορριφθείσες Παραγγελίες ({declinedOrders.length})
      </h3>

      {declinedOrders.map((order, index) => (
        <div key={index} className="bg-slate-800 p-3 rounded-md mb-4 shadow-md">
          <p className="text-sm text-white">
            <strong>👤 Πελάτης:</strong> {order.customer.username}
          </p>
          <p className="text-sm text-white">
            <strong>📅 Ημερομηνία:</strong> {new Date(order.createdAt).toLocaleString('el-GR')}
          </p>
          <div className="mt-2">
            <p className="text-sm text-white font-semibold mb-1">📦 Προϊόντα:</p>
            {order.items.map((prod, i) => (
              <div
                key={i}
                className="bg-slate-700 px-3 py-2 mb-1 rounded flex justify-between items-center text-sm text-white"
              >
                <span className="flex-1">{prod.title || "Άγνωστο Βιβλίο"}</span>
                <span className="w-10 text-center text-gray-300">×{prod.quantity}</span>
                <span className="w-14 text-right text-yellow-400 font-semibold">
                  {(prod.price * prod.quantity).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>

          <p className="mt-2 text-right font-bold text-red-300">
            Σύνολο: {calculateTotal(order)} €
          </p>
        </div>
      ))}
    </div>
  </div>
</div>

)}

      
    </div>
  );
};

export default SellerPage;