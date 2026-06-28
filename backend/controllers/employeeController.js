/**
 * employeeController.js - Employee Management Controller
 */
const { readData, findById, createRecord, updateRecord, deleteRecord, searchData, paginateData } = require('../utils/db');
const { successResponse, errorResponse, notFoundResponse, paginatedResponse } = require('../utils/responseHelper');

const getEmployees = (req, res) => {
  try {
    const { search, department, shift, status, page = 1, limit = 10 } = req.query;
    let employees = readData('employees');
    if (search) employees = searchData(employees, search, ['employeeId', 'name', 'email', 'phone', 'department', 'role']);
    if (department) employees = employees.filter(e => e.department === department);
    if (shift) employees = employees.filter(e => e.shift === shift);
    if (status) employees = employees.filter(e => e.status === status);
    employees.sort((a, b) => a.name.localeCompare(b.name));
    return paginatedResponse(res, paginateData(employees, page, limit), 'Employees fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch employees.', 500);
  }
};

const getEmployee = (req, res) => {
  try {
    const employee = findById('employees', req.params.id);
    if (!employee) return notFoundResponse(res, 'Employee');
    return successResponse(res, employee, 'Employee fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch employee.', 500);
  }
};

const createEmployee = (req, res) => {
  try {
    const { name, email, phone, department, role, shift, status, salary, joinDate } = req.body;
    if (!name || !email || !department) return errorResponse(res, 'Name, email, and department are required.');
    const employees = readData('employees');
    const existing = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (existing) return errorResponse(res, 'Email already exists.');
    const employeeId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmployee = createRecord('employees', {
      employeeId, name, email: email.toLowerCase(),
      phone: phone || '', department, role: role || 'General Worker',
      shift: shift || 'morning', status: status || 'active',
      joinDate: joinDate || new Date().toISOString(),
      attendance: [], performance: 0, overtime: 0,
      salary: parseFloat(salary) || 0,
    });
    return successResponse(res, newEmployee, 'Employee created.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create employee.', 500);
  }
};

const updateEmployee = (req, res) => {
  try {
    const existing = findById('employees', req.params.id);
    if (!existing) return notFoundResponse(res, 'Employee');
    const updated = updateRecord('employees', req.params.id, req.body);
    return successResponse(res, updated, 'Employee updated.');
  } catch (error) {
    return errorResponse(res, 'Failed to update employee.', 500);
  }
};

const deleteEmployee = (req, res) => {
  try {
    const deleted = deleteRecord('employees', req.params.id);
    if (!deleted) return notFoundResponse(res, 'Employee');
    return successResponse(res, null, 'Employee deleted.');
  } catch (error) {
    return errorResponse(res, 'Failed to delete employee.', 500);
  }
};

// Record attendance for today
const markAttendance = (req, res) => {
  try {
    const { type, time } = req.body; // type: 'in' | 'out'
    const employee = findById('employees', req.params.id);
    if (!employee) return notFoundResponse(res, 'Employee');

    const today = new Date().toISOString().split('T')[0];
    const attendance = employee.attendance || [];
    const todayEntry = attendance.find(a => a.date === today);

    if (type === 'in') {
      if (todayEntry) return errorResponse(res, 'Already checked in today.');
      attendance.push({ date: today, checkIn: time || new Date().toTimeString().slice(0, 5), checkOut: null, status: 'present' });
    } else if (type === 'out') {
      if (!todayEntry) return errorResponse(res, 'No check-in found for today.');
      todayEntry.checkOut = time || new Date().toTimeString().slice(0, 5);
    }

    const updated = updateRecord('employees', req.params.id, { attendance });
    return successResponse(res, updated, `Attendance ${type === 'in' ? 'check-in' : 'check-out'} recorded.`);
  } catch (error) {
    return errorResponse(res, 'Failed to mark attendance.', 500);
  }
};

const getShiftStats = (req, res) => {
  try {
    const employees = readData('employees');
    const stats = {
      morning: employees.filter(e => e.shift === 'morning' && e.status === 'active').length,
      evening: employees.filter(e => e.shift === 'evening' && e.status === 'active').length,
      night: employees.filter(e => e.shift === 'night' && e.status === 'active').length,
      total: employees.filter(e => e.status === 'active').length,
    };
    return successResponse(res, stats, 'Shift stats fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch shift stats.', 500);
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, markAttendance, getShiftStats };
