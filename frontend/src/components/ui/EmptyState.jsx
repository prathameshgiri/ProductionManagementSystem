/**
 * EmptyState.jsx - No data placeholder
 */
const EmptyState = ({ title = 'No data found', description, icon, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && (
      <div className="text-5xl text-gray-300 dark:text-gray-600 mb-4">{icon}</div>
    )}
    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-4">{description}</p>}
    {action && action}
  </div>
);

export default EmptyState;
