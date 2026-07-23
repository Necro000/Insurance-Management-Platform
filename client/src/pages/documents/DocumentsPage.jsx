import React, { useState, useEffect } from 'react';
import { getCustomersApi } from '../../api/customerApi';
import {
  uploadDocumentApi,
  getDocumentsByCustomerApi,
  downloadDocumentApi,
} from '../../api/documentApi';
import { formatDate } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const DocumentsPage = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch customer options on mount for Admin/Agent
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomersApi({ limit: 100 });
        if (res.success && res.data) {
          setCustomers(res.data);
          if (res.data.length > 0) {
            setSelectedCustomerId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load customers for selection:', err);
      }
    };

    if (!isCustomer) {
      fetchCustomers();
    }
  }, [isCustomer]);

  // Load documents whenever selected customer changes
  const loadDocuments = async (customerId) => {
    if (!customerId) return;
    setLoadingDocs(true);
    setError('');
    try {
      const res = await getDocumentsByCustomerApi(customerId);
      if (res.success) {
        setDocuments(res.data?.documents || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      loadDocuments(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // EC-D01: Client side size check (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Selected file exceeds 5MB limit. Please choose a smaller file.');
        setFile(null);
        return;
      }
      // EC-D02: Client side MIME check
      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowed.includes(selectedFile.type)) {
        setError('Invalid file format. Only JPEG, PNG, and PDF files are allowed.');
        setFile(null);
        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer for this document');
      return;
    }
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await uploadDocumentApi(selectedCustomerId, file);
      if (res.success) {
        setSuccessMsg(`"${file.name}" uploaded successfully!`);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload-input');
        if (fileInput) fileInput.value = '';
        loadDocuments(selectedCustomerId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      await downloadDocumentApi(docId, fileName);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download file');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gradient">Document Management</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Upload and retrieve identity proofs, policy forms, and claim evidence (JPEG, PNG, PDF ≤ 5MB)
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* Upload Form Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Upload New Document</h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {!isCustomer && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="input-field cursor-pointer max-w-md"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[var(--color-surface)]">
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--color-muted)]">
              Choose File (Max 5MB) *
            </label>
            <input
              id="file-upload-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="input-field max-w-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer"
            />
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Allowed formats: JPG, PNG, PDF (Up to 5MB)
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary px-6 py-2.5 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Uploading...
              </>
            ) : (
              '📤 Upload File'
            )}
          </button>
        </form>
      </div>

      {/* Uploaded Documents List Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">
          Uploaded Documents ({documents.length})
        </h3>

        {loadingDocs ? (
          <div className="py-8 text-center text-[var(--color-muted)]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-4 text-center">
            No documents uploaded yet for this customer.
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {documents.map((doc) => {
              const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
              return (
                <div key={doc.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{isPdf ? '📄' : '🖼️'}</span>
                    <div>
                      <div className="font-semibold text-sm text-white">{doc.fileName}</div>
                      <div className="text-xs text-[var(--color-muted)]">
                        Uploaded on: {formatDate(doc.uploadedAt)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white"
                  >
                    <span>⬇</span> Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
