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

  // --- UPDATED MOCK DATA (With Full Details) ---
  const allDefects = [
    { 
      id: 'DEF-101', vesselId: 'v1', vesselName: 'MT ALFA', 
      equipment: 'Main Engine #1', title: 'Fuel Pump Leak', 
      priority: 'Critical', status: 'Open', date: '2025-10-26', 
      comments: 4, 
      description: 'Heavy leakage observed near cylinder head during rounds. Risk of fire if not isolated immediately.', 
      remarks: 'Spares ordered. Temporary patch applied. Monitoring closely.',
      responsibility: 'Engine Dept'
    },
    { 
      id: 'DEF-205', vesselId: 'v2', vesselName: 'MT BRAVO', 
      equipment: 'Ballast Pump A', title: 'Vibration Alarm', 
      priority: 'High', status: 'In Progress', date: '2025-10-25', 
      comments: 1, 
      description: 'Vibration sensor reading > 12mm/s. Mounting bolts checked and found loose.', 
      remarks: 'Foundation bolts tightened. Vibration reduced to 8mm/s. Further monitoring required.',
      responsibility: 'Engine Dept'
    },
    { 
      id: 'DEF-303', vesselId: 'v3', vesselName: 'MT CHARLIE', 
      equipment: 'X-Band Radar', title: 'Magnetron Failure', 
      priority: 'Medium', status: 'Open', date: '2025-10-24', 
      comments: 2, 
      description: 'Radar picture very weak. Tuning check failed. Magnetron hours > 8000.', 
      remarks: 'Spare magnetron requested via PR-992. Using S-Band for now.',
      responsibility: 'Deck/Electrical'
    },
    { 
      id: 'DEF-102', vesselId: 'v1', vesselName: 'MT ALFA', 
      equipment: 'OWS', title: '15ppm Alarm', 
      priority: 'High', status: 'Open', date: '2025-10-23', 
      comments: 0, 
      description: '15ppm alarm sounding continuously even with clean water.', 
      remarks: 'Sensor cleaning attempted. Calibration check pending.',
      responsibility: 'Engine Dept'
    },
    { 
      id: 'DEF-404', vesselId: 'v4', vesselName: 'MT DELTA', 
      equipment: 'Generator #2', title: 'Low Oil Pressure', 
      priority: 'Critical', status: 'Open', date: '2025-10-22', 
      comments: 5, 
      description: 'Engine tripped on Low L.O. Pressure. Sump level normal.', 
      remarks: 'Filter opened, found metal particles. Bearing inspection required.',
      responsibility: 'Engine Dept'
    }
  ];

  // 1. FILTER
  const filteredDefects = allDefects.filter(d => selectedVessels.includes(d.vesselId));

  // 2. SLICE (Show only latest 5)
  const latestDefects = filteredDefects.slice(0, 5);

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
              <th>Thread</th>
              <th>Expand</th>
            </tr>
          </thead>
          <tbody>
            {latestDefects.length > 0 ? latestDefects.map((defect) => (
              <React.Fragment key={defect.id}>
                {/* MAIN ROW */}
                <tr className={expandedRow === defect.id ? 'expanded-active' : ''}>
                  <td style={{fontWeight: 'bold', color: '#0f172a'}}>{defect.vesselName}</td>
                  <td className="id-cell">{defect.id}</td>
                  <td>{defect.equipment}</td>
                  <td className="title-cell">{defect.title}</td>
                  <td><span className={`badge badge-${defect.priority.toLowerCase()}`}>{defect.priority}</span></td>
                  <td><span className={`status-dot ${defect.status.toLowerCase().replace(' ', '-')}`}></span>{defect.status}</td>
                  <td>
                    <button className="thread-btn">
                      <MessageSquare size={16} />
                      {defect.comments > 0 && <span className="msg-count">{defect.comments}</span>}
                    </button>
                  </td>
                  <td>
                    <button className="action-btn" onClick={() => toggleExpand(defect.id)}>
                      {expandedRow === defect.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </td>
                </tr>

                {/* --- DETAILED EXPANDED VIEW (MATCHING VESSEL LAYOUT) --- */}
                {expandedRow === defect.id && (
                  <tr className="detail-row">
                    <td colSpan="8">
                      <div className="detail-content">
                        
                        {/* 1. INFO GRID */}
                        <div className="detail-grid">
                          <div>
                            <strong>Description:</strong> 
                            <p>{defect.description}</p>
                          </div>
                          <div>
                            <strong>Ship Remarks:</strong> 
                            <p>{defect.remarks}</p>
                          </div>
                          <div>
                            <strong>Responsibility:</strong> 
                            <p>{defect.responsibility || 'Not Assigned'}</p>
                          </div>
                          <div>
                            <strong>Reported Date:</strong> 
                            <p>{defect.date}</p>
                          </div>
                        </div>

                        {/* 2. ACTION BUTTONS */}
                        <div className="detail-actions">
                          <button className="btn-action close-task">
                            <CheckCircle size={16} /> Approve Closure
                          </button>
                          <button className="btn-action edit">
                            <ShieldAlert size={16} /> Raise Priority
                          </button>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>No defects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShoreDashboard;