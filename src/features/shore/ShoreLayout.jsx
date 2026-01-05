import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // <--- 1. Import React Query
import { getVessels } from '../../api/vessels';   // <--- 2. Import API
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [vesselSearch, setVesselSearch] = useState('');
  
  // --- 3. FETCH REAL VESSELS FROM DB ---
  const { data: vesselList = [], isLoading } = useQuery({
    queryKey: ['vessels'],
    queryFn: getVessels
  });

  // State for selected IMOs
  const [selectedVessels, setSelectedVessels] = useState([]);

  // --- 4. AUTO-SELECT ALL ON LOAD ---
  // When data arrives from Backend, select all ships by default
  useEffect(() => {
    if (vesselList.length > 0 && selectedVessels.length === 0) {
      setSelectedVessels(vesselList.map(v => v.imo_number));
    }
  }, [vesselList]);

  // --- HANDLERS ---
  const toggleVessel = (imo) => {
    if (selectedVessels.includes(imo)) {
      setSelectedVessels(selectedVessels.filter(id => id !== imo));
    } else {
      setSelectedVessels([...selectedVessels, imo]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVessels.length === vesselList.length) {
      setSelectedVessels([]); // Deselect All
    } else {
      setSelectedVessels(vesselList.map(v => v.imo_number)); // Select All
    }
  };

  // Filter the list based on search input
  const filteredVessels = vesselList.filter(v => 
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

            {/* --- FLYOUT MENU (Now using Real DB Data) --- */}
            {isFlyoutOpen && (
              <div className="vessel-flyout">
                <div className="flyout-header"><h4>Filter Fleet</h4></div>
                
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
                  {/* Select All Checkbox */}
                  <label className="v-checkbox master">
                    <input 
                      type="checkbox" 
                      checked={vesselList.length > 0 && selectedVessels.length === vesselList.length} 
                      onChange={toggleSelectAll} 
                    />
                    <span>Select All ({vesselList.length})</span>
                  </label>

                  {/* Loading State */}
                  {isLoading && <div style={{padding:'10px', fontSize:'12px', color:'#94a3b8'}}>Loading vessels...</div>}

                  {/* Real Vessel List */}
                  {filteredVessels.map(v => (
                    <label key={v.imo_number} className="v-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedVessels.includes(v.imo_number)} 
                        onChange={() => toggleVessel(v.imo_number)} 
                      />
                      <span>{v.name}</span>
                    </label>
                  ))}

                  {/* Empty State */}
                  {!isLoading && filteredVessels.length === 0 && (
                    <div style={{padding:'10px', fontSize:'12px', color:'#94a3b8'}}>No ships found.</div>
                  )}
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
            <div className="avatar">
               {user?.name?.charAt(0) || 'A'}
            </div>
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
            {/* Show accurate count based on selection */}
            <span>Filtering Data for: <strong>{selectedVessels.length} Vessels</strong></span>
          </div>

          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge-count">3</span>
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="profile-container">
              <div 
                className="profile-pill" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="avatar-circle">
                  {user?.name?.charAt(0) || 'A'}
                </div>
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
          {/* We pass the Selected IMOs down to children if they need it */}
          <Outlet context={{ selectedVessels }} />
        </div>
      </main>
    </div>
  );
};

export default ShoreLayout;