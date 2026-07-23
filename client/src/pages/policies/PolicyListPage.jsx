import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPoliciesApi, renewPolicyApi, cancelPolicyApi } from '../../api/policyApi';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const PolicyListPage = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [actionError, setActionError] = useState('');

  const fetchPolicies = async (statusVal = statusFilter, searchQuery = search, pageNum = page) => {
    setLoading(true);
    setActionError('');
    try {
      const res = await getPoliciesApi({
        status: statusVal,
        search: searchQuery,
        page: pageNum,
        limit: 10,
      });
      if (res.success) {
        setPolicies(res.data || []);
        setMeta(res.meta || { total: 0, totalPages: 1, page: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies(statusFilter, search, page);
  }, [statusFilter, search, page]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1);
  };

  const handleRenew = async (id) => {
    try {
      const res = await renewPolicyApi(id);
      if (res.success) {
        fetchPolicies(statusFilter, search, page);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to renew policy');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this policy?')) return;
    try {
      const res = await cancelPolicyApi(id);
      if (res.success) {
        fetchPolicies(statusFilter, search, page);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel policy');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Insurance Policies</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {isCustomer
              ? 'View your active, expired, and cancelled policies'
              : 'Issue, renew, and manage insurance policies across all customers'}
          </p>
        </div>
        {!isCustomer && (
          <Link to="/policies/new" className="btn-primary flex items-center justify-center gap-2">
            <span>+</span> Issue Policy
          </Link>
        )}
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-field cursor-pointer text-xs"
          >
            <option value="" className="bg-[var(--color-surface)]">All Statuses</option>
            <option value="active" className="bg-[var(--color-surface)]">Active</option>
            <option value="expired" className="bg-[var(--color-surface)]">Expired</option>
            <option value="cancelled" className="bg-[var(--color-surface)]">Cancelled</option>
          </select>
        </div>

        <div className="flex-1 w-full">
          <SearchBar
            placeholder="Search policies by number, type, or customer name..."
            onSearch={handleSearch}
            initialValue={search}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[var(--color-muted)] uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Policy Number</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Premium</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                    <p>Loading policies...</p>
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    No policies found.
                  </td>
                </tr>
              ) : (
                policies.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-white">
                      <Link to={`/policies/${p.id}`} className="hover:text-indigo-400">
                        {p.policyNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{p.policyType}</td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {p.customer?.name || '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-400">
                      {formatCurrency(p.premiumAmount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-muted)]">
                      {formatDate(p.startDate)} → {formatDate(p.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/policies/${p.id}`}
                        className="text-xs text-indigo-400 hover:underline font-semibold"
                      >
                        View
                      </Link>

                      {!isCustomer && p.status !== 'cancelled' && (
                        <button
                          onClick={() => handleRenew(p.id)}
                          className="text-xs text-green-400 hover:underline"
                        >
                          Renew
                        </button>
                      )}

                      {isAdmin && p.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(p.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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

export default PolicyListPage;
