// Raw Materials Routes
const express = require('express');
const router = express.Router();
const { getMaterials, getMaterial, createMaterial, updateMaterial, deleteMaterial, logUsage } = require('../controllers/rawMaterialController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getMaterials);
router.get('/:id', authenticate, getMaterial);
router.post('/', authenticate, managerAccess, createMaterial);
router.put('/:id', authenticate, managerAccess, updateMaterial);
router.post('/:id/use', authenticate, logUsage);
router.delete('/:id', authenticate, adminOnly, deleteMaterial);

module.exports = router;
