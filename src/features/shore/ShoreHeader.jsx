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
      {/* Left Side */}
      <div className="global-status">
        <span>Fleet Status: <strong>Online</strong></span>
      </div>

      <div className="header-right">
        {/* Notification Bell */}
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="badge-count">3</span>
        </button>

        {/* --- PROFILE DROPDOWN (Orange Style) --- */}
        <div className="profile-container">
          <div 
            className="profile-pill" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'J'}
            </div>
            <span className="profile-name">{user?.name || 'John David'}</span>
            <ChevronDown size={16} className={`arrow ${isMenuOpen ? 'up' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item" onClick={() => navigate('/shore/admin/users')}>
                <UserPlus size={16} />
                <span>Admin Panel</span>
              </div>
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