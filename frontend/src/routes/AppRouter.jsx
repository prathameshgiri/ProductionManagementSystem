/**
 * AppRouter.jsx - Main Application Router
 * All routes defined here with lazy loading for performance
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// ─── Lazy-loaded pages for code splitting ───
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Products = lazy(() => import('../pages/Products'));
const ProductionPlanning = lazy(() => import('../pages/ProductionPlanning'));
const ProductionOrders = lazy(() => import('../pages/ProductionOrders'));
const RawMaterials = lazy(() => import('../pages/RawMaterials'));
const Inventory = lazy(() => import('../pages/Inventory'));
const Machines = lazy(() => import('../pages/Machines'));
const Employees = lazy(() => import('../pages/Employees'));
const QualityControl = lazy(() => import('../pages/QualityControl'));
const Suppliers = lazy(() => import('../pages/Suppliers'));
const Purchases = lazy(() => import('../pages/Purchases'));
const Warehouse = lazy(() => import('../pages/Warehouse'));
const Reports = lazy(() => import('../pages/Reports'));
const Notifications = lazy(() => import('../pages/Notifications'));
const ActivityLogs = lazy(() => import('../pages/ActivityLogs'));
const Settings = lazy(() => import('../pages/Settings'));
const UserProfile = lazy(() => import('../pages/UserProfile'));
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Forbidden = lazy(() => import('../pages/errors/Forbidden'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes (auth pages) */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
          <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

          {/* Protected routes (main app) */}
          <Route path="/" element={<PrivateRoute allowedRoles={['admin', 'production_manager']}><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute allowedRoles={['admin', 'production_manager']}><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
          
          <Route path="/products" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'quality_inspector', 'warehouse_manager']}><MainLayout><Products /></MainLayout></PrivateRoute>} />
          <Route path="/production-planning" element={<PrivateRoute allowedRoles={['admin', 'production_manager']}><MainLayout><ProductionPlanning /></MainLayout></PrivateRoute>} />
          <Route path="/production-orders" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'employee']}><MainLayout><ProductionOrders /></MainLayout></PrivateRoute>} />
          <Route path="/raw-materials" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'warehouse_manager']}><MainLayout><RawMaterials /></MainLayout></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'warehouse_manager']}><MainLayout><Inventory /></MainLayout></PrivateRoute>} />
          
          <Route path="/machines" element={<PrivateRoute allowedRoles={['admin', 'production_manager']}><MainLayout><Machines /></MainLayout></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute allowedRoles={['admin', 'production_manager']}><MainLayout><Employees /></MainLayout></PrivateRoute>} />
          <Route path="/quality-control" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'quality_inspector']}><MainLayout><QualityControl /></MainLayout></PrivateRoute>} />
          <Route path="/suppliers" element={<PrivateRoute allowedRoles={['admin', 'production_manager']}><MainLayout><Suppliers /></MainLayout></PrivateRoute>} />
          <Route path="/purchases" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'warehouse_manager']}><MainLayout><Purchases /></MainLayout></PrivateRoute>} />
          <Route path="/warehouse" element={<PrivateRoute allowedRoles={['admin', 'warehouse_manager']}><MainLayout><Warehouse /></MainLayout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute allowedRoles={['admin', 'production_manager', 'quality_inspector']}><MainLayout><Reports /></MainLayout></PrivateRoute>} />
          
          <Route path="/notifications" element={<PrivateRoute><MainLayout><Notifications /></MainLayout></PrivateRoute>} />
          <Route path="/activity-logs" element={<PrivateRoute allowedRoles={['admin']}><MainLayout><ActivityLogs /></MainLayout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><MainLayout><Settings /></MainLayout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><MainLayout><UserProfile /></MainLayout></PrivateRoute>} />

          {/* Error pages */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
