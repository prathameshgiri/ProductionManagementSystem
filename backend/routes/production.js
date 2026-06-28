// Production Routes
const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder } = require('../controllers/productionController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly, allowRoles } = require('../middleware/rbac');

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', authenticate, managerAccess, createOrder);
router.put('/:id', authenticate, allowRoles('admin', 'production_manager', 'employee'), updateOrder);
router.delete('/:id', authenticate, adminOnly, deleteOrder);

module.exports = router;
