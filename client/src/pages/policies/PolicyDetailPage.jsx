import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPolicyByIdApi, renewPolicyApi, cancelPolicyApi } from '../../api/policyApi';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const PolicyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const isCustomer = user?.role === 'customer';

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchPolicy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPolicyByIdApi(id);
      if (res.success) {
        setPolicy(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load policy details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const handleRenew = async () => {
    setActionMessage('');
    try {
      const res = await renewPolicyApi(id);
      if (res.success) {
        setActionMessage('Policy renewed successfully (+1 year added)');
        fetchPolicy();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to renew policy');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this policy?')) return;
    setActionMessage('');
    try {
      const res = await cancelPolicyApi(id);
      if (res.success) {
        setActionMessage('Policy cancelled successfully');
        fetchPolicy();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel policy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-sm text-[var(--color-muted)]">{error || 'Policy not found'}</p>
        <Link to="/policies" className="btn-primary inline-block">
          Back to Policies
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
            <h1 className="text-2xl font-bold text-gradient">{policy.policyNumber}</h1>
            <StatusBadge status={policy.status} />
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            {policy.policyType} • Customer: {policy.customer?.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {!isCustomer && policy.status !== 'cancelled' && (
            <button onClick={handleRenew} className="btn-primary bg-green-600 hover:bg-green-700">
              ↻ Renew Policy
            </button>
          )}

          {isAdmin && policy.status !== 'cancelled' && (
            <button onClick={handleCancel} className="btn-primary bg-red-600 hover:bg-red-700">
              ✕ Cancel Policy
            </button>
          )}

          <Link to="/policies" className="px-4 py-2 rounded-lg text-sm border border-[var(--color-border)] hover:bg-white/5">
            ← Back
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {actionMessage}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Premium Amount</div>
          <div className="text-lg font-bold text-indigo-400">{formatCurrency(policy.premiumAmount)}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Start Date</div>
          <div className="text-base font-semibold text-white">{formatDate(policy.startDate)}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">End Date</div>
          <div className="text-base font-semibold text-white">{formatDate(policy.endDate)}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Customer Contact</div>
          <div className="text-xs text-white">{policy.customer?.email}</div>
          <div className="text-xs text-[var(--color-muted)]">{policy.customer?.phone}</div>
        </div>
      </div>

      {/* Linked Claims Section */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Linked Claims ({policy.claims?.length || 0})</h3>
        {!policy.claims || policy.claims.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-2">No claims filed for this policy.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {policy.claims.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Claim #{c.id}</div>
                  <div className="text-xs text-[var(--color-muted)]">{c.reason}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-white">{formatCurrency(c.claimAmount)}</div>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Payments Section */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Payment History ({policy.payments?.length || 0})</h3>
        {!policy.payments || policy.payments.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-2">No payment records logged for this policy.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {policy.payments.map((pm) => (
              <div key={pm.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">{formatCurrency(pm.amount)}</div>
                  <div className="text-xs text-[var(--color-muted)]">Date: {formatDate(pm.paymentDate)}</div>
                </div>
                <StatusBadge status={pm.paymentStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyDetailPage;
