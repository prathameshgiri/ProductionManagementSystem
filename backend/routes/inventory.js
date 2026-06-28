// Inventory Routes
const express = require('express');
const router = express.Router();
const { getInventory, getInventoryItem, createInventoryItem, updateInventoryItem, deleteInventoryItem, stockIn, stockOut, getLowStockItems } = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');
const { warehouseAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getInventory);
router.get('/low-stock', authenticate, getLowStockItems);
router.get('/:id', authenticate, getInventoryItem);
router.post('/', authenticate, warehouseAccess, createInventoryItem);
router.put('/:id', authenticate, warehouseAccess, updateInventoryItem);
router.post('/:id/stock-in', authenticate, warehouseAccess, stockIn);
router.post('/:id/stock-out', authenticate, warehouseAccess, stockOut);
router.delete('/:id', authenticate, adminOnly, deleteInventoryItem);

module.exports = router;
