/**
 * errorHandler.js - Global Error Handler Middleware
 * 
 * Catches all unhandled errors in the application.
 * Must be registered LAST in the Express middleware chain.
 */

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  
  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * 404 Handler - for routes that don't exist
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
