/**
 * inventoryController.js - Inventory Management Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getInventory = (req, res) => {
  try {
    const { search, category, warehouseId, lowStock, page = 1, limit = 10 } = req.query;
    let items = readData('inventory');
    if (search) items = searchData(items, search, ['itemId', 'name', 'category', 'barcode']);
    if (category) items = items.filter(i => i.category === category);
    if (warehouseId) items = items.filter(i => i.warehouseId === warehouseId);
    if (lowStock === 'true') items = items.filter(i => i.quantity <= i.reorderLevel);
    items.sort((a, b) => a.name.localeCompare(b.name));
    return paginatedResponse(res, paginateData(items, page, limit), 'Inventory fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch inventory.', 500);
  }
};

const getInventoryItem = (req, res) => {
  try {
    const item = findById('inventory', req.params.id);
    if (!item) return notFoundResponse(res, 'Inventory Item');
    return successResponse(res, item, 'Item fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch item.', 500);
  }
};

const createInventoryItem = (req, res) => {
  try {
    const { name, category, quantity, unit, reorderLevel, reorderQuantity, unitCost, warehouseId, location, barcode, supplierId } = req.body;
    if (!name || !category) return errorResponse(res, 'Name and category are required.');
    const items = readData('inventory');
    const itemId = `INV-${String(items.length + 1).padStart(3, '0')}`;
    const newItem = createRecord('inventory', {
      itemId, name, category,
      quantity: parseInt(quantity) || 0,
      unit: unit || 'pieces',
      reorderLevel: parseInt(reorderLevel) || 10,
      reorderQuantity: parseInt(reorderQuantity) || 50,
      unitCost: parseFloat(unitCost) || 0,
      warehouseId: warehouseId || 'wh-001',
      location: location || '',
      barcode: barcode || '',
      supplierId: supplierId || null,
      lastUpdated: new Date().toISOString(),
    });
    return successResponse(res, newItem, 'Inventory item created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create item.', 500);
  }
};

// Stock In: add quantity
const stockIn = (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const item = findById('inventory', req.params.id);
    if (!item) return notFoundResponse(res, 'Inventory Item');
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return errorResponse(res, 'Valid quantity required.');
    const updated = updateRecord('inventory', req.params.id, {
      quantity: item.quantity + qty,
      lastUpdated: new Date().toISOString(),
    });
    return successResponse(res, updated, `Stock In: +${qty} units added.`);
  } catch (error) {
    return errorResponse(res, 'Stock In failed.', 500);
  }
};

// Stock Out: remove quantity
const stockOut = (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const item = findById('inventory', req.params.id);
    if (!item) return notFoundResponse(res, 'Inventory Item');
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return errorResponse(res, 'Valid quantity required.');
    if (item.quantity < qty) return errorResponse(res, `Insufficient stock. Available: ${item.quantity}`);
    const updated = updateRecord('inventory', req.params.id, {
      quantity: item.quantity - qty,
      lastUpdated: new Date().toISOString(),
    });
    return successResponse(res, updated, `Stock Out: -${qty} units removed.`);
  } catch (error) {
    return errorResponse(res, 'Stock Out failed.', 500);
  }
};

const updateInventoryItem = (req, res) => {
  try {
    const existing = findById('inventory', req.params.id);
    if (!existing) return notFoundResponse(res, 'Inventory Item');
    const updated = updateRecord('inventory', req.params.id, { ...req.body, lastUpdated: new Date().toISOString() });
    return successResponse(res, updated, 'Item updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update item.', 500);
  }
};

const deleteInventoryItem = (req, res) => {
  try {
    const deleted = deleteRecord('inventory', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Inventory Item');
    return successResponse(res, null, 'Item deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete item.', 500);
  }
};

const getLowStockItems = (req, res) => {
  try {
    const items = readData('inventory');
    const lowStock = items.filter(i => i.quantity <= i.reorderLevel);
    return successResponse(res, lowStock, `${lowStock.length} low stock items.`);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch low stock.', 500);
  }
};

module.exports = { getInventory, getInventoryItem, createInventoryItem, updateInventoryItem, deleteInventoryItem, stockIn, stockOut, getLowStockItems };
