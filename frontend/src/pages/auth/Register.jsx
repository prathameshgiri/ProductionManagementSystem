/**
 * Register.jsx - Registration Page
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiBriefcase } from 'react-icons/fi';

const ROLES = [
  { value: 'employee', label: 'Employee' },
  { value: 'production_manager', label: 'Production Manager' },
  { value: 'quality_inspector', label: 'Quality Inspector' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'admin', label: 'Admin' },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Create Account</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Join the Production Management System</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" name="name" placeholder="John Smith" value={form.name} onChange={handleChange} error={errors.name} icon={<FiUser />} required />
        <Input label="Email Address" name="email" type="email" placeholder="you@factory.com" value={form.email} onChange={handleChange} error={errors.email} icon={<FiMail />} required />
        <Input label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<FiLock />} required />

        <div>
          <label className="form-label">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="form-select">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <Input label="Department" name="department" placeholder="e.g. Production, Assembly" value={form.department} onChange={handleChange} icon={<FiBriefcase />} />

        <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Sign in</Link>
      </p>
    </>
  );
};

export default Register;
