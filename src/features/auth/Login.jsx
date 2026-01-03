import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LifeBuoy, Server, Info } from 'lucide-react'; 
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const result = login(username, password);
    if (result.success) {
      navigate(result.role === 'VESSEL' ? '/vessel' : '/shore');
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
              <label>User ID</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. chief"
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

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember Me
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="signin-btn">
              Sign in now
            </button>

            {/* SMALLER DEMO CARD */}
            <div className="creds-hint">
              <span className="hint-title">Demo Access:</span>
              <div className="hint-row">
                <span>Vessel: <code>chief</code>/<code>12345</code></span>
                <span>Shore: <code>manager</code>/<code>12345</code></span>
              </div>
            </div>

            <div className="form-footer">
              <p>
                By clicking "Sign in now" you agree to our <br/>
                <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;