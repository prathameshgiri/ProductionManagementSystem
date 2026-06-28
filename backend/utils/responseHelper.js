/**
 * responseHelper.js
 * 
 * Standardized API response formats for all controllers.
 * Using consistent response shapes makes the frontend easier to work with.
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send (object, array, etc.)
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a paginated success response
 * @param {Object} res - Express response object
 * @param {Object} paginatedResult - Result from paginateData()
 * @param {string} message - Success message
 */
const paginatedResponse = (res, paginatedResult, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data: paginatedResult.data,
    pagination: {
      total: paginatedResult.total,
      page: paginatedResult.page,
      limit: paginatedResult.limit,
      totalPages: paginatedResult.totalPages,
      hasNextPage: paginatedResult.hasNextPage,
      hasPrevPage: paginatedResult.hasPrevPage,
    },
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Additional error details (optional)
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send a 404 Not Found response
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
const notFoundResponse = (res, resource = 'Record') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
  });
};

/**
 * Send a 401 Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorizedResponse = (res, message = 'Unauthorized. Please login.') => {
  return res.status(401).json({
    success: false,
    message,
  });
};

/**
 * Send a 403 Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbiddenResponse = (res, message = 'Forbidden. You do not have permission.') => {
  return res.status(403).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
};
