/**
 * Forbidden.jsx - 403 Error Page
 */
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiLock } from 'react-icons/fi';

const Forbidden = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiLock className="text-red-600 dark:text-red-400 text-3xl" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => window.history.back()} className="btn btn-secondary"><FiArrowLeft /> Go Back</button>
        <Link to="/dashboard" className="btn btn-primary"><FiHome /> Dashboard</Link>
      </div>
    </div>
  </div>
);

export default Forbidden;
