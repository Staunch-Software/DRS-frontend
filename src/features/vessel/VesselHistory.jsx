import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, ChevronDown, ChevronUp, Trash2, Edit, CheckCircle,
  Filter, RotateCcw, Send, Paperclip, Download
} from 'lucide-react';
import { defectApi } from '../../services/defectApi';
import { blobUploadService } from '../../services/blobUploadService';
import { generateId } from '../../services/idGenerator';
import { useAuth } from '../../context/AuthContext';

/**
 * SUB-COMPONENT: ThreadSection
 */
const ThreadSection = ({ defectId }) => {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuth();

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
        {threads.map(t => {
          const isMyMessage = t.user_id ? (t.user_id === user?.id) : (t.author === user?.name);
          return (
            <div key={t.id} className={`chat-msg ${isMyMessage ? '' : 'shore'}`} style={{ marginBottom: '15px' }}>
              <strong>{t.author}:</strong>
              <p>{t.body}</p>
              {t.attachments?.map(a => (
                <a
                  key={a.id}
                  href={a.blob_path}
                  target="_blank"
                  rel="noreferrer"
                  className="att-link"
                  style={{ fontSize: '12px', display: 'block', color: '#3b82f6' }}
                >
                  <Download size={12} /> {a.file_name}
                </a>
              ))}
            </div>
          );
        })}
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

const VesselHistory = () => {
  const navigate = useNavigate();

      // --- STATES ---
      const [expandedRow, setExpandedRow] = useState(null);
      const [openThreadRow, setOpenThreadRow] = useState(null);
      const [statusFilter, setStatusFilter] = useState('All');
      const [priorityFilter, setPriorityFilter] = useState('All');

      // --- API QUERY ---
      const {data: defects = [], isLoading } = useQuery({
        queryKey: ['defects', 'all-defects'],
    queryFn: () => defectApi.getDefects()
  });

  // --- FILTER LOGIC ---
  const filteredDefects = defects.filter(defect => {
    const matchStatus = statusFilter === 'All' || defect.status === statusFilter.toUpperCase().replace(' ', '_');
      const matchPriority = priorityFilter === 'All' || defect.priority === priorityFilter.toUpperCase();
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
      setPriorityFilter('All');
  };

      if (isLoading) return <div className="dashboard-container">Loading Defects...</div>;

      return (
      <div className="dashboard-container">
        <h1 className="page-title">All Defects</h1>

        {/* --- FILTER BAR --- */}
        <div className="section-header-with-filters">
          <h3>Defects ({filteredDefects.length})</h3>

          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={14} className="filter-icon" />
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
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

                    {/* THREAD ROW */}
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

      export default VesselHistory;