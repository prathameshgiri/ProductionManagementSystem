/**
 * machineController.js - Machine Management Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getMachines = (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let machines = readData('machines');
    if (search) machines = searchData(machines, search, ['machineId', 'name', 'type', 'location']);
    if (status) machines = machines.filter(m => m.status === status);
    return paginatedResponse(res, paginateData(machines, page, limit), 'Machines fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch machines.', 500);
  }
};

const getMachine = (req, res) => {
  try {
    const machine = findById('machines', req.params.id);
    if (!machine) return notFoundResponse(res, 'Machine');
    return successResponse(res, machine, 'Machine fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch machine.', 500);
  }
};

const createMachine = (req, res) => {
  try {
    const { name, type, status, capacity, location, manufacturer, model, serialNumber, purchaseDate, lastServiceDate, nextMaintenanceDate } = req.body;
    if (!name || !type) return errorResponse(res, 'Machine name and type are required.');
    const machines = readData('machines');
    const machineId = `MCH-${String(machines.length + 1).padStart(3, '0')}`;
    const newMachine = createRecord('machines', {
      machineId, name, type, status: status || 'idle',
      capacity: parseInt(capacity) || 100,
      utilization: 0, location: location || '',
      manufacturer: manufacturer || '', model: model || '',
      serialNumber: serialNumber || '',
      purchaseDate: purchaseDate || null,
      lastServiceDate: lastServiceDate || null,
      nextMaintenanceDate: nextMaintenanceDate || null,
      downtimeHours: 0, totalHoursRun: 0, oee: 0, notes: '',
    });
    return successResponse(res, newMachine, 'Machine created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create machine.', 500);
  }
};

const updateMachine = (req, res) => {
  try {
    const existing = findById('machines', req.params.id);
    if (!existing) return notFoundResponse(res, 'Machine');
    const updated = updateRecord('machines', req.params.id, req.body);
    return successResponse(res, updated, 'Machine updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update machine.', 500);
  }
};

const deleteMachine = (req, res) => {
  try {
    const deleted = deleteRecord('machines', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Machine');
    return successResponse(res, null, 'Machine deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete machine.', 500);
  }
};

const getMachineUtilization = (req, res) => {
  try {
    const machines = readData('machines');
    const stats = {
      total: machines.length,
      running: machines.filter(m => m.status === 'running').length,
      idle: machines.filter(m => m.status === 'idle').length,
      maintenance: machines.filter(m => m.status === 'maintenance').length,
      breakdown: machines.filter(m => m.status === 'breakdown').length,
      avgUtilization: Math.round(machines.reduce((sum, m) => sum + (m.utilization || 0), 0) / machines.length),
      avgOEE: Math.round(machines.reduce((sum, m) => sum + (m.oee || 0), 0) / machines.length),
    };
    return successResponse(res, stats, 'Utilization fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch utilization.', 500);
  }
};

module.exports = { getMachines, getMachine, createMachine, updateMachine, deleteMachine, getMachineUtilization };
