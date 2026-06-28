/**
 * Badge.jsx - Status badge component
 */
import { clsx } from 'clsx';

const variantMap = {
  // Statuses
  active: 'badge-green',
  inactive: 'badge-gray',
  on_leave: 'badge-yellow',
  // Production status
  pending: 'badge-yellow',
  in_progress: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
  // Machine status
  running: 'badge-green',
  idle: 'badge-gray',
  maintenance: 'badge-yellow',
  breakdown: 'badge-red',
  // Quality status
  passed: 'badge-green',
  failed: 'badge-red',
  rework: 'badge-yellow',
  // Priority
  low: 'badge-gray',
  medium: 'badge-blue',
  high: 'badge-yellow',
  urgent: 'badge-red',
  // Stock
  in_stock: 'badge-green',
  low_stock: 'badge-yellow',
  out_of_stock: 'badge-red',
  // Purchase
  requested: 'badge-gray',
  approved: 'badge-blue',
  ordered: 'badge-purple',
  received: 'badge-green',
  // Severity
  critical: 'badge-red',
  // Notifications
  info: 'badge-blue',
  warning: 'badge-yellow',
  // Generic
  success: 'badge-green',
  error: 'badge-red',
};

const Badge = ({ children, variant, className = '' }) => {
  const variantClass = variantMap[variant] || variantMap[children?.toLowerCase()] || 'badge-gray';

  return (
    <span className={clsx(variantClass, className)}>
      {children}
    </span>
  );
};

export default Badge;
