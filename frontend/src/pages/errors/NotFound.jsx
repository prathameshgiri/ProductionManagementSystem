/**
 * NotFound.jsx - 404 Error Page
 */
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-primary-200 dark:text-primary-900 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => window.history.back()} className="btn btn-secondary"><FiArrowLeft /> Go Back</button>
        <Link to="/dashboard" className="btn btn-primary"><FiHome /> Dashboard</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
