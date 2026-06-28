/**
 * rbac.js - Role-Based Access Control Middleware
 * 
 * Controls which roles can access specific endpoints.
 * Usage: router.get('/route', authenticate, allowRoles('admin', 'production_manager'), controller)
 * 
 * Roles:
 *   - admin
 *   - production_manager
 *   - employee
 *   - quality_inspector
 *   - warehouse_manager
 */

const { forbiddenResponse } = require('../utils/responseHelper');

/**
 * Role-based access control middleware factory
 * @param {...string} roles - Allowed roles for this route
 * @returns {Function} - Express middleware function
 * 
 * Example usage:
 *   allowRoles('admin')                                     // Admin only
 *   allowRoles('admin', 'production_manager')               // Admin + Production Manager
 *   allowRoles('admin', 'production_manager', 'employee')   // Multiple roles
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    // authenticate middleware must run first, which sets req.user
    if (!req.user) {
      return forbiddenResponse(res, 'Authentication required.');
    }
    
    const userRole = req.user.role;
    
    // Check if user's role is in the allowed roles list
    if (!roles.includes(userRole)) {
      return forbiddenResponse(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`
      );
    }
    
    next();
  };
};

/**
 * Admin only access
 */
const adminOnly = allowRoles('admin');

/**
 * Admin or Production Manager access
 */
const managerAccess = allowRoles('admin', 'production_manager');

/**
 * Warehouse related access
 */
const warehouseAccess = allowRoles('admin', 'warehouse_manager');

/**
 * Quality related access
 */
const qualityAccess = allowRoles('admin', 'quality_inspector');

module.exports = {
  allowRoles,
  adminOnly,
  managerAccess,
  warehouseAccess,
  qualityAccess,
};
