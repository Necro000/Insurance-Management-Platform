import axiosInstance from '../utils/axiosInstance';

/**
 * Fetch dashboard aggregated stats
 */
export const getDashboardStatsApi = async () => {
  const response = await axiosInstance.get('/reports/dashboard');
  return response.data;
};

/**
 * Fetch policy breakdown report
 */
export const getPolicyReportApi = async () => {
  const response = await axiosInstance.get('/reports/policies');
  return response.data;
};

/**
 * Fetch claim breakdown report
 */
export const getClaimReportApi = async () => {
  const response = await axiosInstance.get('/reports/claims');
  return response.data;
};

/**
 * Fetch premium payments report
 */
export const getPremiumReportApi = async () => {
  const response = await axiosInstance.get('/reports/premiums');
  return response.data;
};

/**
 * Trigger PDF report download
 */
export const downloadPdfReportApi = async () => {
  const response = await axiosInstance.get('/reports/export/pdf', {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `insurance_summary_${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
