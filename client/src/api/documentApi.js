import axiosInstance from '../utils/axiosInstance';

/**
 * Upload a document file using FormData
 * @param {number|string} customerId
 * @param {File} file
 */
export const uploadDocumentApi = async (customerId, file) => {
  const formData = new FormData();
  formData.append('customerId', customerId);
  formData.append('file', file);

  const response = await axiosInstance.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetch documents for a customer
 * @param {number|string} customerId
 */
export const getDocumentsByCustomerApi = async (customerId) => {
  const response = await axiosInstance.get(`/documents/customer/${customerId}`);
  return response.data;
};

/**
 * Trigger file download for a document
 * @param {number|string} documentId
 * @param {string} fileName
 */
export const downloadDocumentApi = async (documentId, fileName) => {
  const response = await axiosInstance.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });

  // Create temporary download link in browser
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', fileName || `document-${documentId}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
