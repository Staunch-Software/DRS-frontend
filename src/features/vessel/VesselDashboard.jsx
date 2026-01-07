import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, Clock, ClipboardList, MessageSquare,
  ChevronDown, ChevronUp, Trash2, Edit, CheckCircle,
  Filter, RotateCcw, Paperclip, Download
} from 'lucide-react';
import { defectApi } from '../../services/defectApi';
import { blobUploadService } from '../../services/blobUploadService';
import { generateId } from '../../services/idGenerator';
import { useAuth } from '../../context/AuthContext'; // <--- IMPORT AUTH
import './Vessel.css';

/**
 * SUB-COMPONENT: ThreadSection
 * (Handles Chat - No changes needed here logic-wise)
 */
const ThreadSection = ({ defectId }) => {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['threads', defectId],
    queryFn: () => defectApi.getThreads(defectId),
    enabled: !!defectId
  });

  const handleReply = async () => {
    if (!replyText && files.length === 0) return;
    setIsUploading(true);
    try {
      const threadId = generateId();
      const uploadedAttachments = [];
      for (const file of files) {
        const attachmentId = generateId();
        const path = await blobUploadService.uploadBinary(file, defectId, attachmentId);
        uploadedAttachments.push({
          id: attachmentId, thread_id: threadId, file_name: file.name,
          file_size: file.size, content_type: file.type, blob_path: path
        });
      }
      await defectApi.createThread({
        id: threadId, defect_id: defectId,
        author: "Chief Engineer",
        body: replyText
      });
      for (const meta of uploadedAttachments) {
        await defectApi.createAttachment(meta);
      }
      setReplyText(""); setFiles([]);
      queryClient.invalidateQueries(['threads', defectId]);
    } catch (err) {
      alert("Failed to send: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="modal-body">Loading conversation...</div>;

  return (
    <>
      <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {threads.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8' }}>No messages yet.</p>}
        {threads.map(t => (
          <div key={t.id} className={`chat-msg ${t.author.includes('Engineer') ? '' : 'shore'}`} style={{ marginBottom: '15px' }}>
            <strong>{t.author}:</strong>
            <p>{t.body}</p>
            {t.attachments?.map(a => (
              <a key={a.id} href={a.blob_path} target="_blank" rel="noreferrer" className="att-link" style={{ fontSize: '12px', display: 'block', color: '#3b82f6' }}>
                <Download size={12} /> {a.file_name}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="modal-footer">
        <div style={{ width: '100%' }}>
          <textarea
            className="input-field area"
            placeholder="Type reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            style={{ marginBottom: '10px', width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
              <Paperclip size={16} />
              <input type="file" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files))} />
              {files.length > 0 ? `${files.length} files` : 'Attach Files'}
            </label>
            <button className="btn-primary" onClick={handleReply} disabled={isUploading}>
              {isUploading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const VesselDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // <--- GET USER CONTEXT

  // --- GET ASSIGNED VESSEL IMO ---
  // Since 'assignedVessels' is an array of strings like ['9832913']
  const vesselImo = user?.assignedVessels?.[0] || '';

  // --- STATES ---
  const [expandedRow, setExpandedRow] = useState(null);
  const [openThreadRow, setOpenThreadRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('High,Critical');

  // --- API QUERY (FILTERED BY IMO) ---
  const { data: defects = [], isLoading } = useQuery({
    queryKey: ['defects', vesselImo], // Unique cache key per ship
    queryFn: () => defectApi.getDefects(vesselImo), // Pass IMO to API
    enabled: !!vesselImo // Only run if we have an IMO
  });

  // --- KPI CALCULATIONS ---
  const openCount = defects.filter(d => d.status === 'OPEN').length;
  const inProgressCount = defects.filter(d => d.status === 'IN_PROGRESS').length;
  const highPriorityCount = defects.filter(d => d.priority === 'HIGH' || d.priority === 'CRITICAL').length;

  // --- FILTER LOGIC ---
  const filteredDefects = defects.filter(defect => {
    const matchStatus = statusFilter === 'All' || defect.status === statusFilter.toUpperCase().replace(' ', '_');
    const matchPriority = priorityFilter === 'High,Critical'
      ? (defect.priority === 'HIGH' || defect.priority === 'CRITICAL')
      : defect.priority === priorityFilter.toUpperCase();
    return matchStatus && matchPriority;
  });

  // --- ACTIONS ---
  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    setOpenThreadRow(null);
  };

  const toggleThread = (id) => {
    setOpenThreadRow(openThreadRow === id ? null : id);
    setExpandedRow(null);
  };

  const handleEdit = (defect) => {
    navigate('/vessel/create', { state: { defectToEdit: defect } });
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('High,Critical');
  };

  // Inside VesselDashboard component body
  const queryClient = useQueryClient();

  const handleCloseDefect = async (id) => {
    if (window.confirm("Are you sure you want to mark this defect as CLOSED?")) {
      try {
        await defectApi.closeDefect(id);
        alert("Defect closed successfully.");
        // Refresh the list automatically
        queryClient.invalidateQueries(['defects', vesselImo]);
      } catch (err) {
        alert("Failed to close defect: " + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to REMOVE this defect? It will be archived for audit purposes.")) {
      try {
        await defectApi.deleteDefect(id);
        alert("Defect removed.");
        // Refresh the list automatically
        queryClient.invalidateQueries(['defects', vesselImo]);
      } catch (err) {
        alert("Failed to remove defect: " + err.message);
      }
    }
  };
  
  if (isLoading) return <div className="dashboard-container">Loading Cloud Data...</div>;

  // Handle case where user has no assigned ship
  if (!vesselImo) return <div className="dashboard-container"><h3>No Vessel Assigned to this User.</h3></div>;

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Vessel Overview</h1>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data"><h2>{openCount}</h2><p>Open Defects</p></div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon"><Clock size={24} /></div>
          <div className="kpi-data"><h2>{inProgressCount}</h2><p>In Progress</p></div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data"><h2>{highPriorityCount}</h2><p>High Priority</p></div>
        </div>
        <div className="kpi-card green clickable-card" onClick={() => navigate('/vessel/tasks')}>
          <div className="kpi-icon"><ClipboardList size={24} /></div>
          <div className="kpi-data"><h2>{defects.length}</h2><p>Total Reported</p></div>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="section-header-with-filters">
        <h3>Active Defects ({filteredDefects.length})</h3>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <div className="filter-group">
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="High,Critical">High & Critical</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
            </select>
          </div>

          {(statusFilter !== 'All' || priorityFilter !== 'High,Critical') && (
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
                  <tr className={expandedRow === defect.id ? 'expanded-active' : ''}>
                    <td className="id-cell">{defect.id.substring(0, 8)}</td>
                    <td>{defect.equipment_name}</td>
                    <td className="title-cell">{defect.title}</td>
                    <td>
                      <span className={`badge badge-${defect.priority.toLowerCase()}`}>
                        {defect.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${defect.status.toLowerCase().replace('_', '-')}`}></span>
                      {defect.status.replace('_', ' ')}
                    </td>
                    <td>
                      <button className="thread-btn" onClick={(e) => { e.stopPropagation(); toggleThread(defect.id); }}>
                        <MessageSquare size={16} />
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
                            <div><strong>Ship Remarks:</strong> <p>{defect.ships_remarks || 'None'}</p></div>
                            <div><strong>Responsibility:</strong> <p>{defect.responsibility}</p></div>
                            <div><strong>Date:</strong> <p>{new Date(defect.date_identified).toLocaleDateString()}</p></div>
                          </div>
                          <div className="detail-actions">
                            <button className="btn-action edit" onClick={() => handleEdit(defect)}>
                              <Edit size={16} /> Update
                            </button>
                            <button className="btn-action close-task">
                              <CheckCircle size={16} /> Close
                            </button>
                            <button className="btn-action delete">
                              <Trash2 size={16} /> Remove
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {openThreadRow === defect.id && (
                    <tr className="detail-row">
                      <td colSpan="7">
                        <div className="detail-content">
                          <ThreadSection defectId={defect.id} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr><td colSpan="7" className="empty-filter-state">No defects match your filter criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VesselDashboard;