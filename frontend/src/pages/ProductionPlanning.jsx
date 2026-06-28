/**
 * ProductionPlanning.jsx - Kanban-style production planning board
 */
import { useState, useEffect, useCallback } from 'react';
import { productionService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiLayers } from 'react-icons/fi';

const COLUMNS = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-500', light: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { id: 'completed', label: 'Completed', color: 'bg-green-500', light: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500', light: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
];

const ProductionPlanning = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState('all');
  const [dragging, setDragging] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productionService.getAll({ limit: 100, planType: planType !== 'all' ? planType : '' });
      setOrders(res.data.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [planType]);

  useEffect(() => { fetch(); }, [fetch]);

  const byStatus = (status) => orders.filter(o => o.status === status);

  const handleDrop = async (status, orderId) => {
    if (!orderId) return;
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === status) return;
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    try {
      await productionService.update(orderId, { status });
      toast.success(`Moved to ${status.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update status');
      fetch(); // revert
    }
    setDragging(null);
  };

  const progressPct = (o) => Math.min(100, Math.round(((o.produced || 0) / o.quantity) * 100));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Production Planning</h1><p className="text-sm text-gray-500 dark:text-gray-400">Drag cards between columns to update status</p></div>
        <div className="flex gap-2 items-center">
          <select value={planType} onChange={e => setPlanType(e.target.value)} className="form-select w-36">
            <option value="all">All Plans</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex-1 min-w-[220px]">
              <div className={`h-8 rounded-lg skeleton mb-3`} />
              {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl skeleton mb-3" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className="min-w-[220px] flex flex-col"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(col.id, e.dataTransfer.getData('orderId'))}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</h3>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{byStatus(col.id).length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 flex-1 min-h-[200px] p-2 rounded-xl bg-gray-100/50 dark:bg-dark-bg/50">
                {byStatus(col.id).length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-gray-400 dark:text-gray-600">Drop orders here</div>
                )}
                {byStatus(col.id).map(order => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData('orderId', order.id); setDragging(order.id); }}
                    onDragEnd={() => setDragging(null)}
                    className={`card p-3 cursor-grab active:cursor-grabbing transition-all ${dragging === order.id ? 'opacity-50 scale-95' : 'hover:shadow-md'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-gray-400">{order.orderId}</span>
                      <Badge variant={order.priority}>{order.priority}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 leading-tight">{order.productName}</p>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Qty: <strong className="text-gray-700 dark:text-gray-300">{order.quantity}</strong></span>
                      <Badge variant="blue">{order.planType}</Badge>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-dark-border rounded-full">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPct(order)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{order.produced || 0} produced</span>
                      <span>{progressPct(order)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductionPlanning;
