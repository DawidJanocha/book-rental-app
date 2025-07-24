// src/components/SalesRevenueLineChart.jsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const SalesRevenueLineChart = ({ dailyRevenue }) => {
  // 🛡️ Ασφάλεια: Αν δεν έχουμε δεδομένα, εμφάνισε μήνυμα
  if (!Array.isArray(dailyRevenue) || dailyRevenue.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mt-4 text-center text-white">
        Δεν υπάρχουν διαθέσιμα δεδομένα εσόδων.
      </div>
    );
  }

  const data = {
    labels: dailyRevenue.map((d) => d.date),
    datasets: [
      {
        label: '€ Έσοδα',
        data: dailyRevenue.map((d) => d.revenue),
        fill: false,
        borderColor: '#36A2EB',
        backgroundColor: '#36A2EB',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
    },
    scales: {
      x: { ticks: { color: 'white' } },
      y: { ticks: { color: 'white' } },
    },
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-center text-lg font-semibold text-white">📈 Έσοδα ανά Ημέρα</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default SalesRevenueLineChart;
