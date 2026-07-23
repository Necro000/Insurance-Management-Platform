const prisma = require('../config/db');
const { paginate, buildMeta } = require('../utils/paginate');

/**
 * Get all customers with search and pagination.
 * @param {object} params - { search, page, limit }
 */
const getAllCustomers = async ({ search = '', page = 1, limit = 10 }) => {
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const trimmedSearch = search.trim();
  const where = trimmedSearch
    ? {
        OR: [
          { name: { contains: trimmedSearch, mode: 'insensitive' } },
          { email: { contains: trimmedSearch, mode: 'insensitive' } },
          { phone: { contains: trimmedSearch, mode: 'insensitive' } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { policies: true, documents: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const meta = buildMeta(total, currentPage, currentLimit);
  return { customers, meta };
};

/**
 * Get customer by ID.
 * @param {number|string} id
 */
const getCustomerById = async (id) => {
  const customerId = parseInt(id, 10);
  if (isNaN(customerId) || customerId <= 0) {
    const err = new Error('Invalid customer ID');
    err.statusCode = 400;
    throw err;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      policies: {
        orderBy: { createdAt: 'desc' },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }

  return customer;
};

/**
 * Create a new customer.
 * @param {object} data
 */
const createCustomer = async (data) => {
  const { name, dob, phone, address, email } = data;

  // EC-C01: Check for existing customer email
  const existingCustomer = await prisma.customer.findFirst({
    where: { email },
  });

  if (existingCustomer) {
    const err = new Error('Customer with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      dob: new Date(dob),
      phone,
      address,
      email,
    },
  });

  return customer;
};

/**
 * Update an existing customer.
 * @param {number|string} id
 * @param {object} data
 */
const updateCustomer = async (id, data) => {
  const customerId = parseInt(id, 10);
  if (isNaN(customerId) || customerId <= 0) {
    const err = new Error('Invalid customer ID');
    err.statusCode = 400;
    throw err;
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!existingCustomer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.email && data.email !== existingCustomer.email) {
    const duplicateEmail = await prisma.customer.findFirst({
      where: { email: data.email, NOT: { id: customerId } },
    });
    if (duplicateEmail) {
      const err = new Error('Another customer with this email already exists');
      err.statusCode = 409;
      throw err;
    }
  }

  const updateData = { ...data };
  if (updateData.dob) {
    updateData.dob = new Date(updateData.dob);
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
  });

  return updatedCustomer;
};

/**
 * Get policy & claim history for a customer.
 * EC-C11: Safe handling for customer with no policies.
 * @param {number|string} id
 */
const getCustomerHistory = async (id) => {
  const customerId = parseInt(id, 10);
  if (isNaN(customerId) || customerId <= 0) {
    const err = new Error('Invalid customer ID');
    err.statusCode = 400;
    throw err;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, email: true },
  });

  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }

  const policies = await prisma.policy.findMany({
    where: { customerId },
    include: {
      claims: {
        orderBy: { submissionDate: 'desc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Extract all claims across policies
  const allClaims = policies.flatMap((policy) =>
    policy.claims.map((claim) => ({
      ...claim,
      policyNumber: policy.policyNumber,
      policyType: policy.policyType,
    }))
  );

  return {
    customer,
    policies: policies || [],
    claims: allClaims || [],
  };
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerHistory,
};
