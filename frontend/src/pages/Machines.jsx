/**
 * Machines.jsx - Machine Management Page
 */
import { useState, useEffect, useCallback } from 'react';
import { machineService } from '../services';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiTool, FiRefreshCw } from 'react-icons/fi';

const initialForm = { name: '', type: '', location: '', manufacturer: '', model: '', serialNumber: '', capacity: '', status: 'idle', purchaseDate: '', nextMaintenanceDate: '' };

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [machRes, statsRes] = await Promise.all([
        machineService.getAll({ search, status: statusF, page, limit: 10 }),
        machineService.getUtilization(),
      ]);
      setMachines(machRes.data.data);
      setPagination(machRes.data.pagination || {});
      setStats(statsRes.data.data);
    } catch { toast.error('Failed to load machines'); }
    finally { setLoading(false); }
  }, [search, statusF, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (m) => { setEditItem(m); setForm({ name: m.name, type: m.type, location: m.location || '', manufacturer: m.manufacturer || '', model: m.model || '', serialNumber: m.serialNumber || '', capacity: m.capacity, status: m.status, purchaseDate: m.purchaseDate?.split('T')[0] || '', nextMaintenanceDate: m.nextMaintenanceDate?.split('T')[0] || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type) { toast.error('Name and type required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await machineService.update(editItem.id, form); toast.success('Machine updated!'); }
      else { await machineService.create(form); toast.success('Machine created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save machine'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await machineService.delete(deleteId); toast.success('Machine deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const quickStatusUpdate = async (id, status) => {
    try { await machineService.update(id, { status }); toast.success(`Status → ${status}`); fetch(); }
    catch { toast.error('Failed to update'); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Machines</h1><p className="text-sm text-gray-500 dark:text-gray-400">Monitor machine status, utilization and maintenance</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Machine</Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard title="Running" value={stats.running} color="green" icon={<FiTool />} subtitle="Active machines" />
          <StatCard title="Idle" value={stats.idle} color="gray" icon={<FiTool />} />
          <StatCard title="Maintenance" value={stats.maintenance} color="yellow" icon={<FiTool />} />
          <StatCard title="Breakdown" value={stats.breakdown} color="red" icon={<FiTool />} />
        </div>
      )}

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search machines..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select w-full sm:w-44">
            <option value="">All Status</option>
            {['running','idle','maintenance','breakdown'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={6} cols={7} /> : machines.length === 0 ? (
          <EmptyState title="No machines found" icon={<FiTool />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Machine</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Machine</th><th>Type</th><th>Location</th><th>Status</th><th>Utilization</th><th>OEE</th><th>Maintenance</th><th>Actions</th></tr></thead>
                <tbody>
                  {machines.map(m => (
                    <tr key={m.id}>
                      <td className="font-mono text-xs text-gray-500">{m.machineId}</td>
                      <td>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.manufacturer} {m.model}</div>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400">{m.type}</td>
                      <td className="text-gray-500 text-sm">{m.location || '–'}</td>
                      <td>
                        <select value={m.status} onChange={e => quickStatusUpdate(m.id, e.target.value)} className="text-xs border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-card cursor-pointer">
                          {['running','idle','maintenance','breakdown'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full"><div className={`h-full rounded-full ${m.utilization >= 80 ? 'bg-green-500' : m.utilization >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${m.utilization || 0}%` }} /></div>
                          <span className="text-xs font-medium">{m.utilization || 0}%</span>
                        </div>
                      </td>
                      <td><span className="font-semibold text-purple-600 dark:text-purple-400">{m.oee || 0}%</span></td>
                      <td className="text-xs text-gray-500">{m.nextMaintenanceDate ? new Date(m.nextMaintenanceDate).toLocaleDateString() : '–'}</td>
                      <td>
                        <div className="flex gap-1">
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
                <span className="text-gray-500">{pagination.total} machines total</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Machine' : 'Add Machine'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Machine Name" name="name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required placeholder="e.g. CNC Lathe #1" />
            <Input label="Type" name="type" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} required placeholder="e.g. CNC Lathe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" name="location" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} placeholder="e.g. Bay A" />
            <Input label="Capacity" name="capacity" type="number" value={form.capacity} onChange={e => setForm(p=>({...p,capacity:e.target.value}))} placeholder="units/hour" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Manufacturer" value={form.manufacturer} onChange={e => setForm(p=>({...p,manufacturer:e.target.value}))} />
            <Input label="Model" value={form.model} onChange={e => setForm(p=>({...p,model:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm(p=>({...p,purchaseDate:e.target.value}))} />
            <Input label="Next Maintenance" type="date" value={form.nextMaintenanceDate} onChange={e => setForm(p=>({...p,nextMaintenanceDate:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="form-select">
              {['running','idle','maintenance','breakdown'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Machine?" message="This machine record will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default Machines;
