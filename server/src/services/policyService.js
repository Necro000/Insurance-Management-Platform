const prisma = require('../config/db');
const { paginate, buildMeta } = require('../utils/paginate');

/**
 * Get all policies with filter and pagination.
 * If user is a customer, restricts list to their own policies.
 * @param {object} params - { status, search, page, limit, currentUser }
 */
const getAllPolicies = async ({ status, search = '', page = 1, limit = 10, currentUser }) => {
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {};

  // Status filter (EC-S08: validate enum)
  if (status && ['active', 'expired', 'cancelled'].includes(status.toLowerCase())) {
    where.status = status.toLowerCase();
  }

  // Text search filter on policyNumber or policyType
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    where.OR = [
      { policyNumber: { contains: trimmedSearch, mode: 'insensitive' } },
      { policyType: { contains: trimmedSearch, mode: 'insensitive' } },
      { customer: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
    ];
  }

  // Customer role isolation (EC-RB05): Customer can only see policies belonging to their email
  if (currentUser && currentUser.role === 'customer') {
    const customerRecord = await prisma.customer.findFirst({
      where: { email: currentUser.email },
    });
    if (!customerRecord) {
      return { policies: [], meta: buildMeta(0, currentPage, currentLimit) };
    }
    where.customerId = customerRecord.id;
  }

  const [policies, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { claims: true, payments: true },
        },
      },
    }),
    prisma.policy.count({ where }),
  ]);

  const meta = buildMeta(total, currentPage, currentLimit);
  return { policies, meta };
};

/**
 * Get policy by ID.
 * @param {number|string} id
 * @param {object} currentUser
 */
const getPolicyById = async (id, currentUser) => {
  const policyId = parseInt(id, 10);
  if (isNaN(policyId) || policyId <= 0) {
    const err = new Error('Invalid policy ID');
    err.statusCode = 400;
    throw err;
  }

  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      customer: true,
      claims: {
        orderBy: { submissionDate: 'desc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!policy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-RB05: Customer can only view their own policy
  if (currentUser && currentUser.role === 'customer') {
    if (policy.customer.email !== currentUser.email) {
      const err = new Error('Access denied. You can only view your own policy.');
      err.statusCode = 403;
      throw err;
    }
  }

  return policy;
};

/**
 * Create a new insurance policy.
 * @param {object} data
 */
const createPolicy = async (data) => {
  const { customerId, policyType, premiumAmount, startDate, endDate, policyNumber } = data;

  // EC-P04: Verify customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    const err = new Error('Referenced customer does not exist');
    err.statusCode = 400;
    throw err;
  }

  // EC-P06: Generate collision-resistant policy number if not supplied
  const generatedPolicyNumber =
    policyNumber || `POL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // EC-P05: Check duplicate policy number
  const existingPolicy = await prisma.policy.findUnique({
    where: { policyNumber: generatedPolicyNumber },
  });

  if (existingPolicy) {
    const err = new Error('Policy number already exists');
    err.statusCode = 409;
    throw err;
  }

  const policy = await prisma.policy.create({
    data: {
      customerId,
      policyType,
      policyNumber: generatedPolicyNumber,
      premiumAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'active',
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return policy;
};

/**
 * Update an existing policy.
 * @param {number|string} id
 * @param {object} data
 */
const updatePolicy = async (id, data) => {
  const policyId = parseInt(id, 10);
  if (isNaN(policyId) || policyId <= 0) {
    const err = new Error('Invalid policy ID');
    err.statusCode = 400;
    throw err;
  }

  const existingPolicy = await prisma.policy.findUnique({
    where: { id: policyId },
  });

  if (!existingPolicy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    throw err;
  }

  const updateData = { ...data };
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

  const updatedPolicy = await prisma.policy.update({
    where: { id: policyId },
    data: updateData,
    include: { customer: true },
  });

  return updatedPolicy;
};

/**
 * Renew an existing policy (extends end date by 1 year).
 * @param {number|string} id
 */
const renewPolicy = async (id) => {
  const policyId = parseInt(id, 10);
  if (isNaN(policyId) || policyId <= 0) {
    const err = new Error('Invalid policy ID');
    err.statusCode = 400;
    throw err;
  }

  const existingPolicy = await prisma.policy.findUnique({
    where: { id: policyId },
  });

  if (!existingPolicy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-P09: Cancelled policies cannot be renewed
  if (existingPolicy.status === 'cancelled') {
    const err = new Error('Cancelled policies cannot be renewed');
    err.statusCode = 400;
    throw err;
  }

  // Calculate new end date (+1 year from existing endDate or today, whichever is later)
  const currentEnd = new Date(existingPolicy.endDate);
  const now = new Date();
  const baseDate = currentEnd > now ? currentEnd : now;

  const newEndDate = new Date(baseDate);
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);

  const renewedPolicy = await prisma.policy.update({
    where: { id: policyId },
    data: {
      endDate: newEndDate,
      status: 'active',
    },
    include: { customer: true },
  });

  return renewedPolicy;
};

/**
 * Cancel a policy.
 * @param {number|string} id
 */
const cancelPolicy = async (id) => {
  const policyId = parseInt(id, 10);
  if (isNaN(policyId) || policyId <= 0) {
    const err = new Error('Invalid policy ID');
    err.statusCode = 400;
    throw err;
  }

  const existingPolicy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: {
      claims: {
        where: { status: 'pending' },
      },
    },
  });

  if (!existingPolicy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-P11: Already cancelled check
  if (existingPolicy.status === 'cancelled') {
    const err = new Error('Policy is already cancelled');
    err.statusCode = 400;
    throw err;
  }

  // EC-P10: Check for pending claims
  if (existingPolicy.claims && existingPolicy.claims.length > 0) {
    const err = new Error('Cannot cancel policy with pending claims. Resolve or reject claims first.');
    err.statusCode = 400;
    throw err;
  }

  const cancelledPolicy = await prisma.policy.update({
    where: { id: policyId },
    data: {
      status: 'cancelled',
    },
    include: { customer: true },
  });

  return cancelledPolicy;
};

module.exports = {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  renewPolicy,
  cancelPolicy,
};
