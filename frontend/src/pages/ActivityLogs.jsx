/**
 * ActivityLogs.jsx - Admin Activity Audit Trail
 */
import { useState, useEffect, useCallback } from 'react';
import { activityLogService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiActivity, FiRefreshCw, FiSearch } from 'react-icons/fi';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityLogService.getAll({ search, page, limit: 20 });
      setLogs(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const methodColor = (method) => {
    const colors = { POST: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', PUT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', PATCH: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    return colors[method] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Activity Logs</h1><p className="text-sm text-gray-500 dark:text-gray-400">Audit trail of all write operations (Admin only)</p></div>
        <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search by user, action, resource..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={10} cols={6} /> : logs.length === 0 ? (
          <EmptyState title="No activity logs yet" icon={<FiActivity />} description="Logs are created automatically when users perform write operations" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Method</th><th>Resource</th><th>Status</th></tr></thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id || i}>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{log.userName}</div>
                        <div className="text-xs text-gray-400">{log.ip}</div>
                      </td>
                      <td><Badge variant="blue">{log.userRole?.replace('_',' ')}</Badge></td>
                      <td className="text-sm font-medium text-gray-700 dark:text-gray-300">{log.action}</td>
                      <td><span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${methodColor(log.method)}`}>{log.method}</span></td>
                      <td className="text-sm text-gray-600 dark:text-gray-400">{log.resource}</td>
                      <td><span className={`text-xs font-mono ${log.statusCode < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{log.statusCode}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{pagination.total} logs total</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
