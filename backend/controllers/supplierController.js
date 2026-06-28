/**
 * supplierController.js - Supplier Management Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getSuppliers = (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 10 } = req.query;
    let suppliers = readData('suppliers');
    if (search) suppliers = searchData(suppliers, search, ['supplierId', 'name', 'email', 'phone', 'category']);
    if (status) suppliers = suppliers.filter(s => s.status === status);
    if (category) suppliers = suppliers.filter(s => s.category === category);
    suppliers.sort((a, b) => a.name.localeCompare(b.name));
    return paginatedResponse(res, paginateData(suppliers, page, limit), 'Suppliers fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch suppliers.', 500);
  }
};

const getSupplier = (req, res) => {
  try {
    const supplier = findById('suppliers', req.params.id);
    if (!supplier) return notFoundResponse(res, 'Supplier');
    return successResponse(res, supplier, 'Supplier fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch supplier.', 500);
  }
};

const createSupplier = (req, res) => {
  try {
    const { name, phone, email, address, contactPerson, category, rating, status } = req.body;
    if (!name || !phone) return errorResponse(res, 'Name and phone are required.');
    const suppliers = readData('suppliers');
    const supplierId = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSupplier = createRecord('suppliers', {
      supplierId, name, phone, email: email || '',
      address: address || '', contactPerson: contactPerson || '',
      category: category || 'General', rating: parseFloat(rating) || 0,
      totalOrders: 0, onTimeDelivery: 0, status: status || 'active',
    });
    return successResponse(res, newSupplier, 'Supplier created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create supplier.', 500);
  }
};

const updateSupplier = (req, res) => {
  try {
    const existing = findById('suppliers', req.params.id);
    if (!existing) return notFoundResponse(res, 'Supplier');
    const updated = updateRecord('suppliers', req.params.id, req.body);
    return successResponse(res, updated, 'Supplier updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update supplier.', 500);
  }
};

const deleteSupplier = (req, res) => {
  try {
    const deleted = deleteRecord('suppliers', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Supplier');
    return successResponse(res, null, 'Supplier deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete supplier.', 500);
  }
};

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
