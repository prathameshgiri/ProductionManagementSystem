/**
 * auth.js - JWT Authentication Middleware
 * 
 * Verifies the JWT token on every protected route.
 * The token should be sent in the Authorization header as:
 *   Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken');
const { unauthorizedResponse } = require('../utils/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'pms_jwt_secret_key_2024_factory';

/**
 * Authentication middleware
 * Attaches decoded user info to req.user if token is valid
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided. Please login.');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return unauthorizedResponse(res, 'Invalid token format.');
    }
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request object for use in controllers
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token. Please login again.');
    }
    return unauthorizedResponse(res, 'Authentication failed.');
  }
};

module.exports = { authenticate };
