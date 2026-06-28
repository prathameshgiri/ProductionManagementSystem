/**
 * Breadcrumb.jsx - Dynamic breadcrumb navigation
 */
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const routeLabels = {
  dashboard: 'Dashboard',
  products: 'Products',
  'production-planning': 'Production Planning',
  'production-orders': 'Production Orders',
  inventory: 'Inventory',
  'raw-materials': 'Raw Materials',
  machines: 'Machines',
  employees: 'Employees',
  'quality-control': 'Quality Control',
  suppliers: 'Suppliers',
  purchases: 'Purchase Orders',
  warehouse: 'Warehouse',
  reports: 'Reports',
  notifications: 'Notifications',
  'activity-logs': 'Activity Logs',
  settings: 'Settings',
  profile: 'My Profile',
  new: 'New',
  edit: 'Edit',
};

const Breadcrumb = () => {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length <= 1) return null;

  const crumbs = parts.map((part, index) => {
    const path = '/' + parts.slice(0, index + 1).join('/');
    const label = routeLabels[part] || part.charAt(0).toUpperCase() + part.slice(1);
    const isLast = index === parts.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4" aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-primary-500 transition-colors flex items-center">
        <FiHome className="text-base" />
      </Link>
      {crumbs.map(crumb => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <FiChevronRight className="text-gray-400 text-sm" />
          {crumb.isLast ? (
            <span className="text-gray-700 dark:text-gray-300 font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-primary-500 transition-colors">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
