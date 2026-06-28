/**
 * activityLogController.js - Activity Logs Controller
 */
const { readData, paginateData, searchData } = require('../utils/db');
const { errorResponse, paginatedResponse } = require('../utils/responseHelper');

const getActivityLogs = (req, res) => {
  try {
    const { search, userId, action, resource, page = 1, limit = 20 } = req.query;
    let logs = readData('activity_logs');
    if (search) logs = searchData(logs, search, ['userName', 'action', 'resource', 'path']);
    if (userId) logs = logs.filter(l => l.userId === userId);
    if (action) logs = logs.filter(l => l.action === action);
    if (resource) logs = logs.filter(l => l.resource === resource);
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return paginatedResponse(res, paginateData(logs, page, limit), 'Activity logs fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch activity logs.', 500);
  }
};

module.exports = { getActivityLogs };
