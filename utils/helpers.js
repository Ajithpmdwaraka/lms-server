// Date formatting utility
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate days between two dates
const daysBetween = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if a date is overdue
const isOverdue = (dueDate, returnDate = null) => {
  if (returnDate) return false; // Already returned
  return new Date() > new Date(dueDate);
};

// Generate due date (14 days from issue)
const generateDueDate = (issueDate = new Date()) => {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + 14);
  return dueDate;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate ISBN format
const isValidISBN = (isbn) => {
  const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
  return isbnRegex.test(isbn);
};

// Sanitize string input
const sanitizeString = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/[<>]/g, '');
};

// Generate pagination info
const getPaginationInfo = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

// Error response formatter
const formatErrorResponse = (message, errors = null, statusCode = 500) => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString()
  };
};

// Success response formatter
const formatSuccessResponse = (message, data = null, meta = null) => {
  return {
    success: true,
    message,
    ...(data && { data }),
    ...(meta && { meta }),
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  formatDate,
  daysBetween,
  isOverdue,
  generateDueDate,
  isValidEmail,
  isValidISBN,
  sanitizeString,
  getPaginationInfo,
  formatErrorResponse,
  formatSuccessResponse
};