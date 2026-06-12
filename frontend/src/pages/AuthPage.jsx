import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Glasses, Sparkles } from 'lucide-react';

export const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect path after authentication succeeds
  const fromPath = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isLoginTab) {
        if (!formData.email || !formData.password) {
          throw new Error('Please enter both email and password.');
        }
        await login(formData.email, formData.password);
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Please fill in all registration fields.');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await register(formData.name, formData.email, formData.password);
      }
      // Redirect on success
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (isLogin) => {
    setIsLoginTab(isLogin);
    setError(null);
    setFormData({
      name: '',
      email: '',
      password: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <Glasses size={48} className="logo-icon" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
            MetaGlasses<span className="logo-accent">Reviews</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Unlock community reviews & administration moderation
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            onClick={() => handleTabChange(true)} 
            className={`auth-tab ${isLoginTab ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => handleTabChange(false)} 
            className={`auth-tab ${!isLoginTab ? 'active' : ''}`}
          >
            Register
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="form-input"
                required={!isLoginTab}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="e.g. name@domain.com"
              className="form-input"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              placeholder="Enter your security password..."
              className="form-input"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', height: '48px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : isLoginTab ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-link">
          {isLoginTab ? (
            <>
              New to Meta Glasses?{' '}
              <span onClick={() => handleTabChange(false)} className="auth-link">
                Create an account
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span onClick={() => handleTabChange(true)} className="auth-link">
                Sign in
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
