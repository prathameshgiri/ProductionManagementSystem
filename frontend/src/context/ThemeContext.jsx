/**
 * ThemeContext.jsx - Dark/Light Mode Theme Context
 * 
 * Manages the app's color theme (dark/light).
 * Persists preference to localStorage.
 * Applies 'dark' class to <html> element for Tailwind dark mode.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage, default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pms_theme') || 'dark'; // Default dark for premium look
  });

  // Apply theme class to <html> on change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pms_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be inside ThemeProvider');
  return context;
};

export default ThemeContext;
