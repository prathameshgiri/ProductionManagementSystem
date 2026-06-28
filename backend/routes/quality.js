// Quality Control Routes
const express = require('express');
const router = express.Router();
const { getInspections, getInspection, createInspection, updateInspection, deleteInspection, getQualityStats } = require('../controllers/qualityController');
const { authenticate } = require('../middleware/auth');
const { qualityAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getInspections);
router.get('/stats', authenticate, getQualityStats);
router.get('/:id', authenticate, getInspection);
router.post('/', authenticate, qualityAccess, createInspection);
router.put('/:id', authenticate, qualityAccess, updateInspection);
router.delete('/:id', authenticate, adminOnly, deleteInspection);

module.exports = router;
