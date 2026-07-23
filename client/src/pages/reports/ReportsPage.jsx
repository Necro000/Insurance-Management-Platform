import React, { useState, useEffect } from 'react';
import {
  getPolicyReportApi,
  getClaimReportApi,
  getPremiumReportApi,
  downloadPdfReportApi,
} from '../../api/reportApi';
import { formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const ReportsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [policyReport, setPolicyReport] = useState(null);
  const [claimReport, setClaimReport] = useState(null);
  const [premiumReport, setPremiumReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const [polRes, clmRes, prmRes] = await Promise.all([
          getPolicyReportApi(),
          getClaimReportApi(),
          getPremiumReportApi(),
        ]);
        if (polRes.success) setPolicyReport(polRes.data);
        if (clmRes.success) setClaimReport(clmRes.data);
        if (prmRes.success) setPremiumReport(prmRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAdmin]);

  const handleExportPDF = async () => {
    setExporting(true);
    setError('');
    try {
      await downloadPdfReportApi();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="text-4xl">🚫</div>
        <h2 className="text-xl font-bold text-red-400">403 Access Denied</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Business report metrics and PDF downloads are restricted to Administrator accounts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Executive Business Reports</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Comprehensive breakdown of policy metrics, claim settlements, and premium collections
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5"
        >
          {exporting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Generating PDF...
            </>
          ) : (
            <>
              <span>📥</span> Export PDF Report
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Policy Report Section */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📜</span> Policy Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Total Policies</div>
            <div className="text-xl font-bold text-white">{policyReport?.total || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Active Policies</div>
            <div className="text-xl font-bold text-green-400">{policyReport?.active || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Expired Policies</div>
            <div className="text-xl font-bold text-gray-400">{policyReport?.expired || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Cancelled Policies</div>
            <div className="text-xl font-bold text-red-400">{policyReport?.cancelled || 0}</div>
          </div>
        </div>

        {policyReport?.byType && policyReport.byType.length > 0 && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[var(--color-muted)] text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">Policy Category</th>
                  <th className="px-4 py-2">Total Count</th>
                  <th className="px-4 py-2">Total Premium Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {policyReport.byType.map((b) => (
                  <tr key={b.type}>
                    <td className="px-4 py-3 font-semibold text-white">{b.type}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{b.count}</td>
                    <td className="px-4 py-3 font-bold text-indigo-400">{formatCurrency(b.totalPremium)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Claim Report Section */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⚠️</span> Claims Settlement Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Total Claims</div>
            <div className="text-xl font-bold text-white">{claimReport?.total || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Pending Claims</div>
            <div className="text-xl font-bold text-yellow-400">{claimReport?.pending || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Approved Claims</div>
            <div className="text-xl font-bold text-green-400">{claimReport?.approved || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Approved Amount</div>
            <div className="text-xl font-bold text-indigo-400">{formatCurrency(claimReport?.totalApprovedAmount)}</div>
          </div>
        </div>
      </div>

      {/* Premium Collection Section */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💰</span> Premium Payments Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Paid Payments</div>
            <div className="text-xl font-bold text-green-400">{premiumReport?.paidCount || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Pending Payments</div>
            <div className="text-xl font-bold text-yellow-400">{premiumReport?.pendingCount || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Overdue Payments</div>
            <div className="text-xl font-bold text-red-400">{premiumReport?.overdueCount || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 space-y-1">
            <div className="text-xs text-[var(--color-muted)] uppercase font-semibold">Total Revenue</div>
            <div className="text-xl font-bold text-indigo-400">{formatCurrency(premiumReport?.totalCollected)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
