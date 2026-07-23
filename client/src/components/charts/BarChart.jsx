import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, title = 'Monthly Premium Collection' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--color-muted)]">
        No payment data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Collected Premium (₹)',
        data: data.map((d) => d.amount),
        backgroundColor: 'rgba(79, 70, 229, 0.75)',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: Boolean(title),
        text: title,
        color: '#94a3b8',
        font: { size: 12, weight: '600' },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
