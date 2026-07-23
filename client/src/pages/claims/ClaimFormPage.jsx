import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import ClaimForm from '../../components/forms/ClaimForm';
import { submitClaimApi } from '../../api/claimApi';

const ClaimFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultPolicyId = searchParams.get('policyId');

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setServerError('');

    try {
      const res = await submitClaimApi(formData);
      if (res.success && res.data) {
        navigate(`/claims/${res.data.id}`);
      } else {
        setServerError(res.message || 'Failed to submit claim');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'An error occurred while submitting your claim'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">File Insurance Claim</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Submit a claim request with incident details against your active policy
          </p>
        </div>
        <Link to="/claims" className="text-sm text-[var(--color-muted)] hover:text-white">
          ← Back
        </Link>
      </div>

      <div className="card p-8">
        <ClaimForm
          defaultPolicyId={defaultPolicyId}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={serverError}
        />
      </div>
    </div>
  );
};

export default ClaimFormPage;
