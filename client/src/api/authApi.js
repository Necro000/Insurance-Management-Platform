import axiosInstance from '../utils/axiosInstance';

/**
 * Register a new user
 * @param {object} userData - { name, email, password, role }
 */
export const registerUserApi = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {object} credentials - { email, password }
 */
export const loginUserApi = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch current user profile
 */
export const getCurrentUserApi = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
