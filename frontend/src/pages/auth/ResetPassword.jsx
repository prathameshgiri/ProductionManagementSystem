/**
 * ResetPassword.jsx
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiMail, FiKey, FiLock } from 'react-icons/fi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', token: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.token || !form.newPassword) { toast.error('All fields required'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(form);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Reset Password</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your reset token and new password</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" name="email" type="email" placeholder="your@factory.com" value={form.email} onChange={handleChange} icon={<FiMail />} required />
        <Input label="Reset Token" name="token" placeholder="6-digit token" value={form.token} onChange={handleChange} icon={<FiKey />} required />
        <Input label="New Password" name="newPassword" type="password" placeholder="Min 6 characters" value={form.newPassword} onChange={handleChange} icon={<FiLock />} required />
        <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">← Back to Login</Link>
      </p>
    </>
  );
};

export default ResetPassword;
