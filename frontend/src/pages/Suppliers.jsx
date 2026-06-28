/**
 * Suppliers.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiTruck, FiRefreshCw, FiStar } from 'react-icons/fi';

const initialForm = { name: '', phone: '', email: '', address: '', contactPerson: '', category: 'General', rating: '4', status: 'active' };

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const res = await supplierService.getAll({ search, page, limit: 10 });
      setSuppliers(res.data.data);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, phone: s.phone, email: s.email || '', address: s.address || '', contactPerson: s.contactPerson || '', category: s.category, rating: s.rating, status: s.status }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await supplierService.update(editItem.id, form); toast.success('Supplier updated!'); }
      else { await supplierService.create(form); toast.success('Supplier created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await supplierService.delete(deleteId); toast.success('Supplier deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} className={`text-xs ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} style={i < rating ? { fill: 'currentColor' } : {}} />
    ));
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Suppliers</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage supplier relationships and contact information</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Supplier</Button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search suppliers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={7} cols={6} /> : suppliers.length === 0 ? (
          <EmptyState title="No suppliers found" icon={<FiTruck />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Supplier</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Supplier</th><th>Category</th><th>Contact</th><th>Rating</th><th>Orders</th><th>On-Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {suppliers.map(s => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs text-gray-500">{s.supplierId}</td>
                      <td>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.phone}</div>
                      </td>
                      <td><Badge variant="blue">{s.category}</Badge></td>
                      <td>
                        <div className="text-xs">
                          <div>{s.contactPerson || '–'}</div>
                          <div className="text-gray-400">{s.email || '–'}</div>
                        </div>
                      </td>
                      <td><div className="flex gap-0.5">{renderStars(s.rating)}</div></td>
                      <td className="font-semibold">{s.totalOrders}</td>
                      <td><span className="text-green-600 dark:text-green-400 font-semibold">{s.onTimeDelivery}%</span></td>
                      <td><Badge variant={s.status}>{s.status}</Badge></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(s)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm"><FiEdit2 /></button>
                          <button onClick={() => setDeleteId(s.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{pagination.total} suppliers</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add Supplier'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Supplier Name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
            <Input label="Contact Person" value={form.contactPerson} onChange={e => setForm(p=>({...p,contactPerson:e.target.value}))} />
          </div>
          <Input label="Address" value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Metal, Rubber" />
            <div><label className="form-label">Rating (1-5)</label>
              <select value={form.rating} onChange={e => setForm(p=>({...p,rating:e.target.value}))} className="form-select">
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Supplier?" message="This supplier will be permanently removed." loading={deleteLoading} />
    </div>
  );
};

export default Suppliers;
