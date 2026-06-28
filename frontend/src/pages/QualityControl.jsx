/**
 * QualityControl.jsx - Quality Inspection Page
 */
import { useState, useEffect, useCallback } from 'react';
import { qualityService } from '../services';
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
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiClipboard, FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const initialForm = { productName: '', batchNumber: '', inspectedQuantity: '', passedQuantity: '', failedQuantity: '', defectType: 'None', severity: 'low', status: 'passed', inspectorName: '', notes: '' };

const QualityControl = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [severityF, setSeverityF] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        qualityService.getAll({ search, status: statusF, severity: severityF, page, limit: 10 }),
        qualityService.getStats(),
      ]);
      setInspections(res.data.data);
      setPagination(res.data.pagination || {});
      setStats(statsRes.data.data);
    } catch { toast.error('Failed to load inspections'); }
    finally { setLoading(false); }
  }, [search, statusF, severityF, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (i) => { setEditItem(i); setForm({ productName: i.productName, batchNumber: i.batchNumber || '', inspectedQuantity: i.inspectedQuantity, passedQuantity: i.passedQuantity, failedQuantity: i.failedQuantity, defectType: i.defectType, severity: i.severity, status: i.status, inspectorName: i.inspectorName, notes: i.notes || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.inspectedQuantity) { toast.error('Product name and quantity required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await qualityService.update(editItem.id, form); toast.success('Inspection updated!'); }
      else { await qualityService.create(form); toast.success('Inspection recorded!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await qualityService.delete(deleteId); toast.success('Inspection deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Quality Control</h1><p className="text-sm text-gray-500 dark:text-gray-400">Track product inspections, defects and quality metrics</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>New Inspection</Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard title="Pass Rate" value={`${stats.passRate}%`} color="green" icon={<FiCheckCircle />} subtitle={`${stats.totalPassed} passed`} />
          <StatCard title="Defect Rate" value={`${stats.defectRate}%`} color="red" icon={<FiXCircle />} subtitle={`${stats.totalFailed} failed`} />
          <StatCard title="Total Inspected" value={stats.totalInspected} color="blue" icon={<FiClipboard />} />
          <StatCard title="Total Inspections" value={stats.totalInspections} color="indigo" icon={<FiClipboard />} />
        </div>
      )}

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search inspections..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className="form-select w-full sm:w-36">
            <option value="">All Status</option>
            {['passed','failed','rework'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={severityF} onChange={e => { setSeverityF(e.target.value); setPage(1); }} className="form-select w-full sm:w-36">
            <option value="">All Severity</option>
            {['low','medium','high','critical'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={7} cols={7} /> : inspections.length === 0 ? (
          <EmptyState title="No inspections found" icon={<FiClipboard />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>New Inspection</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Product</th><th>Batch</th><th>Inspected</th><th>Passed/Failed</th><th>Defect</th><th>Severity</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {inspections.map(i => (
                    <tr key={i.id}>
                      <td className="font-mono text-xs text-gray-500">{i.inspectionId}</td>
                      <td className="font-medium max-w-[120px] truncate">{i.productName}</td>
                      <td className="text-gray-500 text-xs">{i.batchNumber || '–'}</td>
                      <td className="font-semibold">{i.inspectedQuantity}</td>
                      <td>
                        <span className="text-green-600 dark:text-green-400 font-semibold">{i.passedQuantity}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">{i.failedQuantity}</span>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400 text-xs">{i.defectType}</td>
                      <td><Badge variant={i.severity}>{i.severity}</Badge></td>
                      <td><Badge variant={i.status}>{i.status}</Badge></td>
                      <td className="text-xs text-gray-500">{new Date(i.inspectedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(i)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm"><FiEdit2 /></button>
                          <button onClick={() => setDeleteId(i.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{pagination.total} inspections</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Inspection' : 'New Inspection'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Record'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name" value={form.productName} onChange={e => setForm(p=>({...p,productName:e.target.value}))} required placeholder="e.g. Steel Bolt M8" />
            <Input label="Batch Number" value={form.batchNumber} onChange={e => setForm(p=>({...p,batchNumber:e.target.value}))} placeholder="e.g. BTH-001" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Inspected" type="number" value={form.inspectedQuantity} onChange={e => setForm(p=>({...p,inspectedQuantity:e.target.value}))} required />
            <Input label="Passed" type="number" value={form.passedQuantity} onChange={e => setForm(p=>({...p,passedQuantity:e.target.value}))} />
            <Input label="Failed" type="number" value={form.failedQuantity} onChange={e => setForm(p=>({...p,failedQuantity:e.target.value}))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="form-select">
                {['passed','failed','rework'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="form-label">Severity</label>
              <select value={form.severity} onChange={e => setForm(p=>({...p,severity:e.target.value}))} className="form-select">
                {['low','medium','high','critical'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Input label="Inspector" value={form.inspectorName} onChange={e => setForm(p=>({...p,inspectorName:e.target.value}))} />
          </div>
          <Input label="Defect Type" value={form.defectType} onChange={e => setForm(p=>({...p,defectType:e.target.value}))} placeholder="e.g. Surface crack, Dimension error" />
          <div><label className="form-label">Notes</label><textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} rows={2} className="form-input resize-none" /></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Inspection?" message="This quality inspection record will be permanently deleted." loading={deleteLoading} />
    </div>
  );
};

export default QualityControl;
