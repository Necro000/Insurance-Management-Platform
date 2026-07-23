import axiosInstance from '../utils/axiosInstance';

/**
 * Fetch payments list with optional status filter and pagination
 */
export const getPaymentsApi = async (params = {}) => {
  const response = await axiosInstance.get('/payments', { params });
  return response.data;
};

/**
 * Fetch payments for a specific policy
 */
export const getPaymentsByPolicyApi = async (policyId) => {
  const response = await axiosInstance.get(`/payments/policy/${policyId}`);
  return response.data;
};

/**
 * Record a new premium payment
 */
export const recordPaymentApi = async (paymentData) => {
  const response = await axiosInstance.post('/payments', paymentData);
  return response.data;
};
