// Purchase Orders Routes
const express = require('express');
const router = express.Router();
const { getPurchases, getPurchase, createPurchase, updatePurchase, deletePurchase, approvePurchase, receivePurchase } = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getPurchases);
router.get('/:id', authenticate, getPurchase);
router.post('/', authenticate, createPurchase);
router.put('/:id', authenticate, managerAccess, updatePurchase);
router.post('/:id/approve', authenticate, managerAccess, approvePurchase);
router.post('/:id/receive', authenticate, managerAccess, receivePurchase);
router.delete('/:id', authenticate, adminOnly, deletePurchase);

module.exports = router;
