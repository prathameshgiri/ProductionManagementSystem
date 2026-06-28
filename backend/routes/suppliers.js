// Suppliers Routes
const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getSuppliers);
router.get('/:id', authenticate, getSupplier);
router.post('/', authenticate, managerAccess, createSupplier);
router.put('/:id', authenticate, managerAccess, updateSupplier);
router.delete('/:id', authenticate, adminOnly, deleteSupplier);

module.exports = router;
