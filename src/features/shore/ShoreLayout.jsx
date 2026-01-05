import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, ListTodo, History, LogOut, Bell, 
  Building2, ChevronRight, Search, Ship, ChevronDown, UserPlus 
} from 'lucide-react';
import './Shore.css';

const ShoreLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATES ---
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // <--- NEW STATE
  const [vesselSearch, setVesselSearch] = useState('');
  
  // Mock Data
  const allVessels = [
    { id: 'v1', name: 'MT ALFA' },
    { id: 'v2', name: 'MT BRAVO' },
    { id: 'v3', name: 'MT CHARLIE' },
    { id: 'v4', name: 'MT DELTA' },
    { id: 'v5', name: 'MT ECHO' },
    { id: 'v6', name: 'MT FOXTROT' },
  ];

  const [selectedVessels, setSelectedVessels] = useState(allVessels.map(v => v.id));

  const toggleVessel = (id) => {
    if (selectedVessels.includes(id)) {
      setSelectedVessels(selectedVessels.filter(v => v !== id));
    } else {
      setSelectedVessels([...selectedVessels, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVessels.length === allVessels.length) {
      setSelectedVessels([]);
    } else {
      setSelectedVessels(allVessels.map(v => v.id));
    }
  };

  const filteredVessels = allVessels.filter(v => 
    v.name.toLowerCase().includes(vesselSearch.toLowerCase())
  );

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

          <div 
            className="nav-item-container"
            onMouseEnter={() => setIsFlyoutOpen(true)}
            onMouseLeave={() => setIsFlyoutOpen(false)}
          >
            <button 
              className={`nav-item ${location.pathname === '/shore/vessels' ? 'active' : ''}`}
              onClick={() => navigate('/shore/vessels')} 
            >
              <Ship size={20} />
              <span>Vessel Defect</span>
              <ChevronRight size={16} className="arrow-right" />
            </button>

            {/* FLYOUT MENU */}
            {isFlyoutOpen && (
              <div className="vessel-flyout">
                <div className="flyout-header"><h4>Filter Fleet</h4></div>
                <div className="v-search-box">
                  <Search size={14} />
                  <input type="text" placeholder="Search fleet..." value={vesselSearch} onChange={(e) => setVesselSearch(e.target.value)} />
                </div>
                <div className="v-list">
                  <label className="v-checkbox master">
                    <input type="checkbox" checked={selectedVessels.length === allVessels.length} onChange={toggleSelectAll} />
                    <span>Select All ({allVessels.length})</span>
                  </label>
                  {filteredVessels.map(v => (
                    <label key={v.id} className="v-checkbox">
                      <input type="checkbox" checked={selectedVessels.includes(v.id)} onChange={() => toggleVessel(v.id)} />
                      <span>{v.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

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
            <div className="avatar">TM</div>
            <div className="user-details">
              <span className="name">James Cameron</span>
              <span className="role">Fleet Admin</span>
            </div>
          </div>
          {/* Sidebar logout removed since it's in header now, or keep both as you prefer */}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="shore-main">
        <header className="shore-header">
          <div className="global-status">
            <span>Filtering Data for: <strong>{selectedVessels.length} Vessels</strong></span>
          </div>

          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge-count">5</span>
            </button>

            {/* --- NEW: USER PROFILE DROPDOWN --- */}
            <div className="profile-container">
              <div 
                className="profile-pill" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="avatar-circle">
                  {user?.name?.charAt(0) || 'J'}
                </div>
                <span className="profile-name">{user?.name || 'James Cameron'}</span>
                <ChevronDown size={16} className={`arrow ${isProfileMenuOpen ? 'up' : ''}`} />
              </div>

              {/* Dropdown Menu */}
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
            {/* ---------------------------------- */}

          </div>
        </header>

        <div className="page-content">
          <Outlet context={{ selectedVessels }} />
        </div>
      </main>
    </div>
  );
};

export default ShoreLayout;