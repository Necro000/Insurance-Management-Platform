import React, { useState, useEffect } from 'react';

const CustomerForm = ({ initialValues, onSubmit, submitting, error: serverError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        dob: initialValues.dob ? new Date(initialValues.dob).toISOString().split('T')[0] : '',
        address: initialValues.address || '',
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
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dob = 'Customer must be at least 18 years old';
        }
      }
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
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
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Phone Number *
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className={`input-field ${errors.dob ? 'border-red-500' : ''}`}
          />
          {errors.dob && <p className="text-xs text-red-400 mt-1">{errors.dob}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
          Address *
        </label>
        <textarea
          name="address"
          rows="3"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main Street, City, State, Pincode"
          className={`input-field ${errors.address ? 'border-red-500' : ''}`}
        />
        {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address}</p>}
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
              Saving...
            </>
          ) : (
            'Save Customer'
          )}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
