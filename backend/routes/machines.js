// Machines Routes
const express = require('express');
const router = express.Router();
const { getMachines, getMachine, createMachine, updateMachine, deleteMachine, getMachineUtilization } = require('../controllers/machineController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getMachines);
router.get('/utilization', authenticate, getMachineUtilization);
router.get('/:id', authenticate, getMachine);
router.post('/', authenticate, adminOnly, createMachine);
router.put('/:id', authenticate, managerAccess, updateMachine);
router.delete('/:id', authenticate, adminOnly, deleteMachine);

module.exports = router;
