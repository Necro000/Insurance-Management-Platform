import React, { useState, useEffect } from 'react';
import { getPoliciesApi } from '../../api/policyApi';

const PaymentForm = ({ defaultPolicyId, onSubmit, submitting, error: serverError }) => {
  const [formData, setFormData] = useState({
    policyId: defaultPolicyId || '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'paid',
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
            setFormData((prev) => ({
              ...prev,
              policyId: res.data[0].id,
              amount: res.data[0].premiumAmount || '',
            }));
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

  const handlePolicyChange = (e) => {
    const selectedId = Number(e.target.value);
    const foundPolicy = policies.find((p) => p.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      policyId: selectedId,
      amount: foundPolicy ? foundPolicy.premiumAmount : prev.amount,
    }));
    if (errors.policyId) setErrors((prev) => ({ ...prev, policyId: '' }));
  };

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
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        policyId: Number(formData.policyId),
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentStatus: formData.paymentStatus,
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
          Select Policy *
        </label>
        {loadingPolicies ? (
          <div className="input-field animate-pulse text-xs text-[var(--color-muted)]">Loading active policies...</div>
        ) : (
          <select
            name="policyId"
            value={formData.policyId}
            onChange={handlePolicyChange}
            disabled={Boolean(defaultPolicyId)}
            className={`input-field cursor-pointer ${errors.policyId ? 'border-red-500' : ''}`}
          >
            {policies.length === 0 ? (
              <option value="">No active policies found</option>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Payment Amount (₹) *
          </label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="12000"
            className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
          />
          {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Payment Date *
          </label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className={`input-field ${errors.paymentDate ? 'border-red-500' : ''}`}
          />
          {errors.paymentDate && <p className="text-xs text-red-400 mt-1">{errors.paymentDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Payment Status
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="input-field cursor-pointer"
          >
            <option value="paid" className="bg-[var(--color-surface)]">Paid (Completed)</option>
            <option value="pending" className="bg-[var(--color-surface)]">Pending (Due)</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full md:w-auto px-6 py-2.5 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Recording...
            </>
          ) : (
            'Record Payment'
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
