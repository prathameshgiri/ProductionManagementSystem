/**
 * warehouseController.js - Warehouse Management Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getWarehouses = (req, res) => {
  try {
    const { search, status, type, page = 1, limit = 10 } = req.query;
    let warehouses = readData('warehouse');
    if (search) warehouses = searchData(warehouses, search, ['warehouseId', 'name', 'location']);
    if (status) warehouses = warehouses.filter(w => w.status === status);
    if (type) warehouses = warehouses.filter(w => w.type === type);
    return paginatedResponse(res, paginateData(warehouses, page, limit), 'Warehouses fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch warehouses.', 500);
  }
};

const getWarehouse = (req, res) => {
  try {
    const warehouse = findById('warehouse', req.params.id);
    if (!warehouse) return notFoundResponse(res, 'Warehouse');
    // Include inventory for this warehouse
    const inventory = readData('inventory').filter(i => i.warehouseId === req.params.id);
    return successResponse(res, { ...warehouse, inventory }, 'Warehouse fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch warehouse.', 500);
  }
};

const createWarehouse = (req, res) => {
  try {
    const { name, location, manager, managerName, capacity, type } = req.body;
    if (!name || !location) return errorResponse(res, 'Name and location are required.');
    const warehouses = readData('warehouse');
    const warehouseId = `WH-${String(warehouses.length + 1).padStart(3, '0')}`;
    const newWarehouse = createRecord('warehouse', {
      warehouseId, name, location,
      manager: manager || null, managerName: managerName || '',
      capacity: parseInt(capacity) || 1000, usedCapacity: 0,
      status: 'active', type: type || 'raw_materials',
    });
    return successResponse(res, newWarehouse, 'Warehouse created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create warehouse.', 500);
  }
};

const updateWarehouse = (req, res) => {
  try {
    const existing = findById('warehouse', req.params.id);
    if (!existing) return notFoundResponse(res, 'Warehouse');
    const updated = updateRecord('warehouse', req.params.id, req.body);
    return successResponse(res, updated, 'Warehouse updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update warehouse.', 500);
  }
};

const deleteWarehouse = (req, res) => {
  try {
    const deleted = deleteRecord('warehouse', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Warehouse');
    return successResponse(res, null, 'Warehouse deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete warehouse.', 500);
  }
};

module.exports = { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse };
