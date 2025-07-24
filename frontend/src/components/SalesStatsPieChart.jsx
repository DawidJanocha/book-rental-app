import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SalesStatsPieChart = ({ bestSellers }) => {
  const topBooks = bestSellers.slice(0, 10);

  const data = {
    labels: topBooks.map((item) => item.title),
    datasets: [
      {
        data: topBooks.map((item) => item.sold),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#33FF57',
          '#5733FF', '#FF33F0', '#F0FF33', '#33FFF0', '#FF9133',
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#33FF57',
          '#5733FF', '#FF33F0', '#F0FF33', '#33FFF0', '#FF9133',
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, // 🔥 Απενεργοποίηση εμφάνισης ονομάτων πάνω από το γράφημα
      },
    },
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      
      <Pie data={data} options={options} />
    </div>
  );
};

export default SalesStatsPieChart;
