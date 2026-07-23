import axiosInstance from '../utils/axiosInstance';

/**
 * Fetch list of customers with search and pagination
 */
export const getCustomersApi = async (params = {}) => {
  const response = await axiosInstance.get('/customers', { params });
  return response.data;
};

/**
 * Fetch single customer by ID
 */
export const getCustomerByIdApi = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data;
};

/**
 * Create a new customer
 */
export const createCustomerApi = async (customerData) => {
  const response = await axiosInstance.post('/customers', customerData);
  return response.data;
};

/**
 * Update existing customer
 */
export const updateCustomerApi = async (id, customerData) => {
  const response = await axiosInstance.put(`/customers/${id}`, customerData);
  return response.data;
};

/**
 * Fetch customer history (policies & claims)
 */
export const getCustomerHistoryApi = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}/history`);
  return response.data;
};
