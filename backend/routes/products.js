// Products Routes
const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getProducts);
router.get('/categories', authenticate, getCategories);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, managerAccess, createProduct);
router.put('/:id', authenticate, managerAccess, updateProduct);
router.delete('/:id', authenticate, adminOnly, deleteProduct);

module.exports = router;
