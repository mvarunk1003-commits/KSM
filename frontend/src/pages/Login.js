import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const authData = localStorage.getItem('authData');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (authData && isAdmin === 'true') {
      try {
        const parsed = JSON.parse(authData);
        const tokenAge = Date.now() - parsed.timestamp;
        if (tokenAge < 24 * 60 * 60 * 1000) {
          navigate('/admin', { replace: true });
        }
      } catch (err) {
        // Invalid auth data, continue to login
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        const authData = {
          username: formData.username,
          timestamp: Date.now()
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
        localStorage.setItem('isAdmin', 'true');
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        setSuccess('Authentication successful! Loading ERP Dashboard...');
        setError('');
        
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 1000);
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network connection error. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    setError('To reset your credentials, please contact the temple office administrator.');
  };

  const handleBackToSite = () => {
    navigate('/');
  };

  return (
    <main className="login-container" role="main">
      <div className="login-form-card">
        <div className="login-brand">
          <img 
            src="/assets/temple_seal.png" 
            alt="Sringeri SriShankara Mutt Seal" 
            style={{ width: '72px', height: '72px', margin: '0 auto 12px auto', display: 'block', borderRadius: '50%', boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)' }} 
          />
          <h1>Admin Portal Login</h1>
          <p>Kolar Sringeri SriShankara Mutt ERP</p>
        </div>

        {error && (
          <div className="message error" role="alert" aria-live="assertive">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message success" role="alert" aria-live="polite">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate={false}>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Admin Username <span className="required-indicator" aria-hidden="true">*</span>
            </label>
            <input
              id="login-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. admin"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="login-password" className="form-label">
              Password <span className="required-indicator" aria-hidden="true">*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
                disabled={loading}
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '4px 8px',
                  color: 'var(--primary)'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 'var(--spacing-sm) 0 var(--spacing-lg) 0', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              Remember me
            </label>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--spacing-md)' }}>
          <button 
            type="button"
            onClick={handleBackToSite} 
            className="btn btn-outline btn-sm"
          >
            &larr; Return to Public Website
          </button>
        </div>
      </div>
    </main>
  );
}
