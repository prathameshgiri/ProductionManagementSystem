/**
 * Purchases.jsx - Purchase Orders with Approval Workflow
 */
import { useState, useEffect, useCallback } from 'react';
import { purchaseService, supplierService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiShoppingCart, FiRefreshCw, FiCheck, FiPackage } from 'react-icons/fi';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ supplierId: '', supplierName: '', expectedDelivery: '', notes: '', items: [{ itemName: '', quantity: 1, unitCost: 0 }] });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseService.getAll({ search, status: statusF, page, limit: 10 });
      setPurchases(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load purchases'); }
    finally { setLoading(false); }
  }, [search, statusF, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { supplierService.getAll({ limit: 100 }).then(r => setSuppliers(r.data.data || [])).catch(() => {}); }, []);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { itemName: '', quantity: 1, unitCost: 0 }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setForm(p => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item) }));

  const totalAmount = form.items.reduce((sum, i) => sum + (parseFloat(i.quantity) * parseFloat(i.unitCost) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId) { toast.error('Select a supplier'); return; }
    const sup = suppliers.find(s => s.id === form.supplierId);
    setFormLoading(true);
    try {
      await purchaseService.create({ ...form, supplierName: sup?.name || '', items: form.items.map(i => ({ ...i, quantity: parseInt(i.quantity), unitCost: parseFloat(i.unitCost) })) });
      toast.success('Purchase order created!');
      setModalOpen(false);
      setForm({ supplierId: '', supplierName: '', expectedDelivery: '', notes: '', items: [{ itemName: '', quantity: 1, unitCost: 0 }] });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create PO'); }
    finally { setFormLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await purchaseService.approve(id); toast.success('Purchase order approved!'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
  };

  const handleReceive = async (id) => {
    try { await purchaseService.receive(id); toast.success('Goods received! GRN created.'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to receive'); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await purchaseService.delete(deleteId); toast.success('Purchase deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Purchase Orders</h1><p className="text-sm text-gray-500 dark:text-gray-400">Request → Approve → Receive workflow</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={() => setModalOpen(true)}>New PO</Button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search purchase orders..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select w-full sm:w-40">
            <option value="">All Status</option>
            {['requested','approved','ordered','received'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={7} cols={6} /> : purchases.length === 0 ? (
          <EmptyState title="No purchase orders" icon={<FiShoppingCart />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={() => setModalOpen(true)}>Create PO</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Total Amount</th><th>Expected</th><th>GRN Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {purchases.map(po => (
                    <tr key={po.id}>
                      <td className="font-mono text-xs text-gray-500">{po.purchaseId}</td>
                      <td className="font-medium">{po.supplierName}</td>
                      <td className="text-gray-500">{po.items?.length || 0} items</td>
                      <td className="font-bold text-green-700 dark:text-green-400">₹{parseFloat(po.totalAmount || 0).toFixed(2)}</td>
                      <td className="text-xs text-gray-500">{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : '–'}</td>
                      <td className="text-xs text-gray-500">{po.grnDate ? new Date(po.grnDate).toLocaleDateString() : '–'}</td>
                      <td><Badge variant={po.status}>{po.status}</Badge></td>
                      <td>
                        <div className="flex gap-1">
                          {po.status === 'requested' && <button onClick={() => handleApprove(po.id)} className="btn btn-success btn-sm py-1 px-2 text-xs gap-1"><FiCheck />Approve</button>}
                          {po.status === 'approved' && <button onClick={() => handleReceive(po.id)} className="btn btn-primary btn-sm py-1 px-2 text-xs gap-1"><FiPackage />Receive</button>}
                          <button onClick={() => setDeleteId(po.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{pagination.total} purchase orders</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order" size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>Create PO</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Supplier <span className="text-red-500">*</span></label>
              <select value={form.supplierId} onChange={e => setForm(p=>({...p,supplierId:e.target.value}))} className="form-select" required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Input label="Expected Delivery" type="date" value={form.expectedDelivery} onChange={e => setForm(p=>({...p,expectedDelivery:e.target.value}))} />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Items</label>
              <Button variant="ghost" size="sm" icon={<FiPlus />} onClick={addItem} type="button">Add Item</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <input placeholder="Item name" value={item.itemName} onChange={e => updateItem(i, 'itemName', e.target.value)} className="form-input flex-1" />
                  <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="form-input w-20" />
                  <input type="number" placeholder="Unit Cost" step="0.01" value={item.unitCost} onChange={e => updateItem(i, 'unitCost', e.target.value)} className="form-input w-28" />
                  <span className="text-sm font-medium text-gray-500 w-20 text-right">₹{(item.quantity * item.unitCost || 0).toFixed(2)}</span>
                  {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 px-1 text-lg">×</button>}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Total: ₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div><label className="form-label">Notes</label><textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} rows={2} className="form-input resize-none" /></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Purchase Order?" message="This purchase order will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default Purchases;
