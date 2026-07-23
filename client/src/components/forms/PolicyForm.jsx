import React, { useState, useEffect } from 'react';
import { getCustomersApi } from '../../api/customerApi';

const POLICY_TYPES = [
  'Health Insurance',
  'Life Insurance',
  'Motor Insurance',
  'Home Insurance',
  'Travel Insurance',
  'Commercial Insurance',
];

const PolicyForm = ({ initialValues, onSubmit, submitting, error: serverError }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    policyType: 'Health Insurance',
    premiumAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    })(),
    policyNumber: '',
  });

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomersApi({ limit: 100 });
        if (res.success) {
          setCustomers(res.data || []);
          if (!formData.customerId && res.data && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, customerId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load customers for dropdown:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        customerId: initialValues.customerId || '',
        policyType: initialValues.policyType || 'Health Insurance',
        premiumAmount: initialValues.premiumAmount || '',
        startDate: initialValues.startDate ? new Date(initialValues.startDate).toISOString().split('T')[0] : '',
        endDate: initialValues.endDate ? new Date(initialValues.endDate).toISOString().split('T')[0] : '',
        policyNumber: initialValues.policyNumber || '',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerId) {
      newErrors.customerId = 'Please select a customer';
    }
    if (!formData.policyType) {
      newErrors.policyType = 'Policy type is required';
    }
    if (!formData.premiumAmount || Number(formData.premiumAmount) <= 0) {
      newErrors.premiumAmount = 'Premium amount must be greater than 0';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be strictly after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        customerId: Number(formData.customerId),
        premiumAmount: Number(formData.premiumAmount),
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Select Customer *
          </label>
          {loadingCustomers ? (
            <div className="input-field animate-pulse text-xs text-[var(--color-muted)]">Loading customers...</div>
          ) : (
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              disabled={Boolean(initialValues)}
              className={`input-field cursor-pointer ${errors.customerId ? 'border-red-500' : ''}`}
            >
              {customers.length === 0 ? (
                <option value="">No customers found — create customer first</option>
              ) : (
                customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[var(--color-surface)]">
                    {c.name} ({c.email})
                  </option>
                ))
              )}
            </select>
          )}
          {errors.customerId && <p className="text-xs text-red-400 mt-1">{errors.customerId}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Policy Type *
          </label>
          <select
            name="policyType"
            value={formData.policyType}
            onChange={handleChange}
            className={`input-field cursor-pointer ${errors.policyType ? 'border-red-500' : ''}`}
          >
            {POLICY_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[var(--color-surface)]">
                {type}
              </option>
            ))}
          </select>
          {errors.policyType && <p className="text-xs text-red-400 mt-1">{errors.policyType}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Premium Amount (₹) *
          </label>
          <input
            type="number"
            name="premiumAmount"
            step="0.01"
            value={formData.premiumAmount}
            onChange={handleChange}
            placeholder="12000"
            className={`input-field ${errors.premiumAmount ? 'border-red-500' : ''}`}
          />
          {errors.premiumAmount && <p className="text-xs text-red-400 mt-1">{errors.premiumAmount}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
          />
          {errors.startDate && <p className="text-xs text-red-400 mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            End Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
          />
          {errors.endDate && <p className="text-xs text-red-400 mt-1">{errors.endDate}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
          Custom Policy Number (Optional)
        </label>
        <input
          type="text"
          name="policyNumber"
          value={formData.policyNumber}
          onChange={handleChange}
          placeholder="Leave blank to auto-generate (e.g. POL-171829-8392)"
          className="input-field"
        />
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
              Saving Policy...
            </>
          ) : (
            'Save Policy'
          )}
        </button>
      </div>
    </form>
  );
};

export default PolicyForm;
