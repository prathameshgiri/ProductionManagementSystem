// Auth Routes
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword, getAllUsers } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.get('/users', authenticate, adminOnly, getAllUsers);

module.exports = router;
