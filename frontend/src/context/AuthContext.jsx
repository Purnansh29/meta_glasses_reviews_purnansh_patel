import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Failed to authenticate on load:', err.message);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        // Fetch user profile immediately
        const meResponse = await api.get('/auth/me');
        setUser(meResponse.data);
        toast.success('Successfully logged in!');
        return meResponse.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        // Fetch user profile immediately
        const meResponse = await api.get('/auth/me');
        setUser(meResponse.data);
        toast.success('Successfully registered!');
        return meResponse.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
      toast.success('Logged out successfully');
    } catch (err) {
      console.warn('Backend logout warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
