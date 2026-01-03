import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, ListTodo, History, LogOut, Bell, 
  Building2, ChevronRight, Search, Ship 
} from 'lucide-react';
import './Shore.css';

const ShoreLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- VESSEL DATA & STATE ---
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [vesselSearch, setVesselSearch] = useState('');
  
  const allVessels = [
    { id: 'v1', name: 'MT ALFA' },
    { id: 'v2', name: 'MT BRAVO' },
    { id: 'v3', name: 'MT CHARLIE' },
    { id: 'v4', name: 'MT DELTA' },
    { id: 'v5', name: 'MT ECHO' },
    { id: 'v6', name: 'MT FOXTROT' },
  ];

  // Default: Select All
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
      <aside className="shore-sidebar">
        <div className="sidebar-header">
          <Building2 size={28} color="#2dd4bf" />
          <div className="hq-info">
            <h3>HQ CONTROL</h3>
            <span>Fleet Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          
          {/* 1. FLEET OVERVIEW */}
          <button 
            className={`nav-item ${location.pathname === '/shore/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/shore/dashboard')}
          >
            <LayoutGrid size={20} />
            <span>Fleet Overview</span>
          </button>

          {/* 2. VESSELS (Click -> Page, Hover -> Filter) */}
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
              <span>Vessels Defect</span> {/* Renamed from Vessel Filter */}
              <ChevronRight size={16} className="arrow-right" />
            </button>

            {/* FLYOUT MENU */}
            {isFlyoutOpen && (
              <div className="vessel-flyout">
                <div className="flyout-header">
                  <h4>Filter Fleet</h4>
                </div>
                
                <div className="v-search-box">
                  <Search size={14} />
                  <input 
                    type="text" 
                    placeholder="Search fleet..." 
                    value={vesselSearch}
                    onChange={(e) => setVesselSearch(e.target.value)}
                  />
                </div>

                <div className="v-list">
                  <label className="v-checkbox master">
                    <input 
                      type="checkbox" 
                      checked={selectedVessels.length === allVessels.length}
                      onChange={toggleSelectAll}
                    />
                    <span>Select All ({allVessels.length})</span>
                  </label>

                  {filteredVessels.map(v => (
                    <label key={v.id} className="v-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedVessels.includes(v.id)}
                        onChange={() => toggleVessel(v.id)}
                      />
                      <span>{v.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. MY TASKS */}
          <button 
            className={`nav-item ${location.pathname === '/shore/tasks' ? 'active' : ''}`}
            onClick={() => navigate('/shore/tasks')}
          >
            <ListTodo size={20} />
            <span>My Tasks</span>
          </button>

          {/* 4. HISTORY */}
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
          <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /></button>
        </div>
      </aside>

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
          </div>
        </header>

        <div className="page-content">
          {/* PASS SELECTION TO CHILDREN */}
          <Outlet context={{ selectedVessels }} />
        </div>
      </main>
    </div>
  );
};

export default ShoreLayout;