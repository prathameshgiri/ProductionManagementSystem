/**
 * Settings.jsx - App Settings Page
 */
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { FiSun, FiMoon, FiLock, FiDatabase, FiDownload } from 'react-icons/fi';
import api from '../services/api';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setPwLoading(false); }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.get('/backup/export');
      const data = JSON.stringify(res.data.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Database backup downloaded!');
    } catch { toast.error('Backup failed'); }
    finally { setBackupLoading(false); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div><Breadcrumb /><h1 className="page-title">Settings</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage your preferences and security settings</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">{isDark ? <FiMoon /> : <FiSun />} Appearance</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Color Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Currently: <strong>{isDark ? 'Dark Mode' : 'Light Mode'}</strong></p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center text-xs ${isDark ? 'translate-x-7' : ''}`}>
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2"><FiLock /> Security</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p=>({...p,currentPassword:e.target.value}))} required />
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p=>({...p,newPassword:e.target.value}))} required />
            <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p=>({...p,confirmPassword:e.target.value}))} required />
            <Button type="submit" variant="primary" loading={pwLoading} className="w-full">Change Password</Button>
          </form>
        </div>

        {/* Database Backup - Admin only */}
        {user?.role === 'admin' && (
          <div className="card p-6">
            <h2 className="section-title mb-4 flex items-center gap-2"><FiDatabase /> Data Management</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-xl mb-3">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Export Database</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download all data as a JSON backup file</p>
              </div>
              <Button variant="primary" size="sm" icon={<FiDownload />} loading={backupLoading} onClick={handleBackup}>
                Backup
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-xl mb-3">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Import Database</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Restore from a previous JSON backup</p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const json = JSON.parse(text);
                      if (!json.version) throw new Error('Invalid backup file');
                      setBackupLoading(true);
                      await api.post('/backup/import', json);
                      toast.success('Database restored successfully! Please refresh.');
                    } catch (err) {
                      toast.error('Failed to import backup');
                    } finally {
                      setBackupLoading(false);
                      e.target.value = '';
                    }
                  }}
                />
                <Button variant="secondary" size="sm" loading={backupLoading}>
                  Import
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
              ⚠️ The backup file contains all users, products, orders, and other data. Keep it secure. Importing will overwrite current data.
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="card p-6">
          <h2 className="section-title mb-4">System Information</h2>
          <div className="space-y-3">
            {[
              { label: 'System', value: 'Production Management System' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Backend', value: 'Node.js + Express.js' },
              { label: 'Database', value: 'Local JSON Files' },
              { label: 'Frontend', value: 'React + Vite + Tailwind CSS' },
              { label: 'Backend Port', value: '5000' },
              { label: 'Frontend Port', value: '5173' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
