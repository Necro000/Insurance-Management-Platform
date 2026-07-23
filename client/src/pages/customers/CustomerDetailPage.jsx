import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerByIdApi, getCustomerHistoryApi } from '../../api/customerApi';
import { formatDate, formatCurrency } from '../../utils/formatDate';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState({ policies: [], claims: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customerRes, historyRes] = await Promise.all([
          getCustomerByIdApi(id),
          getCustomerHistoryApi(id),
        ]);
        if (customerRes.success) setCustomer(customerRes.data);
        if (historyRes.success) setHistory(historyRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-sm text-[var(--color-muted)]">{error || 'Customer not found'}</p>
        <Link to="/customers" className="btn-primary inline-block">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gradient">{customer.name}</h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold">
              ID: #{customer.id}
            </span>
          </div>
          <p className="text-sm text-[var(--color-muted)]">{customer.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/customers/${customer.id}/edit`} className="btn-primary">
            Edit Customer
          </Link>
        </div>
      </div>

      {/* Info Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Phone Number</div>
          <div className="text-base font-semibold text-white">{customer.phone}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Date of Birth</div>
          <div className="text-base font-semibold text-white">{formatDate(customer.dob)}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Address</div>
          <div className="text-sm text-white">{customer.address}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-6 space-y-4">
        <div className="flex border-b border-[var(--color-border)] gap-6">
          <button
            onClick={() => setActiveTab('policies')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'policies' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[var(--color-muted)]'
            }`}
          >
            Policies ({history.policies?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'claims' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[var(--color-muted)]'
            }`}
          >
            Claims ({history.claims?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'policies' && (
          <div>
            {!history.policies || history.policies.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] py-4 text-center">
                No insurance policies found for this customer.
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {history.policies.map((p) => (
                  <div key={p.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{p.policyNumber} ({p.policyType})</div>
                      <div className="text-xs text-[var(--color-muted)]">
                        Coverage: {formatDate(p.startDate)} - {formatDate(p.endDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-indigo-400">{formatCurrency(p.premiumAmount)}</div>
                      <span className="text-xs uppercase font-bold text-green-400">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            {!history.claims || history.claims.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] py-4 text-center">
                No claims filed for this customer.
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {history.claims.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Claim #{c.id} ({c.policyNumber})</div>
                      <div className="text-xs text-[var(--color-muted)]">{c.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{formatCurrency(c.claimAmount)}</div>
                      <span className="text-xs uppercase font-bold text-yellow-400">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailPage;
