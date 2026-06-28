/**
 * AuthContext.jsx - Authentication Context
 * 
 * Provides authentication state and methods to the entire app.
 * - Stores user info and JWT token in localStorage
 * - Exposes: user, token, login(), logout(), isAuthenticated
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('pms_token');
    const storedUser = localStorage.getItem('pms_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        // Corrupted data - clear storage
        localStorage.removeItem('pms_token');
        localStorage.removeItem('pms_user');
      }
    }
    setLoading(false);
  }, []);

  // Login: store token + user in state and localStorage
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('pms_token', authToken);
    localStorage.setItem('pms_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  }, []);

  // Logout: clear everything
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pms_token');
    localStorage.removeItem('pms_user');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  }, []);

  // Update user info (after profile edit)
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pms_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

export default AuthContext;
