import React, { useState, useEffect } from 'react';
import AllChats from '../pages/AllChats';
import './AdminLogin.css';

const AdminLogin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (username === 'adminator' && password === 'admin135791519') {
        sessionStorage.setItem('adminAuth', 'authenticated');
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <div className="admin-container">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
        <AllChats />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h1>Admin Access</h1>
          <p>Enter your credentials to view all conversations</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : '🔓 Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
