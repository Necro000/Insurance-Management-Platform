import React, { useState, useEffect } from 'react';
import { getCustomersApi } from '../../api/customerApi';
import {
  uploadDocumentApi,
  getDocumentsByCustomerApi,
  downloadDocumentApi,
} from '../../api/documentApi';
import { formatDate } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const DocumentsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isCustomer = user?.role === 'customer';

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resolve target customer ID on mount (Auto-select own profile for Customer role)
  useEffect(() => {
    const initCustomerSelection = async () => {
      try {
        if (isCustomer) {
          // Search for customer record matching logged-in user email
          const res = await getCustomersApi({ search: user?.email, limit: 10 });
          if (res.success && res.data && res.data.length > 0) {
            // Match exact email
            const matched = res.data.find(
              (c) => c.email.toLowerCase() === user?.email.toLowerCase()
            ) || res.data[0];
            setSelectedCustomerId(matched.id);
          }
        } else {
          // Admin / Agent dropdown options
          const res = await getCustomersApi({ limit: 100 });
          if (res.success && res.data) {
            setCustomers(res.data);
            if (res.data.length > 0) {
              setSelectedCustomerId(res.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to resolve customer profile:', err);
      }
    };

    initCustomerSelection();
  }, [isCustomer, user?.email]);

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
        const msg = 'Selected file exceeds 5MB limit. Please choose a smaller file.';
        setError(msg);
        addToast(msg, 'error');
        setFile(null);
        return;
      }
      // EC-D02: Client side MIME check
      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowed.includes(selectedFile.type)) {
        const msg = 'Invalid file format. Only JPEG, PNG, and PDF files are allowed.';
        setError(msg);
        addToast(msg, 'error');
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
      const msg = 'Please select a customer for this document';
      setError(msg);
      addToast(msg, 'error');
      return;
    }
    if (!file) {
      const msg = 'Please select a file to upload';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await uploadDocumentApi(selectedCustomerId, file);
      if (res.success) {
        const msg = `"${file.name}" uploaded successfully!`;
        setSuccessMsg(msg);
        addToast(msg, 'success');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload-input');
        if (fileInput) fileInput.value = '';
        loadDocuments(selectedCustomerId);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to upload document';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      await downloadDocumentApi(docId, fileName);
      addToast(`Downloading "${fileName}"...`, 'info');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to download file';
      setError(errMsg);
      addToast(errMsg, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gradient">Document Management</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Upload and retrieve identity proofs, policy forms, and claim evidence (JPEG, PNG, PDF ≤ 5MB)
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Upload Form Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>📤</span> Upload New Document
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {!isCustomer && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-muted)]">
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
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-muted)]">
              Choose File (Max 5MB) *
            </label>
            <input
              id="file-upload-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="input-field max-w-md file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer"
            />
            <p className="text-xs text-[var(--color-muted)] mt-1.5">
              Allowed formats: JPG, PNG, PDF (Up to 5MB)
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary px-6 py-2.5 flex items-center gap-2 text-xs"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Uploading Document...
              </>
            ) : (
              '📤 Upload File'
            )}
          </button>
        </form>
      </div>

      {/* Uploaded Documents List Card */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>📁</span> Uploaded Documents ({documents.length})
        </h3>

        {loadingDocs ? (
          <div className="py-8 text-center text-[var(--color-muted)]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
            <p className="text-xs">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)] py-6 text-center">
            No documents uploaded yet for this customer profile.
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
                      <div className="font-bold text-sm text-white">{doc.fileName}</div>
                      <div className="text-xs text-[var(--color-muted)] mt-0.5">
                        Uploaded on: {formatDate(doc.uploadedAt)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white"
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
