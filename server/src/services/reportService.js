const prisma = require('../config/db');
const { generateReportPDF } = require('../utils/pdfGenerator');

/**
 * Fetch aggregated dashboard statistics.
 * Handles empty database gracefully with zero fallbacks (EC-R01).
 */
const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomers,
    activePolicies,
    expiredPolicies,
    cancelledPolicies,
    pendingClaims,
    approvedClaims,
    rejectedClaims,
    totalClaims,
    monthlyRevenueAgg,
    totalRevenueAgg,
    policyTypesGroup,
    claimsStatusGroup,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.policy.count({ where: { status: 'active' } }),
    prisma.policy.count({ where: { status: 'expired' } }),
    prisma.policy.count({ where: { status: 'cancelled' } }),
    prisma.claim.count({ where: { status: 'pending' } }),
    prisma.claim.count({ where: { status: 'approved' } }),
    prisma.claim.count({ where: { status: 'rejected' } }),
    prisma.claim.count(),
    prisma.premiumPayment.aggregate({
      where: {
        paymentStatus: 'paid',
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.premiumPayment.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { amount: true },
    }),
    prisma.policy.groupBy({
      by: ['policyType'],
      _count: { id: true },
    }),
    prisma.claim.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  // EC-R01: Handle null aggregation values for empty database
  const monthlyRevenue = Number(monthlyRevenueAgg._sum.amount ?? 0);
  const totalRevenue = Number(totalRevenueAgg._sum.amount ?? 0);

  // Generate 6-month historical revenue trend
  const monthsTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthLabel = d.toLocaleString('en-IN', { month: 'short' });

    const monthAgg = await prisma.premiumPayment.aggregate({
      where: {
        paymentStatus: 'paid',
        paymentDate: { gte: d, lte: endD },
      },
      _sum: { amount: true },
    });

    monthsTrend.push({
      month: monthLabel,
      amount: Number(monthAgg._sum.amount ?? 0),
    });
  }

  // Generate 6-month customer growth trend
  const customerGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthLabel = d.toLocaleString('en-IN', { month: 'short' });

    const count = await prisma.customer.count({
      where: {
        createdAt: { lte: endD },
      },
    });

    customerGrowth.push({
      month: monthLabel,
      count,
    });
  }

  return {
    totalCustomers,
    activePolicies,
    expiredPolicies,
    cancelledPolicies,
    pendingClaims,
    approvedClaims,
    rejectedClaims,
    totalClaims,
    monthlyRevenue,
    totalRevenue,
    policyTypes: policyTypesGroup.map((g) => ({
      type: g.policyType,
      count: g._count.id,
    })),
    claimsDistribution: claimsStatusGroup.map((g) => ({
      status: g.status,
      count: g._count.id,
    })),
    monthlyPaymentsTrend: monthsTrend,
    customerGrowth,
  };
};

/**
 * Get detailed policy report breakdown.
 */
const getPolicyReport = async () => {
  const [total, active, expired, cancelled, byType] = await Promise.all([
    prisma.policy.count(),
    prisma.policy.count({ where: { status: 'active' } }),
    prisma.policy.count({ where: { status: 'expired' } }),
    prisma.policy.count({ where: { status: 'cancelled' } }),
    prisma.policy.groupBy({
      by: ['policyType'],
      _count: { id: true },
      _sum: { premiumAmount: true },
    }),
  ]);

  return {
    total,
    active,
    expired,
    cancelled,
    byType: byType.map((b) => ({
      type: b.policyType,
      count: b._count.id,
      totalPremium: Number(b._sum.premiumAmount ?? 0),
    })),
  };
};

/**
 * Get detailed claims report breakdown.
 */
const getClaimReport = async () => {
  const [total, pending, approved, rejected, totalAmountAgg, approvedAmountAgg] = await Promise.all([
    prisma.claim.count(),
    prisma.claim.count({ where: { status: 'pending' } }),
    prisma.claim.count({ where: { status: 'approved' } }),
    prisma.claim.count({ where: { status: 'rejected' } }),
    prisma.claim.aggregate({ _sum: { claimAmount: true } }),
    prisma.claim.aggregate({ where: { status: 'approved' }, _sum: { claimAmount: true } }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    totalRequestedAmount: Number(totalAmountAgg._sum.claimAmount ?? 0),
    totalApprovedAmount: Number(approvedAmountAgg._sum.claimAmount ?? 0),
  };
};

/**
 * Get premium payments report breakdown.
 */
const getPremiumReport = async () => {
  const [paid, pending, overdue, totalCollectedAgg] = await Promise.all([
    prisma.premiumPayment.count({ where: { paymentStatus: 'paid' } }),
    prisma.premiumPayment.count({ where: { paymentStatus: 'pending' } }),
    prisma.premiumPayment.count({ where: { paymentStatus: 'overdue' } }),
    prisma.premiumPayment.aggregate({ where: { paymentStatus: 'paid' }, _sum: { amount: true } }),
  ]);

  return {
    paidCount: paid,
    pendingCount: pending,
    overdueCount: overdue,
    totalCollected: Number(totalCollectedAgg._sum.amount ?? 0),
  };
};

/**
 * Export summary report as PDF buffer.
 */
const exportPDF = async () => {
  const stats = await getDashboardStats();
  return generateReportPDF(stats);
};

module.exports = {
  getDashboardStats,
  getPolicyReport,
  getClaimReport,
  getPremiumReport,
  exportPDF,
};
