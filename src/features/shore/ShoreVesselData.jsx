import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  MessageSquare, ChevronDown, ChevronUp, CheckCircle, ShieldAlert, Filter, RotateCcw 
} from 'lucide-react';

const ShoreVesselData = () => {
  const { selectedVessels } = useOutletContext(); 
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Local filters for this page
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // MOCK DATA (Same as dashboard, but here we show ALL of it)
  const allDefects = [
    { id: 'DEF-101', vesselId: 'v1', vesselName: 'MT ALFA', equipment: 'Main Engine', title: 'Fuel Pump Leak', priority: 'Critical', status: 'Open', date: '2025-10-26', comments: 4, description: 'Leakage.', remarks: 'Spare ordered.' },
    { id: 'DEF-205', vesselId: 'v2', vesselName: 'MT BRAVO', equipment: 'Ballast Pump', title: 'Vibration Alarm', priority: 'High', status: 'In Progress', date: '2025-10-25', comments: 1, description: 'High vibration.', remarks: 'Checking bolts.' },
    { id: 'DEF-303', vesselId: 'v3', vesselName: 'MT CHARLIE', equipment: 'Radar', title: 'Magnetron Failure', priority: 'Medium', status: 'Open', date: '2025-10-24', comments: 2, description: 'No signal.', remarks: 'Spare needed.' },
    { id: 'DEF-102', vesselId: 'v1', vesselName: 'MT ALFA', equipment: 'OWS', title: '15ppm Alarm', priority: 'High', status: 'Open', date: '2025-10-23', comments: 0, description: 'Alarm sounding.', remarks: 'Cleaning filters.' },
    { id: 'DEF-404', vesselId: 'v4', vesselName: 'MT DELTA', equipment: 'Generator', title: 'Low Oil Pressure', priority: 'Critical', status: 'Open', date: '2025-10-22', comments: 5, description: 'Trip on LOP.', remarks: 'Investigating.' },
    { id: 'DEF-405', vesselId: 'v4', vesselName: 'MT DELTA', equipment: 'Boiler', title: 'Ignition Failure', priority: 'Normal', status: 'In Progress', date: '2025-10-21', comments: 0, description: 'Flame failure.', remarks: 'Sensor cleaned.' },
  ];

  // LOGIC: 
  // 1. Filter by Sidebar Selection (Vessels)
  // 2. Filter by Local Dropdowns (Status/Priority)
  const filteredDefects = allDefects.filter(d => {
    const vesselMatch = selectedVessels.includes(d.vesselId);
    const statusMatch = statusFilter === 'All' || d.status === statusFilter;
    const priorityMatch = priorityFilter === 'All' || d.priority === priorityFilter;
    return vesselMatch && statusMatch && priorityMatch;
  });

  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <h1 className="page-title">Vessel Data ({filteredDefects.length})</h1>
        
        {/* LOCAL FILTERS */}
        <div className="filter-controls">
          <div className="filter-group">
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div className="filter-group">
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
          <button className="reset-btn" onClick={() => {setStatusFilter('All'); setPriorityFilter('All')}} title="Reset">
            <RotateCcw size={14} />
          </button>
        </div>
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
            {filteredDefects.length > 0 ? filteredDefects.map((defect) => (
              <React.Fragment key={defect.id}>
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

                {expandedRow === defect.id && (
                  <tr className="detail-row">
                    <td colSpan="8">
                      <div className="detail-content">
                        <div className="detail-grid">
                          <div><strong>Description:</strong> <p>{defect.description}</p></div>
                          <div><strong>Ship Remarks:</strong> <p>{defect.remarks}</p></div>
                          <div><strong>Date:</strong> <p>{defect.date}</p></div>
                        </div>
                        <div className="detail-actions">
                          <button className="btn-action close-task"><CheckCircle size={16} /> Approve Closure</button>
                          <button className="btn-action edit"><ShieldAlert size={16} /> Raise Priority</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>No defects found for selected criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShoreVesselData;