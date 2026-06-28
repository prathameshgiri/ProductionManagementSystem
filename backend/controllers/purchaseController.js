/**
 * purchaseController.js - Purchase Orders Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getPurchases = (req, res) => {
  try {
    const { search, status, supplierId, page = 1, limit = 10 } = req.query;
    let purchases = readData('purchases');
    if (search) purchases = searchData(purchases, search, ['purchaseId', 'supplierName']);
    if (status) purchases = purchases.filter(p => p.status === status);
    if (supplierId) purchases = purchases.filter(p => p.supplierId === supplierId);
    purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginatedResponse(res, paginateData(purchases, page, limit), 'Purchases fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch purchases.', 500);
  }
};

const getPurchase = (req, res) => {
  try {
    const purchase = findById('purchases', req.params.id);
    if (!purchase) return notFoundResponse(res, 'Purchase Order');
    return successResponse(res, purchase, 'Purchase fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch purchase.', 500);
  }
};

const createPurchase = (req, res) => {
  try {
    const { supplierId, supplierName, items, expectedDelivery, notes } = req.body;
    if (!supplierId || !items || !items.length) return errorResponse(res, 'Supplier and items are required.');
    const purchases = readData('purchases');
    const purchaseId = `PO-${String(purchases.length + 1).padStart(3, '0')}`;
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const newPurchase = createRecord('purchases', {
      purchaseId, supplierId, supplierName: supplierName || '',
      items, totalAmount,
      status: 'requested',
      requestedBy: req.user?.id || null,
      approvedBy: null,
      expectedDelivery: expectedDelivery || null,
      grnDate: null,
      notes: notes || '',
    });
    return successResponse(res, newPurchase, 'Purchase order created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create purchase.', 500);
  }
};

const updatePurchase = (req, res) => {
  try {
    const existing = findById('purchases', req.params.id);
    if (!existing) return notFoundResponse(res, 'Purchase Order');
    const updated = updateRecord('purchases', req.params.id, req.body);
    return successResponse(res, updated, 'Purchase updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update purchase.', 500);
  }
};

// Approve a purchase order
const approvePurchase = (req, res) => {
  try {
    const purchase = findById('purchases', req.params.id);
    if (!purchase) return notFoundResponse(res, 'Purchase Order');
    if (purchase.status !== 'requested') return errorResponse(res, 'Only requested orders can be approved.');
    const updated = updateRecord('purchases', req.params.id, {
      status: 'approved', approvedBy: req.user?.id,
    });
    return successResponse(res, updated, 'Purchase order approved.');
  } catch (error) {
    return errorResponse(res, 'Failed to approve purchase.', 500);
  }
};

// Mark as received (GRN)
const receivePurchase = (req, res) => {
  try {
    const purchase = findById('purchases', req.params.id);
    if (!purchase) return notFoundResponse(res, 'Purchase Order');
    const updated = updateRecord('purchases', req.params.id, {
      status: 'received', grnDate: new Date().toISOString(),
    });
    return successResponse(res, updated, 'Goods received. GRN created.');
  } catch (error) {
    return errorResponse(res, 'Failed to receive purchase.', 500);
  }
};

const deletePurchase = (req, res) => {
  try {
    const deleted = deleteRecord('purchases', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Purchase Order');
    return successResponse(res, null, 'Purchase deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete purchase.', 500);
  }
};

module.exports = { getPurchases, getPurchase, createPurchase, updatePurchase, deletePurchase, approvePurchase, receivePurchase };
