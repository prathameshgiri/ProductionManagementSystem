// Notifications Routes
const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createNotification, deleteNotification } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getNotifications);
router.post('/', authenticate, createNotification);
router.put('/mark-all-read', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
