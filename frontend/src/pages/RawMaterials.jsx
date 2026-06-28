/**
 * RawMaterials.jsx - Raw Material Management with usage logging
 */
import { useState, useEffect, useCallback } from 'react';
import { rawMaterialService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiArchive, FiRefreshCw, FiActivity } from 'react-icons/fi';

const initialForm = { name: '', quantity: '', unit: 'kg', unitCost: '', reorderLevel: '', supplierName: '' };

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [usageModal, setUsageModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [usageForm, setUsageForm] = useState({ used: '', note: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rawMaterialService.getAll({ search, status: statusF, page, limit: 10 });
      setMaterials(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load materials'); }
    finally { setLoading(false); }
  }, [search, statusF, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (m) => { setEditItem(m); setForm({ name: m.name, quantity: m.quantity, unit: m.unit, unitCost: m.unitCost, reorderLevel: m.reorderLevel, supplierName: m.supplierName || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await rawMaterialService.update(editItem.id, form); toast.success('Material updated!'); }
      else { await rawMaterialService.create(form); toast.success('Material created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleUsage = async () => {
    if (!usageForm.used || parseInt(usageForm.used) <= 0) { toast.error('Enter valid quantity'); return; }
    setFormLoading(true);
    try {
      await rawMaterialService.logUsage(usageModal.id, usageForm);
      toast.success('Usage logged!');
      setUsageModal(null); setUsageForm({ used: '', note: '' }); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to log usage'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await rawMaterialService.delete(deleteId); toast.success('Material deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Raw Materials</h1><p className="text-sm text-gray-500 dark:text-gray-400">Track raw material stock and consumption</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Material</Button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search materials..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select w-full sm:w-44">
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={7} cols={7} /> : materials.length === 0 ? (
          <EmptyState title="No raw materials" icon={<FiArchive />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Material</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Material</th><th>Quantity</th><th>Unit Cost</th><th>Reorder At</th><th>Supplier</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td className="font-mono text-xs text-gray-500">{m.materialId}</td>
                      <td className="font-medium">{m.name}</td>
                      <td className="font-bold text-gray-800 dark:text-gray-200">{m.quantity} {m.unit}</td>
                      <td>₹{parseFloat(m.unitCost || 0).toFixed(2)}</td>
                      <td className="text-gray-500">{m.reorderLevel} {m.unit}</td>
                      <td className="text-gray-500 text-sm">{m.supplierName || '–'}</td>
                      <td><Badge variant={m.status}>{m.status?.replace('_',' ')}</Badge></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setUsageModal(m)} className="btn-icon btn-ghost text-purple-600 dark:text-purple-400 text-sm" title="Log Usage"><FiActivity /></button>
                          <button onClick={() => openEdit(m)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm"><FiEdit2 /></button>
                          <button onClick={() => setDeleteId(m.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{pagination.total} materials</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Material' : 'Add Raw Material'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Material Name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={e => setForm(p=>({...p,quantity:e.target.value}))} />
            <div><label className="form-label">Unit</label>
              <select value={form.unit} onChange={e => setForm(p=>({...p,unit:e.target.value}))} className="form-select">
                {['kg','liters','meters','pieces','tons','sheets','rolls'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit Cost (₹)" type="number" step="0.01" value={form.unitCost} onChange={e => setForm(p=>({...p,unitCost:e.target.value}))} />
            <Input label="Reorder Level" type="number" value={form.reorderLevel} onChange={e => setForm(p=>({...p,reorderLevel:e.target.value}))} />
          </div>
          <Input label="Supplier Name" value={form.supplierName} onChange={e => setForm(p=>({...p,supplierName:e.target.value}))} />
        </form>
      </Modal>

      {/* Usage Modal */}
      <Modal isOpen={!!usageModal} onClose={() => setUsageModal(null)} title={`Log Usage: ${usageModal?.name}`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setUsageModal(null)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleUsage}>Log Usage</Button></>}
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl text-sm">
            <p className="text-gray-500 mb-1">Available:</p>
            <p className="text-xl font-bold">{usageModal?.quantity} {usageModal?.unit}</p>
          </div>
          <Input label="Quantity Used" type="number" min="1" value={usageForm.used} onChange={e => setUsageForm(p=>({...p,used:e.target.value}))} placeholder="Enter amount consumed" />
          <div><label className="form-label">Note (optional)</label><input value={usageForm.note} onChange={e => setUsageForm(p=>({...p,note:e.target.value}))} className="form-input" placeholder="e.g. Used for Order ORD-001" /></div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Material?" message="This raw material will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default RawMaterials;
