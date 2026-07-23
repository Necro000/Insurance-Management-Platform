import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title = 'Claims Breakdown' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--color-muted)]">
        No claims data available
      </div>
    );
  }

  const colorMap = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    active: '#10b981',
    expired: '#6b7280',
    cancelled: '#ef4444',
  };

  const chartData = {
    labels: data.map((d) => (d.status || d.type || 'Other').toUpperCase()),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map(
          (d) => colorMap[(d.status || d.type || '').toLowerCase()] || '#4f46e5'
        ),
        borderColor: '#1e1e2e',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          font: { size: 11 },
          padding: 12,
        },
      },
      title: {
        display: Boolean(title),
        text: title,
        color: '#94a3b8',
        font: { size: 12, weight: '600' },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
