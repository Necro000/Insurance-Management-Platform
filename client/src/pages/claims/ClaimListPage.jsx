import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClaimsApi } from '../../api/claimApi';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const ClaimListPage = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });

  const fetchClaims = async (statusVal = statusFilter, searchQuery = search, pageNum = page) => {
    setLoading(true);
    try {
      const res = await getClaimsApi({
        status: statusVal,
        search: searchQuery,
        page: pageNum,
        limit: 10,
      });
      if (res.success) {
        setClaims(res.data || []);
        setMeta(res.meta || { total: 0, totalPages: 1, page: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims(statusFilter, search, page);
  }, [statusFilter, search, page]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Insurance Claims</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {isCustomer
              ? 'Track your submitted claims and their approval status'
              : 'Review submitted claims, verify documents, and approve or reject requests'}
          </p>
        </div>
        {isCustomer && (
          <Link to="/claims/new" className="btn-primary flex items-center justify-center gap-2">
            <span>+</span> File New Claim
          </Link>
        )}
      </div>

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
            <option value="pending" className="bg-[var(--color-surface)]">Pending</option>
            <option value="approved" className="bg-[var(--color-surface)]">Approved</option>
            <option value="rejected" className="bg-[var(--color-surface)]">Rejected</option>
          </select>
        </div>

        <div className="flex-1 w-full">
          <SearchBar
            placeholder="Search claims by reason, policy number, or customer name..."
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
                <th className="px-6 py-4 font-semibold">Claim ID</th>
                <th className="px-6 py-4 font-semibold">Policy</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Submitted Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                    <p>Loading claims...</p>
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    No claims found.
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-[var(--color-muted)]">
                      #{c.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <Link to={`/policies/${c.policy?.id}`} className="hover:text-indigo-400 font-mono">
                        {c.policy?.policyNumber || `Policy #${c.policyId}`}
                      </Link>
                      <div className="text-xs font-normal text-[var(--color-muted)]">
                        {c.policy?.policyType}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {c.policy?.customer?.name || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-400">
                      {formatCurrency(c.claimAmount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-muted)]">
                      {formatDate(c.submissionDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/claims/${c.id}`}
                        className="text-xs text-indigo-400 hover:underline font-semibold"
                      >
                        Review →
                      </Link>
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

export default ClaimListPage;
