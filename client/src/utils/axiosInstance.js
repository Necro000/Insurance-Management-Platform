import axios from 'axios';

/**
 * Axios instance pre-configured with:
 * - Base URL from VITE_API_URL env variable
 * - Automatic JWT injection on every request
 * - Auto-redirect to /login on 401 Unauthorized (EC-UI03)
 * - 10s timeout to prevent hanging requests (EC-API06)
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach JWT ────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token'); // EC-UI02: wrapped in try/catch
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage may be disabled (private browsing)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 ───────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // EC-UI03: JWT expired mid-session — clear token and redirect to login
      try {
        localStorage.removeItem('token');
      } catch {
        // ignore
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
