import React, { createContext, useState, useEffect } from 'react';
import { loginUserApi, registerUserApi, getCurrentUserApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount or when token changes
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUserApi();
        if (res.success) {
          setUser(res.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginUserApi(credentials);
    if (res.success && res.data?.token) {
      const newToken = res.data.token;
      try {
        localStorage.setItem('token', newToken);
      } catch (e) {
        console.error('Failed to save token to localStorage:', e);
      }
      setToken(newToken);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await registerUserApi(userData);
    return res;
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      console.error('Failed to remove token:', e);
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
