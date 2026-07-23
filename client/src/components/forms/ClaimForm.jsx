import React, { useState, useEffect } from 'react';
import { getPoliciesApi } from '../../api/policyApi';

const ClaimForm = ({ defaultPolicyId, onSubmit, submitting, error: serverError }) => {
  const [formData, setFormData] = useState({
    policyId: defaultPolicyId || '',
    claimAmount: '',
    reason: '',
  });

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await getPoliciesApi({ status: 'active', limit: 100 });
        if (res.success) {
          setPolicies(res.data || []);
          if (!formData.policyId && res.data && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, policyId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load active policies:', err);
      } finally {
        setLoadingPolicies(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.policyId) {
      newErrors.policyId = 'Please select a policy';
    }
    if (!formData.claimAmount || Number(formData.claimAmount) <= 0) {
      newErrors.claimAmount = 'Claim amount must be greater than 0';
    }
    if (!formData.reason.trim() || formData.reason.trim().length < 5) {
      newErrors.reason = 'Please provide a detailed reason (at least 5 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        policyId: Number(formData.policyId),
        claimAmount: Number(formData.claimAmount),
        reason: formData.reason.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
          Select Active Policy *
        </label>
        {loadingPolicies ? (
          <div className="input-field animate-pulse text-xs text-[var(--color-muted)]">Loading policies...</div>
        ) : (
          <select
            name="policyId"
            value={formData.policyId}
            onChange={handleChange}
            disabled={Boolean(defaultPolicyId)}
            className={`input-field cursor-pointer ${errors.policyId ? 'border-red-500' : ''}`}
          >
            {policies.length === 0 ? (
              <option value="">No active policies available to file claims</option>
            ) : (
              policies.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--color-surface)]">
                  {p.policyNumber} ({p.policyType} - {p.customer?.name})
                </option>
              ))
            )}
          </select>
        )}
        {errors.policyId && <p className="text-xs text-red-400 mt-1">{errors.policyId}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
          Requested Claim Amount (₹) *
        </label>
        <input
          type="number"
          name="claimAmount"
          step="0.01"
          value={formData.claimAmount}
          onChange={handleChange}
          placeholder="25000"
          className={`input-field ${errors.claimAmount ? 'border-red-500' : ''}`}
        />
        {errors.claimAmount && <p className="text-xs text-red-400 mt-1">{errors.claimAmount}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
          Reason / Description for Claim *
        </label>
        <textarea
          name="reason"
          rows="4"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Describe the incident, damage, or medical event in detail..."
          className={`input-field ${errors.reason ? 'border-red-500' : ''}`}
        />
        {errors.reason && <p className="text-xs text-red-400 mt-1">{errors.reason}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || policies.length === 0}
          className="btn-primary w-full md:w-auto px-6 py-2.5 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Submitting Claim...
            </>
          ) : (
            'Submit Claim Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default ClaimForm;
