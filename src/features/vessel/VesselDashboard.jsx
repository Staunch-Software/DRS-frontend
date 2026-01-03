import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Clock, ClipboardList, MessageSquare, 
  ChevronDown, ChevronUp, Trash2, Edit, CheckCircle, X,
  Filter, RotateCcw // New Icons
} from 'lucide-react';
import './Vessel.css'; 

const VesselDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // MOCK DATA
  const [defects, setDefects] = useState([
    { 
      id: 'DEF-001', equipment: 'Main Engine #1', title: 'Fuel Pump Leak detected', 
      priority: 'Critical', status: 'Open', date: '2025-10-26', comments: 4,
      description: 'Heavy leakage observed near cylinder head during rounds.', 
      remarks: 'Spares ordered. Temporary patch applied.',
      responsibility: 'Engine Dept'
    },
    { 
      id: 'DEF-002', equipment: 'Ballast Pump A', title: 'Vibration high alarm', 
      priority: 'High', status: 'In Progress', date: '2025-10-25', comments: 1,
      description: 'Vibration sensor reading > 12mm/s. Mounting bolts checked.', 
      remarks: 'Foundation bolts tightened. Monitoring continued.',
      responsibility: 'Engine Dept'
    },
    { 
      id: 'DEF-003', equipment: 'Galley Oven', title: 'Thermostat malfunction', 
      priority: 'Normal', status: 'Open', date: '2025-10-24', comments: 0,
      description: 'Oven not holding temperature. Food not cooking evenly.', 
      remarks: 'Electrician checked fuse. Thermostat replacement required.',
      responsibility: 'Electrical'
    },
    { 
      id: 'DEF-004', equipment: 'Radar Scanner', title: 'Motor Belt Loose', 
      priority: 'Medium', status: 'In Progress', date: '2025-10-22', comments: 2,
      description: 'Scanner rotation uneven.', 
      remarks: 'Tightened belt.',
      responsibility: 'Deck Dept'
    }
  ]);

  // --- FILTER LOGIC ---
  const filteredDefects = defects.filter(defect => {
    const matchStatus = statusFilter === 'All' || defect.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || defect.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  // --- ACTIONS ---
  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);
  
  const openThread = (defect) => {
    setActiveThread(defect);
    setIsModalOpen(true);
  };

  const handleEdit = (defect) => {
    navigate('/vessel/create', { state: { defectToEdit: defect } });
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this defect?")) {
      setDefects(defects.filter(d => d.id !== id));
    }
  };

  const handleCloseDefect = (id) => {
    if(window.confirm("Mark this defect as Closed? It will move to History.")) {
      setDefects(defects.filter(d => d.id !== id));
    }
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Vessel Overview</h1>

      {/* KPI CARDS (Unchanged) */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data"><h2>{defects.length}</h2><p>Open Defects</p></div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon"><Clock size={24} /></div>
          <div className="kpi-data"><h2>5</h2><p>In Progress</p></div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data"><h2>3</h2><p>High Priority</p></div>
        </div>
        <div className="kpi-card green clickable-card" onClick={() => navigate('/vessel/tasks')}>
          <div className="kpi-icon"><ClipboardList size={24} /></div>
          <div className="kpi-data"><h2>8</h2><p>My Assigned Tasks</p></div>
        </div>
      </div>

      {/* --- FILTER BAR HEADER --- */}
      <div className="section-header-with-filters">
        <h3>Active Defects ({filteredDefects.length})</h3>
        
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <div className="filter-group">
            <select 
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          {(statusFilter !== 'All' || priorityFilter !== 'All') && (
            <button className="reset-btn" onClick={resetFilters} title="Reset Filters">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
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
            {filteredDefects.length > 0 ? (
              filteredDefects.map((defect) => (
                <React.Fragment key={defect.id}>
                  {/* MAIN ROW */}
                  <tr className={expandedRow === defect.id ? 'expanded-active' : ''}>
                    <td className="id-cell">{defect.id}</td>
                    <td>{defect.equipment}</td>
                    <td className="title-cell">{defect.title}</td>
                    <td>
                      <span className={`badge badge-${defect.priority.toLowerCase()}`}>
                        {defect.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${defect.status.toLowerCase().replace(' ', '-')}`}></span>
                      {defect.status}
                    </td>
                    <td>
                      <button className="thread-btn" onClick={(e) => { e.stopPropagation(); openThread(defect); }}>
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

                  {/* EXPANDED DETAILS */}
                  {expandedRow === defect.id && (
                    <tr className="detail-row">
                      <td colSpan="7">
                        <div className="detail-content">
                          <div className="detail-grid">
                            <div><strong>Description:</strong> <p>{defect.description}</p></div>
                            <div><strong>Ship Remarks:</strong> <p>{defect.remarks}</p></div>
                            <div><strong>Responsibility:</strong> <p>{defect.responsibility}</p></div>
                            <div><strong>Date:</strong> <p>{defect.date}</p></div>
                          </div>
                          <div className="detail-actions">
                            <button className="btn-action edit" onClick={() => handleEdit(defect)}>
                              <Edit size={16} /> Update
                            </button>
                            <button className="btn-action close-task" onClick={() => handleCloseDefect(defect.id)}>
                              <CheckCircle size={16} /> Close
                            </button>
                            <button className="btn-action delete" onClick={() => handleDelete(defect.id)}>
                              <Trash2 size={16} /> Remove
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              // EMPTY STATE IF FILTER RETURNS NOTHING
              <tr>
                <td colSpan="7" className="empty-filter-state">
                  No defects match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CODE (Same as before) */}
      {isModalOpen && activeThread && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Discussion: {activeThread.title}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="chat-msg shore">
                <strong>Supt. James:</strong> <p>Please update status.</p>
              </div>
            </div>
            <div className="modal-footer">
               <input type="text" placeholder="Type reply..." />
               <button className="btn-primary">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VesselDashboard;