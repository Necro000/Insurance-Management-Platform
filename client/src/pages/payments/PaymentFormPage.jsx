import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import PaymentForm from '../../components/forms/PaymentForm';
import { recordPaymentApi } from '../../api/paymentApi';

const PaymentFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultPolicyId = searchParams.get('policyId');

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setServerError('');

    try {
      const res = await recordPaymentApi(formData);
      if (res.success) {
        navigate('/payments');
      } else {
        setServerError(res.message || 'Failed to record payment');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'An error occurred while recording payment'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Record Premium Payment</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Log a premium payment transaction for an active policy
          </p>
        </div>
        <Link to="/payments" className="text-sm text-[var(--color-muted)] hover:text-white">
          ← Back
        </Link>
      </div>

      <div className="card p-8">
        <PaymentForm
          defaultPolicyId={defaultPolicyId}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={serverError}
        />
      </div>
    </div>
  );
};

export default PaymentFormPage;
