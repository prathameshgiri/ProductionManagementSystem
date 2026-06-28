// productService.js
import api from './api';
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
};

// productionService.js
export const productionService = {
  getAll: (params) => api.get('/production', { params }),
  getById: (id) => api.get(`/production/${id}`),
  create: (data) => api.post('/production', data),
  update: (id, data) => api.put(`/production/${id}`, data),
  delete: (id) => api.delete(`/production/${id}`),
};

// inventoryService.js
export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  stockIn: (id, data) => api.post(`/inventory/${id}/stock-in`, data),
  stockOut: (id, data) => api.post(`/inventory/${id}/stock-out`, data),
  getLowStock: () => api.get('/inventory/low-stock'),
};

// machineService.js
export const machineService = {
  getAll: (params) => api.get('/machines', { params }),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
  getUtilization: () => api.get('/machines/utilization'),
};

// employeeService.js
export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  markAttendance: (id, data) => api.post(`/employees/${id}/attendance`, data),
  getShiftStats: () => api.get('/employees/shift-stats'),
};

// qualityService.js
export const qualityService = {
  getAll: (params) => api.get('/quality', { params }),
  getById: (id) => api.get(`/quality/${id}`),
  create: (data) => api.post('/quality', data),
  update: (id, data) => api.put(`/quality/${id}`, data),
  delete: (id) => api.delete(`/quality/${id}`),
  getStats: () => api.get('/quality/stats'),
};

// supplierService.js
export const supplierService = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// purchaseService.js
export const purchaseService = {
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
  approve: (id) => api.post(`/purchases/${id}/approve`),
  receive: (id) => api.post(`/purchases/${id}/receive`),
};

// warehouseService.js
export const warehouseService = {
  getAll: (params) => api.get('/warehouse', { params }),
  getById: (id) => api.get(`/warehouse/${id}`),
  create: (data) => api.post('/warehouse', data),
  update: (id, data) => api.put(`/warehouse/${id}`, data),
  delete: (id) => api.delete(`/warehouse/${id}`),
};

// rawMaterialService.js
export const rawMaterialService = {
  getAll: (params) => api.get('/raw-materials', { params }),
  getById: (id) => api.get(`/raw-materials/${id}`),
  create: (data) => api.post('/raw-materials', data),
  update: (id, data) => api.put(`/raw-materials/${id}`, data),
  delete: (id) => api.delete(`/raw-materials/${id}`),
  logUsage: (id, data) => api.post(`/raw-materials/${id}/use`, data),
};

// notificationService.js
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  create: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// dashboardService.js
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

// activityLogService.js
export const activityLogService = {
  getAll: (params) => api.get('/activity-logs', { params }),
};
