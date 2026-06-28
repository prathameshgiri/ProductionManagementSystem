/**
 * UserProfile.jsx - User profile page with edit capabilities
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiEdit2, FiSave } from 'react-icons/fi';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const roleLabel = {
    admin: 'Administrator',
    production_manager: 'Production Manager',
    employee: 'Employee',
    quality_inspector: 'Quality Inspector',
    warehouse_manager: 'Warehouse Manager',
  }[user?.role] || user?.role;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">My Profile</h1></div>
        {!editing && <Button variant="primary" size="sm" icon={<FiEdit2 />} onClick={() => setEditing(true)}>Edit Profile</Button>}
      </div>

      <div className="max-w-2xl">
        {/* Profile Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-glow">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="mt-1 flex gap-2">
                <Badge variant="blue">{roleLabel}</Badge>
                <Badge variant={user?.status || 'active'}>{user?.status || 'active'}</Badge>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input label="Full Name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} icon={<FiUser />} />
              <Input label="Phone" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} icon={<FiPhone />} />
              <Input label="Department" value={form.department} onChange={e => setForm(p=>({...p,department:e.target.value}))} icon={<FiBriefcase />} />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="primary" icon={<FiSave />} loading={loading} onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { icon: <FiUser />, label: 'Name', value: user?.name },
                { icon: <FiMail />, label: 'Email', value: user?.email },
                { icon: <FiPhone />, label: 'Phone', value: user?.phone || 'Not set' },
                { icon: <FiBriefcase />, label: 'Department', value: user?.department || 'Not set' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <span className="text-gray-400 text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="card p-5">
          <h3 className="section-title mb-3">Account Information</h3>
          <div className="space-y-2">
            {[
              { label: 'Account ID', value: user?.id },
              { label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A' },
              { label: 'Account Created', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0 text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 font-mono text-xs">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
