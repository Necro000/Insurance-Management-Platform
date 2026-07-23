import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, title = 'Customer Growth' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--color-muted)]">
        No growth data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        fill: true,
        label: 'Total Customers',
        data: data.map((d) => d.count),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#0ea5e9',
        pointRadius: 4,
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
