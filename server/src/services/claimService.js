const prisma = require('../config/db');
const { paginate, buildMeta } = require('../utils/paginate');

/**
 * Get all claims with optional status filter and pagination.
 * Customer role sees only their own claims (EC-RB06).
 * @param {object} params - { status, search, page, limit, currentUser }
 */
const getAllClaims = async ({ status, search = '', page = 1, limit = 10, currentUser }) => {
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {};

  if (status && ['pending', 'approved', 'rejected'].includes(status.toLowerCase())) {
    where.status = status.toLowerCase();
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    where.OR = [
      { reason: { contains: trimmedSearch, mode: 'insensitive' } },
      { policy: { policyNumber: { contains: trimmedSearch, mode: 'insensitive' } } },
      { policy: { customer: { name: { contains: trimmedSearch, mode: 'insensitive' } } } },
    ];
  }

  // Customer role isolation
  if (currentUser && currentUser.role === 'customer') {
    const customerRecord = await prisma.customer.findFirst({
      where: { email: currentUser.email },
    });
    if (!customerRecord) {
      return { claims: [], meta: buildMeta(0, currentPage, currentLimit) };
    }
    where.policy = {
      customerId: customerRecord.id,
    };
  }

  const [claims, total] = await Promise.all([
    prisma.claim.findMany({
      where,
      skip,
      take,
      orderBy: { submissionDate: 'desc' },
      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            status: true,
            customer: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
    }),
    prisma.claim.count({ where }),
  ]);

  const meta = buildMeta(total, currentPage, currentLimit);
  return { claims, meta };
};

/**
 * Get single claim details by ID.
 * @param {number|string} id
 * @param {object} currentUser
 */
const getClaimById = async (id, currentUser) => {
  const claimId = parseInt(id, 10);
  if (isNaN(claimId) || claimId <= 0) {
    const err = new Error('Invalid claim ID');
    err.statusCode = 400;
    throw err;
  }

  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      policy: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!claim) {
    const err = new Error('Claim not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-RB06: Check customer ownership access
  if (currentUser && currentUser.role === 'customer') {
    if (claim.policy.customer.email !== currentUser.email) {
      const err = new Error('Access denied. You can only view claims for your own policies.');
      err.statusCode = 403;
      throw err;
    }
  }

  return claim;
};

/**
 * Submit a new claim.
 * @param {object} data - { policyId, claimAmount, reason }
 * @param {object} currentUser
 */
const submitClaim = async (data, currentUser) => {
  const { policyId, claimAmount, reason } = data;

  // EC-CL07: Verify policy exists
  const policy = await prisma.policy.findUnique({
    where: { id: policyId },
    include: { customer: true },
  });

  if (!policy) {
    const err = new Error('Referenced policy does not exist');
    err.statusCode = 400;
    throw err;
  }

  // EC-CL02: Verify policy is active
  if (policy.status !== 'active') {
    const err = new Error(`Cannot submit claim for a ${policy.status} policy. Policy must be active.`);
    err.statusCode = 400;
    throw err;
  }

  // EC-CL01: Verify customer owns the policy
  if (currentUser && currentUser.role === 'customer') {
    if (policy.customer.email !== currentUser.email) {
      const err = new Error('Access denied. You can only submit claims for your own policies.');
      err.statusCode = 403;
      throw err;
    }
  }

  const claim = await prisma.claim.create({
    data: {
      policyId,
      claimAmount,
      reason,
      status: 'pending',
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

  return claim;
};

/**
 * Update claim status (Approve or Reject).
 * EC-CL10: Admin/Agent only endpoint.
 * @param {number|string} id
 * @param {string} status - 'approved' | 'rejected'
 */
const updateClaimStatus = async (id, status) => {
  const claimId = parseInt(id, 10);
  if (isNaN(claimId) || claimId <= 0) {
    const err = new Error('Invalid claim ID');
    err.statusCode = 400;
    throw err;
  }

  const existingClaim = await prisma.claim.findUnique({
    where: { id: claimId },
  });

  if (!existingClaim) {
    const err = new Error('Claim not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-CL08: Already processed check
  if (existingClaim.status !== 'pending') {
    const err = new Error(`Claim has already been ${existingClaim.status}. Status cannot be modified again.`);
    err.statusCode = 400;
    throw err;
  }

  const updatedClaim = await prisma.claim.update({
    where: { id: claimId },
    data: { status },
    include: {
      policy: {
        include: { customer: true },
      },
    },
  });

  return updatedClaim;
};

module.exports = {
  getAllClaims,
  getClaimById,
  submitClaim,
  updateClaimStatus,
};
