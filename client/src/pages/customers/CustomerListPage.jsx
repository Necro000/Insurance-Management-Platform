import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomersApi } from '../../api/customerApi';
import { formatDate } from '../../utils/formatDate';

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });

  const fetchCustomers = async (searchQuery = '', pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getCustomersApi({
        search: searchQuery,
        page: pageNum,
        limit: 10,
      });
      if (res.success) {
        setCustomers(res.data || []);
        setMeta(res.meta || { total: 0, totalPages: 1, page: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search, page);
  }, [page]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    fetchCustomers(value, 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Customers</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage customer records, view policy history, and add new clients
          </p>
        </div>
        <Link to="/customers/new" className="btn-primary flex items-center justify-center gap-2">
          <span>+</span> Add Customer
        </Link>
      </div>

      <div className="card p-4 flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, email, or phone..."
          className="input-field border-none bg-transparent focus:bg-transparent focus:outline-none"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[var(--color-muted)] uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Date of Birth</th>
                <th className="px-6 py-4 font-semibold">Policies</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                    <p>Loading customers...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[var(--color-muted)]">
                    No customers found. {search && 'Try clearing your search query.'}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <Link to={`/customers/${c.id}`} className="hover:text-indigo-400">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{c.email}</div>
                      <div className="text-xs text-[var(--color-muted)]">{c.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {formatDate(c.dob)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400">
                        {c._count?.policies || 0} Policies
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/customers/${c.id}`}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        to={`/customers/${c.id}/edit`}
                        className="text-xs text-[var(--color-muted)] hover:text-white"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-muted)]">
            <div>
              Showing page <span className="font-semibold text-white">{meta.page}</span> of{' '}
              <span className="font-semibold text-white">{meta.totalPages}</span> ({meta.total} total)
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerListPage;
