import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi } from '../../api/reportApi';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import { formatCurrency } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(isAdmin);

  useEffect(() => {
    if (isAdmin) {
      const fetchStats = async () => {
        try {
          const res = await getDashboardStatsApi();
          if (res.success) {
            setStats(res.data);
          }
        } catch (err) {
          console.error('Failed to fetch dashboard stats:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [isAdmin]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">System Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Overview of customers, policy health, pending claims, and revenue analytics
          </p>
        </div>
        {isAdmin && (
          <Link to="/reports" className="btn-primary flex items-center gap-2">
            <span>📊</span> View Detailed Reports
          </Link>
        )}
      </div>

      {/* Stat Cards (Deliverable 528) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 space-y-1 glass">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <span className="text-xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : stats?.totalCustomers ?? 0}
          </div>
          <div className="text-xs text-[var(--color-muted)]">Registered client accounts</div>
        </div>

        <div className="card p-5 space-y-1 glass">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Policies</span>
            <span className="text-xl">📜</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {loading ? '...' : stats?.activePolicies ?? 0}
          </div>
          <div className="text-xs text-[var(--color-muted)]">Currently covered policies</div>
        </div>

        <div className="card p-5 space-y-1 glass">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Claims</span>
            <span className="text-xl">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {loading ? '...' : stats?.pendingClaims ?? 0}
          </div>
          <div className="text-xs text-[var(--color-muted)]">Awaiting agent review</div>
        </div>

        <div className="card p-5 space-y-1 glass">
          <div className="flex items-center justify-between text-[var(--color-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Revenue</span>
            <span className="text-xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {loading ? '...' : formatCurrency(stats?.monthlyRevenue)}
          </div>
          <div className="text-xs text-[var(--color-muted)]">Collected this month</div>
        </div>
      </div>

      {/* Analytics Charts Grid (Deliverable 529) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5 lg:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Monthly Revenue Trend (₹)
            </h3>
            <BarChart data={stats?.monthlyPaymentsTrend || []} title="" />
          </div>

          <div className="card p-5 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Claims Distribution
            </h3>
            <PieChart data={stats?.claimsDistribution || []} title="" />
          </div>

          <div className="card p-5 lg:col-span-3 space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              6-Month Customer Growth Trajectory
            </h3>
            <LineChart data={stats?.customerGrowth || []} title="" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
