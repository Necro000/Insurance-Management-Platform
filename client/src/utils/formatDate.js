/**
 * Format an ISO date string into a human-readable format.
 * EC-UI14: Prevents raw ISO strings from being displayed in the UI.
 *
 * @param {string|Date} dateInput - ISO date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string (e.g. "23 Jul 2026")
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options,
    });
  } catch {
    return '—';
  }
};

/**
 * Format a number as Indian Rupee currency.
 * EC-UI15: Prevents raw decimal values from being shown without formatting.
 *
 * @param {number|string} amount - Numeric value
 * @returns {string} Formatted currency string (e.g. "₹1,23,456.00")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `₹${amount}`;
  }
};

/**
 * Format a date as relative time (e.g. "3 days ago").
 *
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return '—';
  }
};
