/**
 * qualityController.js - Quality Control Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getInspections = (req, res) => {
  try {
    const { search, status, severity, page = 1, limit = 10 } = req.query;
    let inspections = readData('quality');
    if (search) inspections = searchData(inspections, search, ['inspectionId', 'productName', 'defectType', 'batchNumber']);
    if (status) inspections = inspections.filter(i => i.status === status);
    if (severity) inspections = inspections.filter(i => i.severity === severity);
    inspections.sort((a, b) => new Date(b.inspectedAt) - new Date(a.inspectedAt));
    return paginatedResponse(res, paginateData(inspections, page, limit), 'Inspections fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch inspections.', 500);
  }
};

const getInspection = (req, res) => {
  try {
    const inspection = findById('quality', req.params.id);
    if (!inspection) return notFoundResponse(res, 'Inspection');
    return successResponse(res, inspection, 'Inspection fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch inspection.', 500);
  }
};

const createInspection = (req, res) => {
  try {
    const { productId, productName, orderId, batchNumber, inspectedQuantity, passedQuantity, failedQuantity, defectType, severity, status, inspector, inspectorName, notes } = req.body;
    if (!productId || !inspectedQuantity) return errorResponse(res, 'Product and inspected quantity are required.');
    const inspections = readData('quality');
    const inspectionId = `QC-${String(inspections.length + 1).padStart(3, '0')}`;
    const newInspection = createRecord('quality', {
      inspectionId, productId, productName: productName || '',
      orderId: orderId || null, batchNumber: batchNumber || '',
      inspectedQuantity: parseInt(inspectedQuantity),
      passedQuantity: parseInt(passedQuantity) || 0,
      failedQuantity: parseInt(failedQuantity) || 0,
      defectType: defectType || 'None',
      severity: severity || 'low',
      status: status || 'passed',
      inspector: inspector || req.user?.id,
      inspectorName: inspectorName || req.user?.name || '',
      notes: notes || '',
      inspectedAt: new Date().toISOString(),
    });
    return successResponse(res, newInspection, 'Inspection recorded.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create inspection.', 500);
  }
};

const updateInspection = (req, res) => {
  try {
    const existing = findById('quality', req.params.id);
    if (!existing) return notFoundResponse(res, 'Inspection');
    const updated = updateRecord('quality', req.params.id, req.body);
    return successResponse(res, updated, 'Inspection updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update inspection.', 500);
  }
};

const deleteInspection = (req, res) => {
  try {
    const deleted = deleteRecord('quality', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Inspection');
    return successResponse(res, null, 'Inspection deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete inspection.', 500);
  }
};

const getQualityStats = (req, res) => {
  try {
    const inspections = readData('quality');
    const totalInspected = inspections.reduce((sum, i) => sum + i.inspectedQuantity, 0);
    const totalPassed = inspections.reduce((sum, i) => sum + i.passedQuantity, 0);
    const totalFailed = inspections.reduce((sum, i) => sum + i.failedQuantity, 0);
    return successResponse(res, {
      totalInspections: inspections.length,
      totalInspected, totalPassed, totalFailed,
      passRate: totalInspected > 0 ? Math.round((totalPassed / totalInspected) * 100) : 0,
      defectRate: totalInspected > 0 ? Math.round((totalFailed / totalInspected) * 100) : 0,
      byStatus: {
        passed: inspections.filter(i => i.status === 'passed').length,
        failed: inspections.filter(i => i.status === 'failed').length,
        rework: inspections.filter(i => i.status === 'rework').length,
      },
    }, 'Quality stats fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch quality stats.', 500);
  }
};

module.exports = { getInspections, getInspection, createInspection, updateInspection, deleteInspection, getQualityStats };
