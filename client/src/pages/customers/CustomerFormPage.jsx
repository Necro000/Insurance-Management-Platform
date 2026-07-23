import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CustomerForm from '../../components/forms/CustomerForm';
import {
  createCustomerApi,
  getCustomerByIdApi,
  updateCustomerApi,
} from '../../api/customerApi';
import { useToast } from '../../context/ToastContext';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addToast } = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const res = await getCustomerByIdApi(id);
          if (res.success) {
            setInitialValues(res.data);
          }
        } catch (err) {
          setServerError(err.response?.data?.message || 'Failed to load customer');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setServerError('');

    try {
      if (isEdit) {
        const res = await updateCustomerApi(id, formData);
        if (res.success) {
          addToast('Customer updated successfully!', 'success');
          navigate(`/customers/${id}`);
        } else {
          setServerError(res.message || 'Failed to update customer');
          addToast(res.message || 'Failed to update customer', 'error');
        }
      } else {
        const res = await createCustomerApi(formData);
        if (res.success && res.data) {
          addToast('Customer created successfully!', 'success');
          navigate(`/customers/${res.data.id}`);
        } else {
          setServerError(res.message || 'Failed to create customer');
          addToast(res.message || 'Failed to create customer', 'error');
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'An error occurred while saving customer data';
      setServerError(errMsg);
      addToast(errMsg, 'error');
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {isEdit ? 'Update customer profile and contact info' : 'Register a new customer profile'}
          </p>
        </div>
        <Link to="/customers" className="text-sm text-[var(--color-muted)] hover:text-white">
          ← Back
        </Link>
      </div>

      <div className="card p-8">
        <CustomerForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={serverError}
        />
      </div>
    </div>
  );
};

export default CustomerFormPage;
