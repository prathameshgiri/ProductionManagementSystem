/**
 * Notifications.jsx - Notifications Center
 */
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiBell, FiRefreshCw, FiCheck, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { clsx } from 'clsx';

const severityColors = {
  critical: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
  warning: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10',
  info: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isReadFilter, setIsReadFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ isRead: isReadFilter, page, limit: 20 });
      setNotifications(res.data.data);
      setPagination(res.data.pagination || {});
      setUnreadCount(res.data.unreadCount || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [isReadFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id) => {
    try { await notificationService.markAsRead(id); fetch(); }
    catch { toast.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    try { await notificationService.markAllAsRead(); toast.success('All notifications marked as read'); fetch(); }
    catch { toast.error('Failed to mark all as read'); }
  };

  const del = async (id) => {
    try { await notificationService.delete(id); fetch(); toast.success('Notification removed'); }
    catch { toast.error('Failed to delete'); }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <Breadcrumb />
          <h1 className="page-title flex items-center gap-2">
            Notifications
            {unreadCount > 0 && <span className="text-base font-normal px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">{unreadCount} unread</span>}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          {unreadCount > 0 && <Button variant="success" size="sm" icon={<FiCheckCircle />} onClick={markAllRead}>Mark All Read</Button>}
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          {['', 'false', 'true'].map((val, i) => (
            <button key={i} onClick={() => { setIsReadFilter(val); setPage(1); }}
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', isReadFilter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-hover')}>
              {val === '' ? 'All' : val === 'false' ? 'Unread' : 'Read'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="card"><TableSkeleton rows={5} cols={1} /></div>
        ) : notifications.length === 0 ? (
          <div className="card"><EmptyState title="No notifications" icon={<FiBell />} description="You're all caught up!" /></div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={clsx('card border-l-4 p-4 transition-all', severityColors[n.severity] || severityColors.info, !n.isRead && 'ring-1 ring-primary-200 dark:ring-primary-800')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={clsx('text-sm font-semibold', n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100')}>{n.title}</h3>
                    <Badge variant={n.severity}>{n.severity}</Badge>
                    {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!n.isRead && <button onClick={() => markRead(n.id)} className="btn-icon btn-ghost text-green-600 dark:text-green-400 text-sm" title="Mark as read"><FiCheck /></button>}
                  <button onClick={() => del(n.id)} className="btn-icon btn-ghost text-red-500 dark:text-red-400 text-sm" title="Delete"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">← Prev</button>
          <span className="btn btn-secondary btn-sm cursor-default">{pagination.page} / {pagination.totalPages}</span>
          <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
