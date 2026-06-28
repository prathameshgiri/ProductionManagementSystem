/**
 * Login.jsx - Login Page
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authService.login(form);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login shortcuts
  const demoLogin = async (email) => {
    setForm({ email, password: 'Prathamesh@123' });
    setLoading(true);
    try {
      const res = await authService.login({ email, password: 'Prathamesh@123' });
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to your account to continue</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="admin@prathameshgiri.in"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          icon={<FiMail />}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          icon={<FiLock />}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
            <span className="text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>



      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
          Register
        </Link>
      </p>
    </>
  );
};

export default Login;
