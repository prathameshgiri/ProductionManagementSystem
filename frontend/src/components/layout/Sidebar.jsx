/**
 * Sidebar.jsx - Main Navigation Sidebar
 * 
 * - Fixed on desktop, drawer overlay on mobile
 * - Collapsible (icon-only mode on desktop)
 * - Role-filtered navigation links
 * - Active link highlighting
 */

import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiBox, FiTool, FiPackage, FiUsers, FiSettings,
  FiFileText, FiShoppingCart, FiClipboard, FiAlertCircle,
  FiBarChart2, FiTruck, FiActivity, FiBell, FiLogOut,
  FiChevronLeft, FiX, FiZap, FiLayers, FiArchive, FiHexagon
} from 'react-icons/fi';

// All navigation items with role access
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <FiGrid />, roles: ['admin','production_manager'] },
  { path: '/products', label: 'Products', icon: <FiBox />, roles: ['admin','production_manager','quality_inspector','warehouse_manager'] },
  { path: '/production-planning', label: 'Production Plan', icon: <FiLayers />, roles: ['admin','production_manager'] },
  { path: '/production-orders', label: 'Production Orders', icon: <FiZap />, roles: ['admin','production_manager','employee'] },
  { path: '/raw-materials', label: 'Raw Materials', icon: <FiArchive />, roles: ['admin','production_manager','warehouse_manager'] },
  { path: '/inventory', label: 'Inventory', icon: <FiPackage />, roles: ['admin','production_manager','warehouse_manager'] },
  { path: '/machines', label: 'Machines', icon: <FiTool />, roles: ['admin','production_manager'] },
  { path: '/employees', label: 'Employees', icon: <FiUsers />, roles: ['admin','production_manager'] },
  { path: '/quality-control', label: 'Quality Control', icon: <FiClipboard />, roles: ['admin','production_manager','quality_inspector'] },
  { path: '/suppliers', label: 'Suppliers', icon: <FiTruck />, roles: ['admin','production_manager'] },
  { path: '/purchases', label: 'Purchases', icon: <FiShoppingCart />, roles: ['admin','production_manager','warehouse_manager'] },
  { path: '/warehouse', label: 'Warehouse', icon: <FiBarChart2 />, roles: ['admin','warehouse_manager'] },
  { path: '/reports', label: 'Reports', icon: <FiFileText />, roles: ['admin','production_manager','quality_inspector'] },
  { path: '/notifications', label: 'Notifications', icon: <FiBell />, roles: ['admin','production_manager','employee','quality_inspector','warehouse_manager'] },
  { path: '/activity-logs', label: 'Activity Logs', icon: <FiActivity />, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: <FiSettings />, roles: ['admin','production_manager','employee','quality_inspector','warehouse_manager'] },
];

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Filter nav items by user role
  const visibleItems = NAV_ITEMS.filter(item =>
    !user?.role || item.roles.includes(user.role)
  );

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      production_manager: 'Production Manager',
      employee: 'Employee',
      quality_inspector: 'Quality Inspector',
      warehouse_manager: 'Warehouse Manager',
    };
    return labels[role] || role;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10',
        isCollapsed && 'justify-center px-2'
      )}>
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-glow">
          <FiHexagon className="text-white fill-white/20" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">PMS Factory</p>
            <p className="text-xs text-slate-400 truncate">Production System</p>
          </div>
        )}
        {/* Collapse toggle on desktop */}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex ml-auto text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <FiChevronLeft />
          </button>
        )}
      </div>

      {/* User info */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose} // Close on mobile after nav
                  className={clsx(
                    'nav-item',
                    isActive ? 'nav-item-active' : 'nav-item-inactive',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={logout}
          className={clsx(
            'nav-item nav-item-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-900/20',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <FiLogOut className="text-lg flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 bg-dark-bg border-r border-dark-border',
          'transition-all duration-300 ease-in-out flex flex-col',
          // Desktop: always visible, width changes on collapse
          'hidden lg:flex',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
        )}
      >
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-20 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs shadow-md"
          >
            <FiChevronLeft className="rotate-180" />
          </button>
        )}
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 bg-dark-bg border-r border-dark-border w-64',
          'transition-transform duration-300 ease-in-out flex flex-col lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <FiX className="text-xl" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
