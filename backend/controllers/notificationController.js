/**
 * notificationController.js - Notifications Controller
 */
const { readData, findById, updateRecord, createRecord, deleteRecord, paginateData } = require('../utils/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');

const getNotifications = (req, res) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;
    let notifications = readData('notifications');
    if (isRead !== undefined) notifications = notifications.filter(n => n.isRead === (isRead === 'true'));
    if (type) notifications = notifications.filter(n => n.type === type);
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unreadCount = readData('notifications').filter(n => !n.isRead).length;
    const result = paginateData(notifications, page, limit);
    return res.status(200).json({
      success: true, message: 'Notifications fetched.',
      data: result.data, unreadCount,
      pagination: { total: result.total, page: result.page, totalPages: result.totalPages },
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch notifications.', 500);
  }
};

const markAsRead = (req, res) => {
  try {
    const notif = findById('notifications', req.params.id);
    if (!notif) return errorResponse(res, 'Notification not found.', 404);
    const updated = updateRecord('notifications', req.params.id, { isRead: true });
    return successResponse(res, updated, 'Marked as read.');
  } catch (error) {
    return errorResponse(res, 'Failed to mark as read.', 500);
  }
};

const markAllAsRead = (req, res) => {
  try {
    const notifications = readData('notifications');
    notifications.forEach(n => { n.isRead = true; });
    const { writeData } = require('../utils/db');
    writeData('notifications', notifications);
    return successResponse(res, null, 'All notifications marked as read.');
  } catch (error) {
    return errorResponse(res, 'Failed to mark all as read.', 500);
  }
};

const createNotification = (req, res) => {
  try {
    const { type, title, message, severity, relatedId, relatedModule } = req.body;
    if (!title || !message) return errorResponse(res, 'Title and message are required.');
    const newNotif = createRecord('notifications', {
      type: type || 'general', title, message,
      severity: severity || 'info', isRead: false,
      relatedId: relatedId || null, relatedModule: relatedModule || null,
    });
    return successResponse(res, newNotif, 'Notification created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create notification.', 500);
  }
};

const deleteNotification = (req, res) => {
  try {
    const { deleteRecord } = require('../utils/db');
    deleteRecord('notifications', req.params.id);
    return successResponse(res, null, 'Notification deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete notification.', 500);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification, deleteNotification };
