// src/components/TopOrdersChart.jsx

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TopOrdersChart = ({ topOrders }) => {
  if (!Array.isArray(topOrders) || topOrders.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mt-4 text-center text-white">
        Δεν υπάρχουν διαθέσιμες παραγγελίες.
      </div>
    );
  }

  const data = {
    labels: topOrders.map((order) => `#${order._id.slice(-5)} | ${order.createdAt}`),
    datasets: [
      {
        label: '€ Ποσό',
        data: topOrders.map((order) => order.totalPrice),
        backgroundColor: '#ffcc00',
        borderColor: '#ffaa00',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        // labels: { color: 'white' },
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
      },
      y: {
        ticks: { color: 'white' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-center text-lg font-semibold text-white">💸 Top 10 Παραγγελίες (Ποσό)</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopOrdersChart;
