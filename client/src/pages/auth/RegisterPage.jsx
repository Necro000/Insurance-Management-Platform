import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      const res = await register(payload);
      if (res.success) {
        navigate('/login', {
          state: { message: 'Registration successful! Please sign in.' },
        });
      } else {
        setServerError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="card max-w-md w-full p-8 space-y-6 animate-fade-in glass">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-2 text-2xl">
            📝
          </div>
          <h1 className="text-2xl font-bold text-gradient">Create Account</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Join the Insurance Management Platform
          </p>
        </div>

        {serverError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field cursor-pointer"
            >
              <option value="customer" className="bg-[var(--color-surface)]">Customer</option>
              <option value="agent" className="bg-[var(--color-surface)]">Insurance Agent</option>
              <option value="admin" className="bg-[var(--color-surface)]">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary mt-2 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-[var(--color-muted)] pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
