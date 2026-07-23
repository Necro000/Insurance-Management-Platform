import React from 'react';

/**
 * Reusable generic Table component with skeleton loading & empty states.
 * @param {Array<{ key: string, label: string, align?: string }>} columns
 * @param {Array<object>} data
 * @param {boolean} loading
 * @param {string} emptyMessage
 * @param {Function} renderRow - (item, index) => ReactNode
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  renderRow,
}) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[var(--color-muted)] uppercase text-xs">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`px-6 py-4 font-semibold ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[var(--color-muted)]"
                >
                  <div className="text-3xl mb-2">📭</div>
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
