import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Glasses, LayoutDashboard, Compass, Shield, LogOut, LogIn, User, Sun, Moon, Database } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Glasses className="logo-icon" />
          <span>MetaGlasses<span className="logo-accent">Reviews</span></span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={18} />
            <span>Explore</span>
          </NavLink>

          <NavLink to="/advanced" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Database size={18} />
            <span>Advanced Queries</span>
          </NavLink>

          {isAuthenticated && isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item nav-admin ${isActive ? 'active' : ''}`}>
              <Shield size={18} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </div>

        <div className="navbar-actions" style={{ gap: '16px' }}>
          <button onClick={toggleTheme} className="btn btn-secondary btn-sm" style={{ padding: '8px' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="user-info" style={{ textDecoration: 'none' }}>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm logout-btn">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm login-btn">
              <LogIn size={16} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
