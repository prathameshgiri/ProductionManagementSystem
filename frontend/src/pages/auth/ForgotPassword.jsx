/**
 * ForgotPassword.jsx
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiMail } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      const token = res.data?.data?.resetToken;
      if (token) {
        setResetToken(token);
        toast.success('Reset token generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Forgot Password</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email to get a reset token</p>

      {resetToken ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Your Reset Token:</p>
          <p className="font-mono text-2xl font-bold text-green-700 dark:text-green-400 tracking-widest">{resetToken}</p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-2">Use this token on the Reset Password page. Valid for 15 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email Address" name="email" type="email" placeholder="your@factory.com" value={email} onChange={e => setEmail(e.target.value)} icon={<FiMail />} required />
          <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
            {loading ? 'Checking...' : 'Get Reset Token'}
          </Button>
        </form>
      )}

      {resetToken && (
        <Link to="/reset-password" className="btn btn-primary w-full mt-3 justify-center">Go to Reset Password</Link>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">← Back to Login</Link>
      </p>
    </>
  );
};

export default ForgotPassword;
