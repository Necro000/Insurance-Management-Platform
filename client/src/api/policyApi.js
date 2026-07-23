import axiosInstance from '../utils/axiosInstance';

/**
 * Fetch policies with optional status filter, search, and pagination
 */
export const getPoliciesApi = async (params = {}) => {
  const response = await axiosInstance.get('/policies', { params });
  return response.data;
};

/**
 * Fetch single policy details by ID
 */
export const getPolicyByIdApi = async (id) => {
  const response = await axiosInstance.get(`/policies/${id}`);
  return response.data;
};

/**
 * Create a new policy
 */
export const createPolicyApi = async (policyData) => {
  const response = await axiosInstance.post('/policies', policyData);
  return response.data;
};

/**
 * Update policy information
 */
export const updatePolicyApi = async (id, policyData) => {
  const response = await axiosInstance.put(`/policies/${id}`, policyData);
  return response.data;
};

/**
 * Renew policy (extends end date by 1 year)
 */
export const renewPolicyApi = async (id) => {
  const response = await axiosInstance.patch(`/policies/${id}/renew`);
  return response.data;
};

/**
 * Cancel policy
 */
export const cancelPolicyApi = async (id) => {
  const response = await axiosInstance.patch(`/policies/${id}/cancel`);
  return response.data;
};
