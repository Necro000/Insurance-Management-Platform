/**
 * Generic pagination helper.
 * @param {number|string} page - Page number (1-indexed)
 * @param {number|string} limit - Records per page
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
const paginate = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // cap at 100
  return {
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
    page: parsedPage,
    limit: parsedLimit,
  };
};

/**
 * Build pagination meta object to include in paginated responses.
 * @param {number} total - Total record count
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number }}
 */
const buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = { paginate, buildMeta };
