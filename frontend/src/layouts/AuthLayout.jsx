/**
 * AuthLayout.jsx - Layout for login/register pages
 * Centered card on a gradient background
 */

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-dark-bg to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <img src="/logo3d.png" alt="3D Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Production Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manufacturing Intelligence System</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-8">
          {children}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 PMS Factory. Secure & Local System.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
