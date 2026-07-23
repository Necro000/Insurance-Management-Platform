import axiosInstance from '../utils/axiosInstance';

/**
 * Fetch claims list with status filter and pagination
 */
export const getClaimsApi = async (params = {}) => {
  const response = await axiosInstance.get('/claims', { params });
  return response.data;
};

/**
 * Fetch single claim by ID
 */
export const getClaimByIdApi = async (id) => {
  const response = await axiosInstance.get(`/claims/${id}`);
  return response.data;
};

/**
 * Submit a new claim
 */
export const submitClaimApi = async (claimData) => {
  const response = await axiosInstance.post('/claims', claimData);
  return response.data;
};

/**
 * Update claim status (approve or reject)
 */
export const updateClaimStatusApi = async (id, status) => {
  const response = await axiosInstance.patch(`/claims/${id}/status`, { status });
  return response.data;
};
