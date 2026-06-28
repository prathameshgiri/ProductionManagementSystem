/**
 * server.js - Main Express Application
 * 
 * Production Management System - Backend API Server
 * 
 * Starts the REST API server with all routes, middleware, and error handling.
 * 
 * Usage:
 *   Development: npm run dev (uses nodemon for auto-restart)
 *   Production:  npm start
 * 
 * API Base URL: http://localhost:5000/api
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import route files
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const productionRoutes = require('./routes/production');
const inventoryRoutes = require('./routes/inventory');
const machineRoutes = require('./routes/machines');
const employeeRoutes = require('./routes/employees');
const qualityRoutes = require('./routes/quality');
const supplierRoutes = require('./routes/suppliers');
const purchaseRoutes = require('./routes/purchases');
const warehouseRoutes = require('./routes/warehouse');
const rawMaterialRoutes = require('./routes/rawMaterials');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const activityLogRoutes = require('./routes/activityLogs');

// Import middleware
const { activityLogger } = require('./middleware/activityLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ─────────────────────────────────────────────
// Initialize Express App
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Security & Utility Middleware
// ─────────────────────────────────────────────

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - Allow requests from React frontend (port 5173)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per window
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Strict rate limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Parse JSON request bodies (max 10mb for base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────
// Activity Logger (auto-logs all write operations)
// ─────────────────────────────────────────────
app.use('/api/', activityLogger);

// ─────────────────────────────────────────────
// Health Check 
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Production Management System API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()) + 's',
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// ─────────────────────────────────────────────
// Backup/Restore Endpoint (Admin Only)
// ─────────────────────────────────────────────
const { authenticate } = require('./middleware/auth');
const { adminOnly } = require('./middleware/rbac');
const { readData } = require('./utils/db');
const { successResponse, errorResponse } = require('./utils/responseHelper');

app.get('/api/backup/export', authenticate, adminOnly, (req, res) => {
  try {
    const dbFiles = ['users', 'products', 'production', 'inventory', 'machines', 'employees', 'suppliers', 'purchases', 'quality', 'warehouse', 'raw_materials', 'notifications', 'activity_logs', 'reports'];
    const backup = {};
    dbFiles.forEach(file => {
      backup[file] = readData(file);
    });
    backup.exportedAt = new Date().toISOString();
    backup.version = '1.0.0';
    return successResponse(res, backup, 'Database backup created.');
  } catch (error) {
    return errorResponse(res, 'Backup failed.', 500);
  }
});

const { writeData } = require('./utils/db');
app.post('/api/backup/import', authenticate, adminOnly, (req, res) => {
  try {
    const backup = req.body;
    if (!backup || !backup.version) return errorResponse(res, 'Invalid backup file.', 400);
    
    const dbFiles = ['users', 'products', 'production', 'inventory', 'machines', 'employees', 'suppliers', 'purchases', 'quality', 'warehouse', 'raw_materials', 'notifications', 'activity_logs', 'reports'];
    dbFiles.forEach(file => {
      if (backup[file]) {
        writeData(file, backup[file]);
      }
    });
    
    return successResponse(res, null, 'Database restored successfully.');
  } catch (error) {
    return errorResponse(res, 'Restore failed.', 500);
  }
});

// ─────────────────────────────────────────────
// Serve React Frontend (Static Build)
// ─────────────────────────────────────────────
// The frontend build files will be located at ../frontend/dist
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// For any route that is NOT /api, serve the React app (Client-side routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Let the API 404 handler catch it
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ─────────────────────────────────────────────
// 404 and Error Handlers (for APIs)
// ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Production Management System - API       ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Server running on http://localhost:${PORT}   ║`);
  console.log(`║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}║`);
  console.log(`║   API Base: http://localhost:${PORT}/api        ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('  Default Admin Login:');
  console.log('    Email:    admin@prathameshgiri.in');
  console.log('    Password: Prathamesh@123');
  console.log('');
});

module.exports = app;
