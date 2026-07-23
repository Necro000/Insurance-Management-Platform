import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi } from '../../api/reportApi';
import { getPoliciesApi } from '../../api/policyApi';
import { getClaimsApi } from '../../api/claimApi';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import { formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isCustomer = role === 'customer';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (isAdmin || isAgent) {
          // Fetch full platform analytics for Admin/Agent
          const res = await getDashboardStatsApi();
          if (res.success) {
            setStats(res.data);
          }
        } else {
          // Fetch customer's own policies and claims summary
          const [polRes, clmRes] = await Promise.all([
            getPoliciesApi({ limit: 100 }),
            getClaimsApi({ limit: 100 }),
          ]);

          const userPolicies = polRes.data || [];
          const userClaims = clmRes.data || [];

          const activeCount = userPolicies.filter((p) => p.status === 'active').length;
          const pendingClaimsCount = userClaims.filter((c) => c.status === 'pending').length;
          const totalPremiumPaid = userPolicies.reduce(
            (sum, p) => sum + Number(p.premiumAmount || 0),
            0
          );

          setStats({
            totalCustomers: 1, // Self profile
            activePolicies: activeCount,
            pendingClaims: pendingClaimsCount,
            monthlyRevenue: totalPremiumPaid,
            totalClaims: userClaims.length,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin, isAgent]);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Hero Welcome Banner */}
      <div className="card p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/90 border-indigo-500/20 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.role} Portal
              </span>
              <span className="text-xs text-[var(--color-muted)]">• Active Session</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-gradient">{user?.name}</span> 👋
            </h1>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {isCustomer
                ? 'Overview of your active insurance policies, submitted claim statuses, and digital documents.'
                : 'Real-time overview of customer portfolios, policy lifecycles, pending claim reviews, and financial revenue.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {isCustomer ? (
              <>
                <Link
                  to="/claims/new"
                  className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <span>+</span> File Claim
                </Link>
                <Link
                  to="/documents"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold glass hover:bg-white/10 text-white transition-all border border-white/10"
                >
                  📄 Upload Document
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/policies/new"
                  className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
                >
                  <span>+</span> Issue Policy
                </Link>
                {isAdmin && (
                  <Link
                    to="/reports"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold glass hover:bg-white/10 text-white transition-all border border-white/10"
                  >
                    📊 Executive Reports
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Customers / Account Card */}
        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isCustomer ? 'Account Profile' : 'Total Customers'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-lg border border-cyan-500/20">
              👥
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              stats?.totalCustomers ?? 0
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {isCustomer ? 'Verified Client Account' : 'Registered customer profiles'}
          </p>
        </div>

        {/* Active Policies Card */}
        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Policies</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/20">
              📜
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mb-1">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              stats?.activePolicies ?? 0
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)]">Currently active policy coverage</p>
        </div>

        {/* Pending Claims Card */}
        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Claims</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg border border-amber-500/20">
              ⚠️
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mb-1">
            {loading ? (
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              stats?.pendingClaims ?? 0
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)]">Claims awaiting verification</p>
        </div>

        {/* Revenue / Premium Volume Card */}
        <div className="card-hover p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between text-[var(--color-muted)] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isCustomer ? 'Total Premium Volume' : 'Monthly Revenue'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg border border-indigo-500/20">
              💰
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 mb-1">
            {loading ? (
              <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
            ) : (
              formatCurrency(stats?.monthlyRevenue)
            )}
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {isCustomer ? 'Total sum of policy premiums' : 'Collected premium revenue'}
          </p>
        </div>
      </div>

      {/* Admin Analytics Section */}
      {(isAdmin || isAgent) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Monthly Revenue Collection Trend (₹)
              </h3>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                6-Month History
              </span>
            </div>
            <BarChart data={stats?.monthlyPaymentsTrend || []} title="" />
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Claims Distribution
              </h3>
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Status Ratio
              </span>
            </div>
            <PieChart data={stats?.claimsDistribution || []} title="" />
          </div>

          <div className="card p-6 lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                6-Month Customer Growth Trajectory
              </h3>
              <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Registered Clients
              </span>
            </div>
            <LineChart data={stats?.customerGrowth || []} title="" />
          </div>
        </div>
      )}

      {/* Customer Quick Links Grid */}
      {isCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <Link
            to="/policies"
            className="card-hover p-6 space-y-3 group border-indigo-500/20 hover:border-indigo-500/50 block"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl font-bold">
                📜
              </span>
              <span className="text-xs text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                View Policies →
              </span>
            </div>
            <h4 className="text-base font-bold text-white">My Active Policies</h4>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              Review details of your health, vehicle, and property insurance plans and renewal dates.
            </p>
          </Link>

          <Link
            to="/claims"
            className="card-hover p-6 space-y-3 group border-amber-500/20 hover:border-amber-500/50 block"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
                ⚠️
              </span>
              <span className="text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                Track Claims →
              </span>
            </div>
            <h4 className="text-base font-bold text-white">Insurance Claims</h4>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              File new incident claims, upload medical or accident proofs, and track agent approval.
            </p>
          </Link>

          <Link
            to="/documents"
            className="card-hover p-6 space-y-3 group border-cyan-500/20 hover:border-cyan-500/50 block"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl font-bold">
                📄
              </span>
              <span className="text-xs text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                Manage Documents →
              </span>
            </div>
            <h4 className="text-base font-bold text-white">Identity Files & Uploads</h4>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              Upload identity proof documents (JPEG, PNG, PDF ≤ 5MB) and download stored certificates.
            </p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
