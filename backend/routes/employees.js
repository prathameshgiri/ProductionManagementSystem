// Employees Routes
const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, markAttendance, getShiftStats } = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { managerAccess, adminOnly } = require('../middleware/rbac');

router.get('/', authenticate, getEmployees);
router.get('/shift-stats', authenticate, getShiftStats);
router.get('/:id', authenticate, getEmployee);
router.post('/', authenticate, adminOnly, createEmployee);
router.put('/:id', authenticate, managerAccess, updateEmployee);
router.post('/:id/attendance', authenticate, markAttendance);
router.delete('/:id', authenticate, adminOnly, deleteEmployee);

module.exports = router;
