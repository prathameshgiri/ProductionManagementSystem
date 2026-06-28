/**
 * StatCard.jsx - Dashboard KPI card
 */
import { clsx } from 'clsx';

const colorMap = {
  indigo:  { bg: 'bg-indigo-100 dark:bg-indigo-900/30',  icon: 'text-indigo-600 dark:text-indigo-400',  border: 'border-l-indigo-500' },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/30',      icon: 'text-blue-600 dark:text-blue-400',      border: 'border-l-blue-500' },
  green:   { bg: 'bg-green-100 dark:bg-green-900/30',    icon: 'text-green-600 dark:text-green-400',    border: 'border-l-green-500' },
  yellow:  { bg: 'bg-yellow-100 dark:bg-yellow-900/30',  icon: 'text-yellow-600 dark:text-yellow-400',  border: 'border-l-yellow-500' },
  red:     { bg: 'bg-red-100 dark:bg-red-900/30',        icon: 'text-red-600 dark:text-red-400',        border: 'border-l-red-500' },
  purple:  { bg: 'bg-purple-100 dark:bg-purple-900/30',  icon: 'text-purple-600 dark:text-purple-400',  border: 'border-l-purple-500' },
  orange:  { bg: 'bg-orange-100 dark:bg-orange-900/30',  icon: 'text-orange-600 dark:text-orange-400',  border: 'border-l-orange-500' },
  pink:    { bg: 'bg-pink-100 dark:bg-pink-900/30',      icon: 'text-pink-600 dark:text-pink-400',      border: 'border-l-pink-500' },
  teal:    { bg: 'bg-teal-100 dark:bg-teal-900/30',      icon: 'text-teal-600 dark:text-teal-400',      border: 'border-l-teal-500' },
  cyan:    { bg: 'bg-cyan-100 dark:bg-cyan-900/30',      icon: 'text-cyan-600 dark:text-cyan-400',      border: 'border-l-cyan-500' },
};

const StatCard = ({
  title,
  value,
  icon,
  color = 'indigo',
  trend,        // { value: '+12%', positive: true }
  subtitle,
  onClick,
  prefix = '',
  suffix = '',
}) => {
  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={clsx(
        'stat-card cursor-default border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        colors.border,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="stat-label truncate">{title}</p>
          <p className="stat-value mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={clsx('text-xs font-medium mt-1', trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ml-3', colors.bg)}>
            <span className={colors.icon}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
