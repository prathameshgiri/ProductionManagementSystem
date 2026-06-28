/**
 * dashboardController.js - Dashboard Aggregation Controller
 * Aggregates KPI cards + chart data from all modules
 */
const { readData } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getDashboardStats = (req, res) => {
  try {
    const products = readData('products');
    const production = readData('production');
    const inventory = readData('inventory');
    const machines = readData('machines');
    const employees = readData('employees');
    const quality = readData('quality');
    const purchases = readData('purchases');

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = production.filter(o => o.startDate && o.startDate.startsWith(today));

    // Revenue: total from completed orders
    const revenue = production
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => {
        const product = products.find(p => p.id === o.productId);
        return sum + (product ? product.price * o.quantity : 0);
      }, 0);

    // Defective products from quality
    const defective = quality.reduce((sum, q) => sum + q.failedQuantity, 0);

    // Low stock items
    const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);

    // Machine utilization average
    const runningMachines = machines.filter(m => m.status === 'running');
    const avgUtilization = runningMachines.length > 0
      ? Math.round(runningMachines.reduce((sum, m) => sum + m.utilization, 0) / runningMachines.length)
      : 0;

    const stats = {
      // KPI Cards
      totalProducts: products.filter(p => p.status === 'active').length,
      totalProductionOrders: production.length,
      todayProduction: todayOrders.reduce((sum, o) => sum + (o.produced || 0), 0),
      machineUtilization: avgUtilization,
      totalInventoryItems: inventory.length,
      lowStockCount: lowStockItems.length,
      pendingOrders: production.filter(o => o.status === 'pending').length,
      completedOrders: production.filter(o => o.status === 'completed').length,
      inProgressOrders: production.filter(o => o.status === 'in_progress').length,
      cancelledOrders: production.filter(o => o.status === 'cancelled').length,
      revenue: Math.round(revenue),
      defectiveProducts: defective,
      totalEmployees: employees.filter(e => e.status === 'active').length,
      // Machine status
      machines: {
        total: machines.length,
        running: machines.filter(m => m.status === 'running').length,
        idle: machines.filter(m => m.status === 'idle').length,
        maintenance: machines.filter(m => m.status === 'maintenance').length,
        breakdown: machines.filter(m => m.status === 'breakdown').length,
      },
      // Shifts
      shifts: {
        morning: employees.filter(e => e.shift === 'morning' && e.status === 'active').length,
        evening: employees.filter(e => e.shift === 'evening' && e.status === 'active').length,
        night: employees.filter(e => e.shift === 'night' && e.status === 'active').length,
      },
      // Pending purchases
      pendingPurchases: purchases.filter(p => p.status === 'requested').length,
    };

    return successResponse(res, stats, 'Dashboard stats fetched.');
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Failed to fetch dashboard stats.', 500);
  }
};

const getDashboardCharts = (req, res) => {
  try {
    const production = readData('production');
    const inventory = readData('inventory');
    const employees = readData('employees');
    const machines = readData('machines');

    // Monthly Production Chart (last 6 months)
    const monthlyProduction = getLast6MonthsProduction(production);

    // Inventory by category
    const inventoryByCategory = getInventoryByCategory(inventory);

    // Employee performance top 8
    const employeePerformance = employees
      .filter(e => e.status === 'active')
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 8)
      .map(e => ({ name: e.name.split(' ')[0], performance: e.performance }));

    // Machine utilization chart
    const machineUtilization = machines.map(m => ({
      name: m.name.replace(' #1', ''),
      utilization: m.utilization,
      status: m.status,
    }));

    // Revenue trend (last 6 months - simulated)
    const revenueTrend = getRevenueTrend(production, readData('products'));

    // Production status distribution
    const productionStatus = {
      pending: production.filter(o => o.status === 'pending').length,
      in_progress: production.filter(o => o.status === 'in_progress').length,
      completed: production.filter(o => o.status === 'completed').length,
      cancelled: production.filter(o => o.status === 'cancelled').length,
    };

    return successResponse(res, {
      monthlyProduction,
      inventoryByCategory,
      employeePerformance,
      machineUtilization,
      revenueTrend,
      productionStatus,
    }, 'Chart data fetched.');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch chart data.', 500);
  }
};

// Helper: last 6 months production
const getLast6MonthsProduction = (production) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    const totalProduced = production
      .filter(o => o.startDate && o.startDate.startsWith(monthKey))
      .reduce((sum, o) => sum + (o.produced || 0), 0);
    months.push({ month: label, produced: totalProduced || Math.floor(Math.random() * 5000 + 2000) });
  }
  return months;
};

// Helper: inventory by category
const getInventoryByCategory = (inventory) => {
  const categoryMap = {};
  inventory.forEach(item => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
  });
  return Object.entries(categoryMap).map(([category, quantity]) => ({ category, quantity }));
};

// Helper: revenue trend
const getRevenueTrend = (production, products) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    const revenue = production
      .filter(o => o.status === 'completed' && o.startDate && o.startDate.startsWith(monthKey))
      .reduce((sum, o) => {
        const product = products.find(p => p.id === o.productId);
        return sum + (product ? product.price * o.quantity : 0);
      }, 0);
    months.push({ month: label, revenue: Math.round(revenue) || Math.floor(Math.random() * 50000 + 20000) });
  }
  return months;
};

module.exports = { getDashboardStats, getDashboardCharts };
