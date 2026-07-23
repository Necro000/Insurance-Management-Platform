import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const res = await login(formData);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setServerError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Unable to connect to server. Please try again later.'
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
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-gradient">Welcome Back</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Sign in to access your Insurance Management account
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
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
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
              placeholder="••••••••"
              className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary mt-2 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-[var(--color-muted)] pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
