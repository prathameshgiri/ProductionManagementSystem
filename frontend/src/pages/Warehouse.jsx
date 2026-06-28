/**
 * Warehouse.jsx - Warehouse Management
 */
import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBarChart2, FiRefreshCw } from 'react-icons/fi';

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', managerName: '', capacity: '', type: 'raw_materials' });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getAll({ search, page, limit: 10 });
      setWarehouses(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load warehouses'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditItem(null); setForm({ name: '', location: '', managerName: '', capacity: '', type: 'raw_materials' }); setModalOpen(true); };
  const openEdit = (w) => { setEditItem(w); setForm({ name: w.name, location: w.location, managerName: w.managerName || '', capacity: w.capacity, type: w.type }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) { toast.error('Name and location required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await warehouseService.update(editItem.id, form); toast.success('Warehouse updated!'); }
      else { await warehouseService.create(form); toast.success('Warehouse created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await warehouseService.delete(deleteId); toast.success('Warehouse deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Warehouse</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage warehouse locations and capacity</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Warehouse</Button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search warehouses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={5} cols={6} /> : warehouses.length === 0 ? (
          <EmptyState title="No warehouses" icon={<FiBarChart2 />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Warehouse</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Warehouse</th><th>Location</th><th>Type</th><th>Manager</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {warehouses.map(w => {
                    const usePct = Math.round((w.usedCapacity / w.capacity) * 100);
                    return (
                      <tr key={w.id}>
                        <td className="font-mono text-xs text-gray-500">{w.warehouseId}</td>
                        <td className="font-medium">{w.name}</td>
                        <td className="text-gray-500">{w.location}</td>
                        <td><Badge variant="blue">{w.type?.replace('_',' ')}</Badge></td>
                        <td className="text-gray-500">{w.managerName || '–'}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full"><div className={`h-full rounded-full ${usePct >= 90 ? 'bg-red-500' : usePct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${usePct}%` }} /></div>
                            <span className="text-xs text-gray-500">{w.usedCapacity}/{w.capacity}</span>
                          </div>
                        </td>
                        <td><Badge variant={w.status}>{w.status}</Badge></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(w)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm"><FiEdit2 /></button>
                            <button onClick={() => setDeleteId(w.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Warehouse' : 'Add Warehouse'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Warehouse Name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
          <Input label="Location" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} required placeholder="e.g. Building A, North Wing" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Manager Name" value={form.managerName} onChange={e => setForm(p=>({...p,managerName:e.target.value}))} />
            <Input label="Total Capacity" type="number" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:e.target.value}))} placeholder="units" />
          </div>
          <div><label className="form-label">Type</label>
            <select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} className="form-select">
              {['raw_materials','finished_goods','spare_parts','general'].map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
            </select>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Warehouse?" message="This warehouse record will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default Warehouse;
