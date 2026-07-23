import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

/**
 * Reusable StatusBadge component with glowing indicator dots.
 * @param {string} status - Status string
 */
const StatusBadge = ({ status }) => {
  if (!status) return null;

  const key = status.toLowerCase();
  const colorClass = STATUS_COLORS[key] || 'bg-slate-500/15 text-slate-400 border border-slate-500/30';

  const dotColors = {
    active: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    approved: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    paid: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
    pending: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    overdue: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
    cancelled: 'bg-rose-400',
    rejected: 'bg-rose-400',
    expired: 'bg-slate-400',
  };

  const dotClass = dotColors[key] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${colorClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
