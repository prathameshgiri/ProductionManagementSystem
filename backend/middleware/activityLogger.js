/**
 * activityLogger.js - Automatic Activity Logging Middleware
 * 
 * Automatically logs all write operations (POST, PUT, DELETE) to activity_logs.json.
 * This builds the audit trail without needing to manually log in each controller.
 */

const { createRecord } = require('../utils/db');

/**
 * Activity Logger Middleware
 * Logs: who did what, when, on which resource
 */
const activityLogger = (req, res, next) => {
  // Only log write operations
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (!writeMethods.includes(req.method)) {
    return next();
  }
  
  // Store original json method to intercept response
  const originalJson = res.json.bind(res);
  
  res.json = function(body) {
    // Log only successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const action = getActionName(req.method, req.path);
      const resource = getResourceName(req.path);
      
      const logEntry = {
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action,
        resource,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      };
      
      // Fire and forget - don't wait for log write
      try {
        createRecord('activity_logs', logEntry);
      } catch (err) {
        // Silently fail - don't break the main request
        console.error('Activity log error:', err.message);
      }
    }
    
    return originalJson(body);
  };
  
  next();
};

/**
 * Get human-readable action name from HTTP method
 */
const getActionName = (method, path) => {
  const actions = {
    POST: 'Created',
    PUT: 'Updated',
    PATCH: 'Updated',
    DELETE: 'Deleted',
  };
  return actions[method] || method;
};

/**
 * Get resource name from URL path
 * e.g. '/api/products/123' -> 'Product'
 */
const getResourceName = (path) => {
  const parts = path.split('/').filter(Boolean);
  // Find the resource name segment (after 'api')
  const apiIndex = parts.indexOf('api');
  const resourceSegment = apiIndex !== -1 ? parts[apiIndex + 1] : parts[0];
  
  if (!resourceSegment) return 'Resource';
  
  // Convert kebab-case to Title Case
  return resourceSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

module.exports = { activityLogger };
