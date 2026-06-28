// Warehouse Routes
const express = require('express');
const router = express.Router();
const { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { authenticate } = require('../middleware/auth');
const { warehouseAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getWarehouses);
router.get('/:id', authenticate, getWarehouse);
router.post('/', authenticate, adminOnly, createWarehouse);
router.put('/:id', authenticate, warehouseAccess, updateWarehouse);
router.delete('/:id', authenticate, adminOnly, deleteWarehouse);

module.exports = router;
