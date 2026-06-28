/**
 * Employees.jsx - Employee Management Page
 */
import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../services';
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
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUsers, FiRefreshCw, FiClock } from 'react-icons/fi';

const DEPARTMENTS = ['Production', 'Assembly', 'Quality Control', 'Warehouse', 'Maintenance', 'Engineering', 'Management', 'HR'];
const initialForm = { name: '', email: '', phone: '', department: '', role: '', shift: 'morning', status: 'active', salary: '', joinDate: new Date().toISOString().split('T')[0] };

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptF, setDeptF] = useState('');
  const [shiftF, setShiftF] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shiftStats, setShiftStats] = useState(null);
  const [attendanceItem, setAttendanceItem] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        employeeService.getAll({ search, department: deptF, shift: shiftF, page, limit: 10 }),
        employeeService.getShiftStats(),
      ]);
      setEmployees(empRes.data.data);
      setPagination(empRes.data.pagination || {});
      setShiftStats(statsRes.data.data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  }, [search, deptF, shiftF, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditItem(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (e) => { setEditItem(e); setForm({ name: e.name, email: e.email, phone: e.phone || '', department: e.department, role: e.role, shift: e.shift, status: e.status, salary: e.salary, joinDate: e.joinDate?.split('T')[0] || '' }); setModalOpen(true); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.name || !form.email || !form.department) { toast.error('Name, email and department required'); return; }
    setFormLoading(true);
    try {
      if (editItem) { await employeeService.update(editItem.id, form); toast.success('Employee updated!'); }
      else { await employeeService.create(form); toast.success('Employee created!'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await employeeService.delete(deleteId); toast.success('Employee deleted!'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleteLoading(false); }
  };

  const markAttendance = async (id, type) => {
    try {
      await employeeService.markAttendance(id, { type });
      toast.success(`Check-${type} recorded!`);
      setAttendanceItem(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to mark attendance'); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Employees</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage workforce, shifts and attendance</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={fetch}>Refresh</Button>
          <Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Employee</Button>
        </div>
      </div>

      {shiftStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard title="Total Active" value={shiftStats.total} color="indigo" icon={<FiUsers />} />
          <StatCard title="Morning Shift" value={shiftStats.morning} color="yellow" icon={<FiClock />} />
          <StatCard title="Evening Shift" value={shiftStats.evening} color="blue" icon={<FiClock />} />
          <StatCard title="Night Shift" value={shiftStats.night} color="purple" icon={<FiClock />} />
        </div>
      )}

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" placeholder="Search employees..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="form-input pl-9" /></div>
          <select value={deptF} onChange={e => { setDeptF(e.target.value); setPage(1); }} className="form-select w-full sm:w-44">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={shiftF} onChange={e => { setShiftF(e.target.value); setPage(1); }} className="form-select w-full sm:w-36">
            <option value="">All Shifts</option>
            {['morning','evening','night'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <TableSkeleton rows={8} cols={7} /> : employees.length === 0 ? (
          <EmptyState title="No employees found" icon={<FiUsers />} action={<Button variant="primary" size="sm" icon={<FiPlus />} onClick={openCreate}>Add Employee</Button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>ID</th><th>Employee</th><th>Department</th><th>Shift</th><th>Performance</th><th>Status</th><th>Attendance</th><th>Actions</th></tr></thead>
                <tbody>
                  {employees.map(e => (
                    <tr key={e.id}>
                      <td className="font-mono text-xs text-gray-500">{e.employeeId}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{e.name.charAt(0)}</div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{e.name}</div>
                            <div className="text-xs text-gray-400">{e.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400">{e.department}</td>
                      <td><Badge variant="blue">{e.shift}</Badge></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${e.performance}%` }} /></div>
                          <span className="text-xs">{e.performance}%</span>
                        </div>
                      </td>
                      <td><Badge variant={e.status}>{e.status}</Badge></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => markAttendance(e.id, 'in')} className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 transition-colors">In</button>
                          <button onClick={() => markAttendance(e.id, 'out')} className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 transition-colors">Out</button>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(e)} className="btn-icon btn-ghost text-blue-600 dark:text-blue-400 text-sm"><FiEdit2 /></button>
                          <button onClick={() => setDeleteId(e.id)} className="btn-icon btn-ghost text-red-600 dark:text-red-400 text-sm"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">{pagination.total} employees</span>
                <div className="flex gap-1">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Employee' : 'Add Employee'} size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={formLoading} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} />
            <Input label="Role" value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))} placeholder="e.g. Welder" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Department <span className="text-red-500">*</span></label>
              <select value={form.department} onChange={e => setForm(p=>({...p,department:e.target.value}))} className="form-select" required>
                <option value="">Select Dept.</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="form-label">Shift</label>
              <select value={form.shift} onChange={e => setForm(p=>({...p,shift:e.target.value}))} className="form-select">
                {['morning','evening','night'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary ($)" type="number" value={form.salary} onChange={e => setForm(p=>({...p,salary:e.target.value}))} />
            <Input label="Join Date" type="date" value={form.joinDate} onChange={e => setForm(p=>({...p,joinDate:e.target.value}))} />
          </div>
          <div><label className="form-label">Status</label>
            <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Employee?" message="This employee record will be permanently removed." loading={deleteLoading} />
    </div>
  );
};

export default Employees;
