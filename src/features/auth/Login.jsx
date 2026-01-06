import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => { // <--- 1. Mark function as ASYNC
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // <--- 2. Wait for the API response
    const result = await login(username, password); 
    
    setIsLoading(false);

    if (result.success) {
      // <--- 3. Redirect based on Role
      if (result.role === 'VESSEL') {
        navigate('/vessel/dashboard');
      } else {
        // ADMIN and SHORE go to the same dashboard
        navigate('/shore/dashboard'); 
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* LEFT SIDE: Branding */}
        <div className="info-side">
          <h1>Defect <br /> Reporting <br /> System</h1>
          <p className="description">
            Streamlined maintenance tracking for the global fleet. 
            Sync onboard inspections with shore management instantly.
          </p>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="form-side">
          <h2 className="form-header">Sign in</h2>
          
          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@drs.com"
                required 
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required 
              />
            </div>

            <button type="submit" className="signin-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in now'}
            </button>

            {/* Hint for you (Remove in production) */}
            <div className="creds-hint">
              <span className="hint-title">Database Logins:</span>
              <div className="hint-row">
                <span>Admin: <code>admin@drs.com</code> / <code>12345</code></span>
                <span>Shore: <code>manager@drs.com</code> / <code>12345</code></span>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;