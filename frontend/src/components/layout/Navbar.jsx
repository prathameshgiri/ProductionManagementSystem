/**
 * Navbar.jsx - Top Navigation Bar
 * 
 * Contains: hamburger menu (mobile), page title, search,
 *           notifications bell, theme toggle, user avatar
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMenu, FiBell, FiSun, FiMoon, FiSearch, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services';
import { clsx } from 'clsx';

const Navbar = ({ onMenuClick, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 60s for new notifications
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getAll({ isRead: false, limit: 1 });
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      // Silently ignore notification count errors
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Navigate to the most relevant page with search query
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className={clsx(
      'fixed top-0 right-0 z-30 h-16',
      'bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border',
      'flex items-center px-4 gap-3 transition-all duration-300',
      // Offset for sidebar
      'left-0 lg:left-64',
      sidebarCollapsed && 'lg:left-16',
    )}>
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="btn-icon btn-ghost text-xl lg:hidden"
        aria-label="Toggle menu"
      >
        <FiMenu />
      </button>

      {/* Global Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, orders..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </form>

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon btn-ghost text-lg"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-slate-600" />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="btn-icon btn-ghost text-lg relative"
          aria-label="Notifications"
        >
          <FiBell />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-12 w-52 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg z-20 py-1 animate-slide-up">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                >
                  <FiUser /> My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                >
                  <FiSettings /> Settings
                </Link>
                <hr className="my-1 border-gray-100 dark:border-dark-border" />
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-left"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
