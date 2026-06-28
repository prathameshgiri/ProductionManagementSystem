/**
 * authController.js - Authentication Controller
 * 
 * Handles: Register, Login, Logout, Get Profile, Update Profile,
 *          Forgot Password (token-based, no email - local only),
 *          Reset Password, Change Password
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, updateRecord, createRecord } = require('../utils/db');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} = require('../utils/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'pms_jwt_secret_key_2024_factory';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin-only for production)
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required.');
    }

    // Check if email already exists
    const users = readData('users');
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return errorResponse(res, 'Email already registered. Please login.');
    }

    // Validate role
    const validRoles = ['admin', 'production_manager', 'employee', 'quality_inspector', 'warehouse_manager'];
    const userRole = role && validRoles.includes(role) ? role : 'employee';

    // Hash password (12 salt rounds = secure but not too slow)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = createRecord('users', {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      phone: phone || '',
      department: department || '',
      avatar: '',
      status: 'active',
      lastLogin: null,
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(res, userWithoutPassword, 'Registration successful!', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed. Please try again.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.');
    }

    // Find user by email
    const users = readData('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return unauthorizedResponse(res, 'Invalid email or password.');
    }

    // Check account status
    if (user.status === 'inactive') {
      return unauthorizedResponse(res, 'Account is disabled. Contact administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid email or password.');
    }

    // Update last login timestamp
    updateRecord('users', user.id, { lastLogin: new Date().toISOString() });

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return token + user (without password)
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, {
      token,
      user: { ...userWithoutPassword, lastLogin: new Date().toISOString() },
    }, 'Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
const getProfile = (req, res) => {
  try {
    const users = readData('users');
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return notFoundResponse(res, 'User');
    }

    const { password: _, ...userWithoutPassword } = user;
    return successResponse(res, userWithoutPassword, 'Profile fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to get profile.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, avatar } = req.body;

    const updated = updateRecord('users', req.user.id, {
      name: name || undefined,
      phone: phone || undefined,
      department: department || undefined,
      avatar: avatar || undefined,
    });

    if (!updated) {
      return notFoundResponse(res, 'User');
    }

    const { password: _, ...userWithoutPassword } = updated;
    return successResponse(res, userWithoutPassword, 'Profile updated successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to update profile.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required.');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters.');
    }

    const users = readData('users');
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return notFoundResponse(res, 'User');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return unauthorizedResponse(res, 'Current password is incorrect.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    updateRecord('users', req.user.id, { password: hashedPassword });

    return successResponse(res, null, 'Password changed successfully.');
  } catch (error) {
    return errorResponse(res, 'Failed to change password.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Forgot password - generate reset token (stored locally, no email)
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────
const forgotPassword = (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required.');
    }

    const users = readData('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Return success even if not found (security best practice)
      return successResponse(res, null, 'If the email exists, a reset token has been generated.');
    }

    // Generate a simple 6-digit reset token (local system - no email)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    updateRecord('users', user.id, { resetToken, resetTokenExpiry });

    // In a real local system, the admin would look up this token
    // For demo purposes, we return the token (so user can reset without email)
    return successResponse(res, { resetToken }, 'Reset token generated. Use this token to reset your password.');
  } catch (error) {
    return errorResponse(res, 'Failed to process request.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return errorResponse(res, 'Email, token, and new password are required.');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters.');
    }

    const users = readData('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.resetToken !== token) {
      return errorResponse(res, 'Invalid or expired reset token.');
    }

    // Check token expiry
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return errorResponse(res, 'Reset token has expired. Please request a new one.');
    }

    // Hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    updateRecord('users', user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return successResponse(res, null, 'Password reset successful! You can now login.');
  } catch (error) {
    return errorResponse(res, 'Failed to reset password.', 500);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
// ─────────────────────────────────────────────
const getAllUsers = (req, res) => {
  try {
    const users = readData('users');
    const sanitized = users.map(({ password, resetToken, resetTokenExpiry, ...u }) => u);
    return successResponse(res, sanitized, 'Users fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch users.', 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
};
