import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import './OrderHistory.css';
import { AuthContext } from '../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { user } = useContext(AuthContext);

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await axios.get('/order', { params });
      setOrders(res.data);
    } catch (error) {
      console.error('Σφάλμα κατά την ανάκτηση παραγγελιών:', error);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

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
    <div className="order-history-container">
      <h2>📜 Ιστορικό Παραγγελιών</h2>

      <div className="date-filters">
        <label>
          Από:
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          Έως:
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <button onClick={fetchOrders}>Φιλτράρισμα</button>
      </div>

      {orders.length === 0 ? (
        <p>Δεν έχετε κάνει ακόμα παραγγελίες.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <h3>Παραγγελία #{order._id.slice(-6).toUpperCase()}</h3>
            <p><strong>Κατάστημα:</strong> {order.storeName || 'Άγνωστο'}</p>
            <p><strong>Ημερομηνία:</strong> {new Date(order.createdAt).toLocaleString('el-GR')}</p>
            <p><strong>Κατάσταση:</strong> {order.status === 'confirmed' ? '✅ Επιβεβαιωμένη' : order.status === 'declined' ? '❌ Απορρίφθηκε' : '⏳ Εκκρεμεί'}</p>
            {order.estimatedDeliveryTime && (
              <p><strong>Χρόνος Παράδοσης:</strong> {order.estimatedDeliveryTime}</p>
            )}

            <table className="order-table">
              <thead>
                <tr>
                  <th>Προϊόν</th>
                  <th>Ποσότητα</th>
                  <th>Τιμή</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.title}</td>
                    <td>{item.quantity}</td>
                    <td>{(item.price || 0).toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="total-cost">
              💰 Συνολικό Κόστος: {calculateTotal(order)}€
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
