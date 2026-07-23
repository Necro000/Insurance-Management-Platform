import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaymentsApi } from '../../api/paymentApi';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatCurrency } from '../../utils/formatDate';

const PaymentListPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });

  const fetchPayments = async (statusVal = statusFilter, pageNum = page) => {
    setLoading(true);
    try {
      const res = await getPaymentsApi({
        status: statusVal,
        page: pageNum,
        limit: 10,
      });
      if (res.success) {
        setPayments(res.data || []);
        setMeta(res.meta || { total: 0, totalPages: 1, page: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(statusFilter, page);
  }, [statusFilter, page]);

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Premium Payments</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Track premium payment transactions, due dates, and overdue alerts
          </p>
        </div>
        <Link to="/payments/new" className="btn-primary flex items-center justify-center gap-2">
          <span>+</span> Record Payment
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="input-field cursor-pointer text-xs"
          >
            <option value="" className="bg-[var(--color-surface)]">All Statuses (Paid / Pending / Overdue)</option>
            <option value="paid" className="bg-[var(--color-surface)]">Paid</option>
            <option value="pending" className="bg-[var(--color-surface)]">Pending</option>
            <option value="overdue" className="bg-[var(--color-surface)]">Overdue ⚠️</option>
          </select>
        </div>

        <div className="text-xs text-[var(--color-muted)]">
          Total Recorded: <span className="font-semibold text-white">{meta.total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[var(--color-muted)] uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Payment ID</th>
                <th className="px-6 py-4 font-semibold">Policy</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Payment Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                    <p>Loading payment records...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((pm) => {
                  const isOverdue = pm.paymentStatus === 'overdue';
                  return (
                    <tr
                      key={pm.id}
                      className={`transition-colors ${
                        isOverdue ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-[var(--color-muted)]">
                        #{pm.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        <Link to={`/policies/${pm.policy?.id}`} className="hover:text-indigo-400 font-mono">
                          {pm.policy?.policyNumber || `Policy #${pm.policyId}`}
                        </Link>
                        <div className="text-xs font-normal text-[var(--color-muted)]">
                          {pm.policy?.policyType}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {pm.policy?.customer?.name || '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-400">
                        {formatCurrency(pm.amount)}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--color-muted)]">
                        {formatDate(pm.paymentDate)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={pm.paymentStatus} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default PaymentListPage;
