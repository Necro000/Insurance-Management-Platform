import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PolicyForm from '../../components/forms/PolicyForm';
import { createPolicyApi, getPolicyByIdApi, updatePolicyApi } from '../../api/policyApi';

const PolicyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchPolicy = async () => {
        try {
          const res = await getPolicyByIdApi(id);
          if (res.success) {
            setInitialValues(res.data);
          }
        } catch (err) {
          setServerError(err.response?.data?.message || 'Failed to load policy');
        } finally {
          setLoading(false);
        }
      };
      fetchPolicy();
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (isEdit) {
        const res = await updatePolicyApi(id, formData);
        if (res.success) {
          navigate(`/policies/${id}`);
        } else {
          setServerError(res.message || 'Failed to update policy');
        }
      } else {
        const res = await createPolicyApi(formData);
        if (res.success && res.data) {
          navigate(`/policies/${res.data.id}`);
        } else {
          setServerError(res.message || 'Failed to create policy');
        }
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'An error occurred while saving policy data'
      );
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">
            {isEdit ? 'Edit Policy' : 'Issue New Policy'}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {isEdit ? 'Update policy terms and coverage dates' : 'Create an insurance policy for a customer'}
          </p>
        </div>
        <Link to="/policies" className="text-sm text-[var(--color-muted)] hover:text-white">
          ← Back
        </Link>
      </div>

      <div className="card p-8">
        <PolicyForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={serverError}
        />
      </div>
    </div>
  );
};

export default PolicyFormPage;
