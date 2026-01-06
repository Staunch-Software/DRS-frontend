import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, ListTodo, History, LogOut, Bell, 
  Building2, ChevronRight, Ship, ChevronDown, UserPlus 
} from 'lucide-react';
import './Shore.css';

const ShoreLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shore-shell">
      {/* SIDEBAR */}
      <aside className="shore-sidebar">
        <div className="sidebar-header">
          <Building2 size={28} color="#2dd4bf" />
          <div className="hq-info">
            <h3>HQ CONTROL</h3>
            <span>Fleet Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${location.pathname === '/shore/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/shore/dashboard')}
          >
            <LayoutGrid size={20} />
            <span>Fleet Overview</span>
          </button>

          {/* VESSEL DEFECT - No Flyout anymore, just navigation */}
          <button 
            className={`nav-item ${location.pathname === '/shore/vessels' ? 'active' : ''}`}
            onClick={() => navigate('/shore/vessels')} 
          >
            <Ship size={20} />
            <span>Vessel Defect</span>
            {/* <ChevronRight size={16} className="arrow-right" /> */}
          </button>

          <button 
            className={`nav-item ${location.pathname === '/shore/tasks' ? 'active' : ''}`}
            onClick={() => navigate('/shore/tasks')}
          >
            <ListTodo size={20} />
            <span>My Tasks</span>
          </button>

          <button 
            className={`nav-item ${location.pathname === '/shore/history' ? 'active' : ''}`}
            onClick={() => navigate('/shore/history')}
          >
            <History size={20} />
            <span>History</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="user-details">
              <span className="name">{user?.name || 'Admin'}</span>
              <span className="role">{user?.role || 'Fleet Admin'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="shore-main">
        <header className="shore-header">
          <div className="global-status">
            <span>System Status: <strong>Online</strong></span>
          </div>

          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge-count">3</span>
            </button>

            <div className="profile-container">
              <div className="profile-pill" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                <div className="avatar-circle">{user?.name?.charAt(0) || 'A'}</div>
                <span className="profile-name">{user?.name || 'Admin'}</span>
                <ChevronDown size={16} className={`arrow ${isProfileMenuOpen ? 'up' : ''}`} />
              </div>

              {isProfileMenuOpen && (
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

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ShoreLayout;