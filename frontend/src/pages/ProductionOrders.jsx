/**
 * ProductionOrders.jsx - Production Orders Page (Daily/Weekly/Monthly Plans)
 */
import { useState, useEffect, useCallback } from 'react';
import { productionService, productService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiZap, FiRefreshCw } from 'react-icons/fi';

const initialForm = { productId: '', productName: '', planType: 'daily', quantity: '', startDate: '', endDate: '', priority: 'medium', assignedTo: '', notes: '' };

const ProductionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [priorityF, setPriorityF] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productionService.getAll({ search, status: statusF, priority: priorityF, page, limit: 10 });
      setOrders(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [search, statusF, priorityF, page]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    productService.getAll({ limit: 100 }).then(r => setProducts(r.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (o) => { setEditItem(o); setForm({ productId: o.productId, productName: o.productName, planType: o.planType, quantity: o.quantity, startDate: o.startDate?.split('T')[0], endDate: o.endDate?.split('T')[0], priority: o.priority, assignedTo: o.assignedTo || '', notes: o.notes || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantity) { toast.error('Product and quantity required'); return; }
    setFormLoading(true);
    try {
      const selectedProduct = products.find(p => p.id === form.productId);
      const payload = { ...form, productName: selectedProduct?.name || form.productName };
      if (editItem) { await productionService.update(editItem.id, payload); toast.success('Order updated!'); }
      else { await productionService.create(payload); toast.success('Order created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save order'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await productionService.delete(deleteId); toast.success('Order deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const statusUpdate = async (id, status) => {
    try { await productionService.update(id, { status }); toast.success(`Status → ${status}`); fetch(); }
    catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Production Orders</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage daily, weekly & monthly production plans</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>New Order</Button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search orders..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select w-full sm:w-40">
            <option value="">All Status</option>
            {['pending','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <select value={priorityF} onChange={e => { setPriorityF(e.target.value); setPage(1); }} className="form-select w-full sm:w-36">
            <option value="">All Priority</option>
            {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={8} cols={7} /> : orders.length === 0 ? (
          <EmptyState title="No production orders" icon={<FiZap />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>New Order</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Product</th><th>Plan</th><th>Qty/Produced</th><th>Priority</th><th>Status</th><th>Date Range</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs text-gray-500">{o.orderId}</td>
                      <td className="font-medium text-gray-900 dark:text-gray-100 max-w-[140px] truncate">{o.productName}</td>
                      <td><Badge variant="blue">{o.planType}</Badge></td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">{o.quantity} / <span className="text-green-600 dark:text-green-400">{o.produced || 0}</span></span>
                          <div className="h-1.5 bg-gray-100 dark:bg-dark-border rounded-full w-20"><div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, ((o.produced || 0) / o.quantity) * 100)}%` }} /></div>
                        </div>
                      </td>
                      <td><Badge variant={o.priority}>{o.priority}</Badge></td>
                      <td>
                        <select value={o.status} onChange={e => statusUpdate(o.id, e.target.value)} className="text-xs border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 cursor-pointer">
                          {['pending','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                        </select>
                      </td>
                      <td className="text-xs text-gray-500">{o.startDate?.split('T')[0]} → {o.endDate?.split('T')[0]}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(o)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm"><FiEdit2 /></button>
                          <button onClick={() => setDeleteId(o.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{((pagination.page-1)*pagination.limit)+1}–{Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total}</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Order' : 'New Production Order'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Product <span className="text-red-500">*</span></label>
            <select value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} className="form-select" required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Plan Type</label>
              <select value={form.planType} onChange={e => setForm(p => ({ ...p, planType: e.target.value }))} className="form-select">
                {['daily','weekly','monthly'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="form-select">
                {['low','medium','high','urgent'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <Input label="Quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
            <Input label="End Date" name="endDate" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required />
          </div>
          <div><label className="form-label">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="form-input resize-none" /></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Order?" message="This production order will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default ProductionOrders;
