const customerService = require('../services/customerService');
const { paginated, success, created } = require('../utils/responseHelper');

/**
 * @route GET /api/customers
 * @desc Get all customers with search & pagination
 * @access Admin, Agent
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const { customers, meta } = await customerService.getAllCustomers({
      search,
      page,
      limit,
    });
    return paginated(res, customers, meta, 'Customers retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/customers/:id
 * @desc Get single customer details
 * @access Admin, Agent
 */
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return success(res, customer, 'Customer retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/customers
 * @desc Create new customer
 * @access Admin, Agent
 */
const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return created(res, customer, 'Customer created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route PUT /api/customers/:id
 * @desc Update customer details
 * @access Admin, Agent
 */
const updateCustomer = async (req, res, next) => {
  try {
    const updatedCustomer = await customerService.updateCustomer(
      req.params.id,
      req.body
    );
    return success(res, updatedCustomer, 'Customer updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/customers/:id/history
 * @desc Get policy and claim history for a customer
 * @access Admin, Agent
 */
const getCustomerHistory = async (req, res, next) => {
  try {
    const history = await customerService.getCustomerHistory(req.params.id);
    return success(res, history, 'Customer history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerHistory,
};
