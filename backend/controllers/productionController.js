/**
 * productionController.js - Production Orders Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getOrders = (req, res) => {
  try {
    const { search, status, priority, planType, page = 1, limit = 10 } = req.query;
    let orders = readData('production');
    if (search) orders = searchData(orders, search, ['orderId', 'productName', 'assignedTo']);
    if (status) orders = orders.filter(o => o.status === status);
    if (priority) orders = orders.filter(o => o.priority === priority);
    if (planType) orders = orders.filter(o => o.planType === planType);
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginatedResponse(res, paginateData(orders, page, limit), 'Orders fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch orders.', 500);
  }
};

const getOrder = (req, res) => {
  try {
    const order = findById('production', req.params.id);
    if (!order) return notFoundResponse(res, 'Production Order');
    return successResponse(res, order, 'Order fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch order.', 500);
  }
};

const createOrder = (req, res) => {
  try {
    const { productId, productName, planType, quantity, startDate, endDate, priority, assignedTo, machineId, notes } = req.body;
    if (!productId || !quantity || !startDate || !endDate) return errorResponse(res, 'Product, quantity, start date and end date are required.');
    const orders = readData('production');
    const orderId = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder = createRecord('production', {
      orderId, productId, productName: productName || '',
      planType: planType || 'daily',
      quantity: parseInt(quantity), produced: 0,
      startDate, endDate,
      priority: priority || 'medium',
      status: 'pending',
      assignedTo: assignedTo || null,
      machineId: machineId || null,
      notes: notes || '',
    });
    return successResponse(res, newOrder, 'Production order created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create order.', 500);
  }
};

const updateOrder = (req, res) => {
  try {
    const existing = findById('production', req.params.id);
    if (!existing) return notFoundResponse(res, 'Production Order');
    const updated = updateRecord('production', req.params.id, req.body);
    return successResponse(res, updated, 'Order updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update order.', 500);
  }
};

const deleteOrder = (req, res) => {
  try {
    const deleted = deleteRecord('production', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Production Order');
    return successResponse(res, null, 'Order deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete order.', 500);
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrder, deleteOrder };
