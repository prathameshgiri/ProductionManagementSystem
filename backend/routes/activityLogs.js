// Activity Logs Routes
const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, adminOnly, getActivityLogs);

module.exports = router;
