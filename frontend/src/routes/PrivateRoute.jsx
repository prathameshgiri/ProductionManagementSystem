import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Determine a fallback route based on role if they hit a forbidden page
    let fallback = '/';
    if (user.role === 'employee') fallback = '/production-orders';
    if (user.role === 'quality_inspector') fallback = '/quality-control';
    if (user.role === 'warehouse_manager') fallback = '/inventory';
    
    // If they are already at the root trying to access forbidden dashboard, redirect to their fallback
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      return <Navigate to={fallback} replace />;
    }
    
    // Otherwise show 403
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
