import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

/**
 * Reusable StatusBadge component.
 * Renders colored pill for active/expired/cancelled/pending/approved/rejected/paid/overdue.
 * @param {string} status - Status string
 */
const StatusBadge = ({ status }) => {
  if (!status) return null;

  const key = status.toLowerCase();
  const colorClass = STATUS_COLORS[key] || 'bg-gray-100 text-gray-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
