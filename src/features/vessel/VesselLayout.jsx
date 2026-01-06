import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getVessels } from '../../api/vessels'; // To resolve Ship Name from IMO
import { 
  LayoutDashboard, PlusCircle, ListTodo, History,
  LogOut, Bell, Anchor, Wifi, Settings, X, FileText 
} from 'lucide-react';
import './Vessel.css';

const VesselLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // --- 1. IDENTIFY ASSIGNED VESSEL ---
  // Users (Crew) usually belong to 1 ship. We take the first one.
  const assignedImo = user?.assignedVessels?.[0];

  // --- 2. FETCH VESSEL DETAILS ---
  // We need this to show the Real Name "MT ALFA" instead of just "9123456"
  const { data: vessels = [] } = useQuery({
    queryKey: ['vessels'],
    queryFn: getVessels,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const currentVessel = useMemo(() => {
    return vessels.find(v => v.imo_number === assignedImo);
  }, [vessels, assignedImo]);

  const shipName = currentVessel ? currentVessel.name : 'Unassigned Vessel';
  const shipImo = assignedImo || 'No IMO';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/vessel/dashboard' },
    { label: 'Create Defect', icon: <PlusCircle size={20} />, path: '/vessel/create' },
    { label: 'My Tasks', icon: <ListTodo size={20} />, path: '/vessel/tasks' },
    { label: 'Defects', icon: <History size={20} />, path: '/vessel/history' },
  ];

  return (
    <div className="vessel-shell">
      {/* SIDEBAR */}
      <aside className="vessel-sidebar">
        <div className="sidebar-header">
          <Anchor size={28} color="#ea580c" />
          <div className="ship-info">
            {/* REAL DATA DISPLAY */}
            <h3 title={shipName}>{shipName}</h3>
            <span>IMO: {shipImo}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button 
              key={item.path}
              className={`nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="avatar">
                {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              {/* REAL USER DATA */}
              <span className="name">{user?.name || 'Crew Member'}</span>
              <span className="role">{user?.job_title || user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="vessel-main">
        
        {/* TOP HEADER */}
        <header className="vessel-header">
          <div className="sync-status">
            <Wifi size={16} className="text-success" />
            <span>Connected to Cloud</span>
          </div>

          <div className="header-actions" ref={notifRef}>
            
            <button 
              className={`icon-btn notification-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="badge-count">2</span>
            </button>

            {/* NOTIFICATION POPUP (Static for now) */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notif-header">
                  <h3>Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                </div>
                <div className="notif-list">
                   <div className="notif-item unread">
                      <div className="notif-content">
                        <p><span className="notif-user">System</span> Welcome to DRS Cloud.</p>
                        <span className="notif-time">Just now</span>
                      </div>
                   </div>
                </div>
              </div>
            )}

          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VesselLayout;