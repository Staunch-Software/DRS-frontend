import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, ListTodo, History,
  LogOut, Bell, Anchor, Wifi, Settings, X, Check, FileText, User
} from 'lucide-react';
import './Vessel.css';

const VesselLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- NOTIFICATION STATE ---
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null); // To detect clicks outside

  // --- MOCK NOTIFICATIONS ---
  const notifications = [
    {
      id: 1,
      type: 'comment',
      user: 'Supt. James',
      avatarColor: '#3b82f6', // Blue
      text: 'commented on Fuel Pump Leak',
      subtext: 'Please check the pressure gauge readings again.',
      time: '10 mins ago',
      unread: true
    },
    {
      id: 2,
      type: 'system',
      user: 'System',
      avatarColor: '#10b981', // Green
      text: 'PR-2025-001 Approved',
      subtext: 'Spare parts request has been processed by HQ.',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'mention',
      user: '2nd Engineer',
      avatarColor: '#f97316', // Orange
      text: 'mentioned you in Vibration Alarm',
      subtext: '@Chief can you verify this reading?',
      time: '3 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'file',
      user: 'Fleet Manager',
      avatarColor: '#8b5cf6', // Purple
      text: 'shared a file Manual_v2.pdf',
      subtext: '',
      hasFile: true,
      time: 'Yesterday',
      unread: false
    }
  ];

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
      {/* SIDEBAR (Unchanged) */}
      <aside className="vessel-sidebar">
        <div className="sidebar-header">
          <Anchor size={28} color="#ea580c" />
          <div className="ship-info">
            <h3>MT ALFA</h3>
            <span>IMO: 9123456</span>
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
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'C'}</div>
            <div className="user-details">
              <span className="name">Chief Engineer</span>
              <span className="role">Vessel Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="vessel-main">
        
        {/* TOP HEADER */}
        <header className="vessel-header">
          <div className="sync-status">
            <Wifi size={16} className="text-success" />
            <span>Connected to Local Server</span>
          </div>

          <div className="header-actions" ref={notifRef}>
            
            {/* BELL BUTTON */}
            <button 
              className={`icon-btn notification-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="badge-count">2</span>
            </button>

            {/* --- NOTIFICATION POPUP --- */}
            {showNotifications && (
              <div className="notification-dropdown">
                
                {/* Header */}
                <div className="notif-header">
                  <h3>Notification</h3>
                  <div className="notif-actions">
                    <button><Settings size={16} /></button>
                    <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="notif-tabs">
                  <button className="active">View all</button>
                  <button>Mentions</button>
                  <button>Unread (2)</button>
                  <span className="mark-read">Mark all as read</span>
                </div>

                {/* List */}
                <div className="notif-list">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                      
                      {/* Unread Dot */}
                      {notif.unread && <span className="blue-dot"></span>}

                      {/* Avatar */}
                      <div className="notif-avatar" style={{backgroundColor: notif.avatarColor}}>
                        {notif.user.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="notif-content">
                        <p>
                          <span className="notif-user">{notif.user}</span> 
                          <span className="notif-text"> {notif.text}</span>
                        </p>
                        
                        {notif.subtext && <p className="notif-subtext">{notif.subtext}</p>}
                        
                        {/* File Attachment Styling */}
                        {notif.hasFile && (
                          <div className="notif-file">
                            <FileText size={14} />
                            <span>Design_requirements.pdf</span>
                          </div>
                        )}
                        
                        <span className="notif-time">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="notif-footer">
                  <button>View all notifications</button>
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