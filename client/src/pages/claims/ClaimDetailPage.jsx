import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClaimByIdApi, updateClaimStatusApi } from '../../api/claimApi';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const ClaimDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getClaimByIdApi(id);
      if (res.success) {
        setClaim(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this claim as ${newStatus.toUpperCase()}?`)) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await updateClaimStatusApi(id, newStatus);
      if (res.success) {
        setSuccessMsg(`Claim has been successfully ${newStatus}!`);
        fetchClaim();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update claim status to ${newStatus}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !claim) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-sm text-[var(--color-muted)]">{error}</p>
        <Link to="/claims" className="btn-primary inline-block">
          Back to Claims
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gradient">Claim #{claim.id}</h1>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            Policy: {claim.policy?.policyNumber} ({claim.policy?.policyType}) • Customer: {claim.policy?.customer?.name}
          </p>
        </div>

        <Link to="/claims" className="px-4 py-2 rounded-lg text-sm border border-[var(--color-border)] hover:bg-white/5 self-start">
          ← Back to Claims
        </Link>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Claim Amount</div>
          <div className="text-xl font-bold text-indigo-400">{formatCurrency(claim.claimAmount)}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Submission Date</div>
          <div className="text-base font-semibold text-white">{formatDate(claim.submissionDate)}</div>
        </div>

        <div className="card p-5 space-y-1">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Policy Status</div>
          <div className="text-base font-semibold uppercase text-green-400">{claim.policy?.status}</div>
        </div>
      </div>

      {/* Claim Description / Reason */}
      <div className="card p-6 space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
          Claim Description & Reason
        </h3>
        <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{claim.reason}</p>
      </div>

      {/* Customer & Policy Details */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--color-muted)]">Name: </span>
            <span className="text-white font-semibold">{claim.policy?.customer?.name}</span>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Email: </span>
            <span className="text-white font-semibold">{claim.policy?.customer?.email}</span>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Phone: </span>
            <span className="text-white font-semibold">{claim.policy?.customer?.phone}</span>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Policy Premium: </span>
            <span className="text-indigo-400 font-semibold">{formatCurrency(claim.policy?.premiumAmount)}</span>
          </div>
        </div>
      </div>

      {/* Action Box for Admin & Agent (Deliverable 412 & 413) */}
      {!isCustomer && claim.status === 'pending' && (
        <div className="card p-6 border-indigo-500/30 bg-indigo-500/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Agent Verification & Claim Decision
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            Review the details and supporting documentation before making a final decision on this claim request.
          </p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => handleStatusUpdate('approved')}
              disabled={submitting}
              className="btn-primary bg-green-600 hover:bg-green-700 px-6 py-2.5"
            >
              ✓ Approve Claim
            </button>

            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={submitting}
              className="btn-primary bg-red-600 hover:bg-red-700 px-6 py-2.5"
            >
              ✕ Reject Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDetailPage;
