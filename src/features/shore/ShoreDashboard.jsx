import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Clock, ClipboardList, MessageSquare, 
  ChevronDown, ChevronUp, CheckCircle, ShieldAlert
} from 'lucide-react';

const ShoreDashboard = () => {
  const navigate = useNavigate();
  const { selectedVessels } = useOutletContext(); 
  const [expandedRow, setExpandedRow] = useState(null);

  // MOCK DATA (Ideally this comes from API)
  const allDefects = [
    { id: 'DEF-101', vesselId: 'v1', vesselName: 'MT ALFA', equipment: 'Main Engine', title: 'Fuel Pump Leak', priority: 'Critical', status: 'Open', date: '2025-10-26', comments: 4, description: 'Leakage.', remarks: 'Spare ordered.' },
    { id: 'DEF-205', vesselId: 'v2', vesselName: 'MT BRAVO', equipment: 'Ballast Pump', title: 'Vibration Alarm', priority: 'High', status: 'In Progress', date: '2025-10-25', comments: 1, description: 'High vibration.', remarks: 'Checking bolts.' },
    { id: 'DEF-303', vesselId: 'v3', vesselName: 'MT CHARLIE', equipment: 'Radar', title: 'Magnetron Failure', priority: 'Medium', status: 'Open', date: '2025-10-24', comments: 2, description: 'No signal.', remarks: 'Spare needed.' },
    { id: 'DEF-102', vesselId: 'v1', vesselName: 'MT ALFA', equipment: 'OWS', title: '15ppm Alarm', priority: 'High', status: 'Open', date: '2025-10-23', comments: 0, description: 'Alarm sounding.', remarks: 'Cleaning filters.' },
    { id: 'DEF-404', vesselId: 'v4', vesselName: 'MT DELTA', equipment: 'Generator', title: 'Low Oil Pressure', priority: 'Critical', status: 'Open', date: '2025-10-22', comments: 5, description: 'Trip on LOP.', remarks: 'Investigating.' },
    { id: 'DEF-405', vesselId: 'v4', vesselName: 'MT DELTA', equipment: 'Boiler', title: 'Ignition Failure', priority: 'Normal', status: 'In Progress', date: '2025-10-21', comments: 0, description: 'Flame failure.', remarks: 'Sensor cleaned.' },
  ];

  // 1. FILTER & SLICE
  const filteredDefects = allDefects.filter(d => selectedVessels.includes(d.vesselId));
  const latestDefects = filteredDefects.slice(0, 5); // ONLY SHOW 5

  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Fleet Overview</h1>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data">
            <h2>{filteredDefects.filter(d => d.status === 'Open').length}</h2>
            <p>Open Defects</p>
          </div>
        </div>
        
        <div className="kpi-card orange">
          <div className="kpi-icon"><Clock size={24} /></div>
          <div className="kpi-data">
            <h2>{filteredDefects.filter(d => d.status === 'In Progress').length}</h2>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="kpi-card red">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data">
            <h2>{filteredDefects.filter(d => d.priority === 'Critical' || d.priority === 'High').length}</h2>
            <p>High Priority</p>
          </div>
        </div>
        
        <div className="kpi-card green clickable-card" onClick={() => navigate('/shore/tasks')}>
          <div className="kpi-icon"><ClipboardList size={24} /></div>
          <div className="kpi-data"><h2>5</h2><p>My Tasks</p></div>
        </div>
      </div>

      <div className="section-header">
        <h3>Latest 5 Defects (Filtered)</h3>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>ID</th>
              <th>Equipment</th>
              <th>Defect Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Expand</th>
            </tr>
          </thead>
          <tbody>
            {latestDefects.length > 0 ? latestDefects.map((defect) => (
              <React.Fragment key={defect.id}>
                <tr className={expandedRow === defect.id ? 'expanded-active' : ''}>
                  <td style={{fontWeight: 'bold', color: '#0f172a'}}>{defect.vesselName}</td>
                  <td className="id-cell">{defect.id}</td>
                  <td>{defect.equipment}</td>
                  <td className="title-cell">{defect.title}</td>
                  <td><span className={`badge badge-${defect.priority.toLowerCase()}`}>{defect.priority}</span></td>
                  <td><span className={`status-dot ${defect.status.toLowerCase().replace(' ', '-')}`}></span>{defect.status}</td>
                  <td>
                    <button className="action-btn" onClick={() => toggleExpand(defect.id)}>
                      {expandedRow === defect.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                </tr>
                {/* Simplified expand for dashboard */}
                {expandedRow === defect.id && (
                  <tr className="detail-row"><td colSpan="7"><div className="detail-content"><p>{defect.description}</p></div></td></tr>
                )}
              </React.Fragment>
            )) : (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No defects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShoreDashboard;