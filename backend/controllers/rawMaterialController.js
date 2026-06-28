/**
 * rawMaterialController.js - Raw Material Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getMaterials = (req, res) => {
  try {
    const { search, status, supplierId, page = 1, limit = 10 } = req.query;
    let materials = readData('raw_materials');
    if (search) materials = searchData(materials, search, ['materialId', 'name', 'supplierName']);
    if (status) materials = materials.filter(m => m.status === status);
    if (supplierId) materials = materials.filter(m => m.supplierId === supplierId);
    materials.sort((a, b) => a.name.localeCompare(b.name));
    return paginatedResponse(res, paginateData(materials, page, limit), 'Materials fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch materials.', 500);
  }
};

const getMaterial = (req, res) => {
  try {
    const material = findById('raw_materials', req.params.id);
    if (!material) return notFoundResponse(res, 'Raw Material');
    return successResponse(res, material, 'Material fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch material.', 500);
  }
};

const createMaterial = (req, res) => {
  try {
    const { name, quantity, unit, unitCost, reorderLevel, supplierId, supplierName } = req.body;
    if (!name) return errorResponse(res, 'Material name is required.');
    const materials = readData('raw_materials');
    const materialId = `MAT-${String(materials.length + 1).padStart(3, '0')}`;
    const qty = parseInt(quantity) || 0;
    const reorder = parseInt(reorderLevel) || 0;
    let status = 'in_stock';
    if (qty === 0) status = 'out_of_stock';
    else if (qty <= reorder) status = 'low_stock';
    const newMaterial = createRecord('raw_materials', {
      materialId, name, quantity: qty, unit: unit || 'pieces',
      unitCost: parseFloat(unitCost) || 0, reorderLevel: reorder,
      supplierId: supplierId || null, supplierName: supplierName || '',
      usageLog: [], status, lastUpdated: new Date().toISOString(),
    });
    return successResponse(res, newMaterial, 'Material created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create material.', 500);
  }
};

const updateMaterial = (req, res) => {
  try {
    const existing = findById('raw_materials', req.params.id);
    if (!existing) return notFoundResponse(res, 'Raw Material');
    // Recalculate status based on new quantity
    const qty = parseInt(req.body.quantity ?? existing.quantity);
    const reorder = parseInt(req.body.reorderLevel ?? existing.reorderLevel);
    let status = 'in_stock';
    if (qty === 0) status = 'out_of_stock';
    else if (qty <= reorder) status = 'low_stock';
    const updated = updateRecord('raw_materials', req.params.id, { ...req.body, status, lastUpdated: new Date().toISOString() });
    return successResponse(res, updated, 'Material updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update material.', 500);
  }
};

const deleteMaterial = (req, res) => {
  try {
    const deleted = deleteRecord('raw_materials', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Raw Material');
    return successResponse(res, null, 'Material deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete material.', 500);
  }
};

// Log material usage
const logUsage = (req, res) => {
  try {
    const { used, orderId, note } = req.body;
    const material = findById('raw_materials', req.params.id);
    if (!material) return notFoundResponse(res, 'Raw Material');
    const qty = parseInt(used);
    if (!qty || qty <= 0) return errorResponse(res, 'Valid usage quantity required.');
    if (material.quantity < qty) return errorResponse(res, `Insufficient stock. Available: ${material.quantity}`);
    const newUsageEntry = { date: new Date().toISOString().split('T')[0], used: qty, orderId: orderId || null, note: note || '' };
    const newQty = material.quantity - qty;
    let status = 'in_stock';
    if (newQty === 0) status = 'out_of_stock';
    else if (newQty <= material.reorderLevel) status = 'low_stock';
    const updated = updateRecord('raw_materials', req.params.id, {
      quantity: newQty, status,
      usageLog: [...(material.usageLog || []), newUsageEntry],
      lastUpdated: new Date().toISOString(),
    });
    return successResponse(res, updated, `Usage logged: ${qty} ${material.unit} consumed.`);
  } catch (error) {
    return errorResponse(res, 'Failed to log usage.', 500);
  }
};

module.exports = { getMaterials, getMaterial, createMaterial, updateMaterial, deleteMaterial, logUsage };
