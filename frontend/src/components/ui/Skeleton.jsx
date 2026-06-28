/**
 * Skeleton.jsx - Loading skeleton placeholders
 */
import { clsx } from 'clsx';

// Single skeleton line
export const Skeleton = ({ className = '', width, height = 'h-4' }) => (
  <div className={clsx('skeleton', height, width || 'w-full', className)} />
);

// Skeleton for stat cards row
export const StatCardSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <Skeleton width="w-10" height="h-10" className="rounded-xl" />
      <Skeleton width="w-16" height="h-4" />
    </div>
    <Skeleton height="h-8" width="w-24" className="mb-1" />
    <Skeleton height="h-3" width="w-32" />
  </div>
);

// Skeleton for table rows
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="table-container">
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}><Skeleton width="w-20" height="h-3" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, ri) => (
          <tr key={ri}>
            {Array.from({ length: cols }).map((_, ci) => (
              <td key={ci}><Skeleton height="h-4" /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton for chart
export const ChartSkeleton = () => (
  <div className="card p-5 animate-pulse">
    <Skeleton width="w-40" height="h-5" className="mb-4" />
    <Skeleton height="h-64" className="rounded-lg" />
  </div>
);

export default Skeleton;
