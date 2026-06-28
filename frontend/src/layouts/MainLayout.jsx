/**
 * MainLayout.jsx - Main application layout wrapper
 * Contains sidebar + navbar + main content area with proper responsive offsets
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);     // Mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main content area - offset for sidebar and navbar */}
      <main
        className={clsx(
          'transition-all duration-300 pt-16',
          // Desktop: offset for sidebar width
          'lg:pl-64',
          sidebarCollapsed && 'lg:pl-16',
        )}
      >
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
