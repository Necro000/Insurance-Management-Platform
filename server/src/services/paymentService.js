const prisma = require('../config/db');
const { paginate, buildMeta } = require('../utils/paginate');

/**
 * Batch update pending payments past their paymentDate to 'overdue'.
 * EC-PM07: Auto-run to keep status accurate.
 */
const markOverdue = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updated = await prisma.premiumPayment.updateMany({
    where: {
      paymentDate: { lt: today },
      paymentStatus: 'pending',
    },
    data: {
      paymentStatus: 'overdue',
    },
  });

  return updated.count;
};

/**
 * Get all payment records with pagination and status filter.
 * Customer role sees only their own payments (EC-RB07).
 * @param {object} params - { status, page, limit, currentUser }
 */
const getAllPayments = async ({ status, page = 1, limit = 10, currentUser }) => {
  // Sync overdue statuses first
  await markOverdue();

  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {};

  if (status && ['paid', 'pending', 'overdue'].includes(status.toLowerCase())) {
    where.paymentStatus = status.toLowerCase();
  }

  // Customer role isolation
  if (currentUser && currentUser.role === 'customer') {
    const customerRecord = await prisma.customer.findFirst({
      where: { email: currentUser.email },
    });
    if (!customerRecord) {
      return { payments: [], meta: buildMeta(0, currentPage, currentLimit) };
    }
    where.policy = {
      customerId: customerRecord.id,
    };
  }

  const [payments, total] = await Promise.all([
    prisma.premiumPayment.findMany({
      where,
      skip,
      take,
      orderBy: { paymentDate: 'desc' },
      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            customer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    }),
    prisma.premiumPayment.count({ where }),
  ]);

  const meta = buildMeta(total, currentPage, currentLimit);
  return { payments, meta };
};

/**
 * Get payment history for a specific policy.
 * @param {number|string} policyId
 * @param {object} currentUser
 */
const getPaymentsByPolicy = async (policyIdInput, currentUser) => {
  const policyId = parseInt(policyIdInput, 10);
  if (isNaN(policyId) || policyId <= 0) {
    const err = new Error('Invalid policy ID');
    err.statusCode = 400;
    throw err;
  }

  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: { customer: true },
  });

  if (!policy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    throw err;
  }

  // Check customer access
  if (currentUser && currentUser.role === 'customer' && policy.customer.email !== currentUser.email) {
    const err = new Error('Access denied. You can only view payments for your own policy.');
    err.statusCode = 403;
    throw err;
  }

  const payments = await prisma.premiumPayment.findMany({
    where: { policyId },
    orderBy: { paymentDate: 'desc' },
  });

  return {
    policy,
    payments: payments || [],
  };
};

/**
 * Record a new premium payment.
 * @param {object} data - { policyId, amount, paymentDate, paymentStatus }
 */
const recordPayment = async (data) => {
  const { policyId, amount, paymentDate, paymentStatus = 'paid' } = data;

  // EC-PM01: Check policy exists
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
  });

  if (!policy) {
    const err = new Error('Referenced policy does not exist');
    err.statusCode = 400;
    throw err;
  }

  // EC-PM02: Check if policy is cancelled
  if (policy.status === 'cancelled') {
    const err = new Error('Cannot record payment for a cancelled policy');
    err.statusCode = 400;
    throw err;
  }

  const payment = await prisma.premiumPayment.create({
    data: {
      policyId,
      amount,
      paymentDate: new Date(paymentDate),
      paymentStatus,
    },
    include: {
      policy: {
        select: {
          id: true,
          policyNumber: true,
          policyType: true,
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });

  return payment;
};

module.exports = {
  getAllPayments,
  getPaymentsByPolicy,
  recordPayment,
  markOverdue,
};
