import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, UserPlus, LogOut } from 'lucide-react';
import './Shore.css';

const ShoreHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="shore-header">
      <div className="header-right">
        {/* Notification Bell */}
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="badge-count">3</span>
        </button>

        {/* --- PROFILE DROPDOWN --- */}
        <div className="profile-container">
          <div 
            className="profile-pill" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{display:'flex', flexDirection:'column', lineHeight:'1.2'}}>
                <span className="profile-name">{user?.name}</span>
                <span style={{fontSize:'10px', color:'#94a3b8', textAlign:'left'}}>
                    {user?.job_title || user?.role}
                </span>
            </div>
            <ChevronDown size={16} className={`arrow ${isMenuOpen ? 'up' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="profile-dropdown">
              
              {/* CHECK FOR ADMIN ROLE */}
              {user?.role === 'ADMIN' && (
                <div className="dropdown-item" onClick={() => navigate('/shore/admin/users')}>
                  <UserPlus size={16} />
                  <span>Admin Panel</span>
                </div>
              )}

              <div className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ShoreHeader;