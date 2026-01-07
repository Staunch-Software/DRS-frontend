import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, Clock, ClipboardList, MessageSquare,
  ChevronDown, ChevronUp, CheckCircle, ShieldAlert, Send, Paperclip, Download
} from 'lucide-react';

// Phase 1 Services
import { defectApi } from '../../services/defectApi';
import { blobUploadService } from '../../services/blobUploadService';
import { generateId } from '../../services/idGenerator';
import { useAuth } from '../../context/AuthContext';

/**
 * SUB-COMPONENT: ThreadSection
 * Handles the conversation and replies for the Shore UI
 */
const ThreadSection = ({ defectId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mentionList, setMentionList] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  // 1. Fetch Threads
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['threads', defectId],
    queryFn: () => defectApi.getThreads(defectId),
    enabled: !!defectId
  });

  const { data: vesselUsers = [] } = useQuery({
    queryKey: ['vessel-users', defectId],
    queryFn: () => defectApi.getVesselUsers(defectId),
    enabled: !!defectId
  });

  const handleTextChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    setReplyText(text);
    setCursorPosition(cursorPos);

    // Detect @ symbol
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || text[lastAtIndex - 1] === ' ')) {
      const searchTerm = textBeforeCursor.slice(lastAtIndex + 1);
      setMentionSearch(searchTerm);
      const filtered = vesselUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMentionList(filtered);
      setShowMentions(filtered.length > 0);
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (user) => {
    const textBeforeCursor = replyText.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = replyText.slice(cursorPosition);

    const newText = replyText.slice(0, lastAtIndex) + `@${user.name} ` + textAfterCursor;
    setReplyText(newText);
    setTaggedUsers([...taggedUsers, user.id]);
    setShowMentions(false);
  };

  // 2. Reply Logic (Blob-First)
  const handleReply = async () => {
    if (!replyText && files.length === 0) return;
    setIsUploading(true);

    try {
      const threadId = generateId();
      const uploadedAttachments = [];

      // A. Upload to Azure FIRST
      for (const file of files) {
        const attachmentId = generateId();
        const path = await blobUploadService.uploadBinary(file, defectId, attachmentId);
        uploadedAttachments.push({
          id: attachmentId,
          thread_id: threadId,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          blob_path: path
        });
      }

      // B. Save Thread Metadata
      await defectApi.createThread({
        id: threadId,
        defect_id: defectId,
        author: "Superintendent", // In production, this comes from AuthContext
        body: replyText,
        tagged_user_ids: taggedUsers
      });
      setTaggedUsers([]);

      // C. Save Attachment Metadata
      for (const meta of uploadedAttachments) {
        await defectApi.createAttachment(meta);
      }

      setReplyText("");
      setFiles([]);
      queryClient.invalidateQueries(['threads', defectId]);
    } catch (err) {
      alert("Failed to send reply: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div style={{ padding: '20px', color: '#64748b' }}>Loading conversation...</div>;

  return (
    <div className="thread-section-wrapper" style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div className="thread-history" style={{ marginBottom: '20px' }}>
        {threads.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No messages yet.</p>
        ) : (
          threads.map(t => {
            const isMyMessage = t.user_id === user?.id;
            return (
              <div key={t.id} style={{ display: 'flex', justifyContent: isMyMessage ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
                <div style={{ maxWidth: '70%', padding: '12px', background: isMyMessage ? '#dcf8c6' : 'white', borderRadius: isMyMessage ? '12px 12px 2px 12px' : '12px 12px 12px 2px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', gap: '10px' }}>
                    <strong style={{ fontSize: '13px', color: isMyMessage ? '#065f46' : '#1e293b' }}>{t.author}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#334155', margin: '0' }}>
                    {t.body.split(/(@[\w\s]+)/g).map((part, i) =>
                      part.startsWith('@') ? <span key={i} style={{ color: '#3b82f6', fontWeight: '600' }}>{part}</span> : part
                    )}
                  </p>
                  {t.attachments?.map(a => (
                    <a key={a.id} href={a.blob_path} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '12px', color: '#3b82f6', marginTop: '5px', textDecoration: 'none' }}>
                      <Download size={12} /> {a.file_name}
                    </a>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="reply-box">
        <textarea
          className="input-field"
          placeholder="Type a reply (use @ to mention)..."
          value={replyText}
          onChange={handleTextChange}
          style={{ width: '100%', minHeight: '80px', marginBottom: '10px', position: 'relative' }}
        />
        {showMentions && (
          <div style={{ position: 'absolute', bottom: '120px', left: '20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, minWidth: '200px' }}>
            {mentionList.map(u => (
              <div key={u.id} onClick={() => selectMention(u)} style={{ padding: '10px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                {u.name}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b' }}>
            <Paperclip size={16} />
            <input type="file" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files))} />
            {files.length > 0 ? `${files.length} files attached` : 'Attach Files'}
          </label>
          <button className="btn-primary" onClick={handleReply} disabled={isUploading}>
            <Send size={16} /> {isUploading ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShoreDashboard = () => {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);
  const [openThreadRow, setOpenThreadRow] = useState(null);

  // --- QUERY: FETCH ALL DEFECTS ---
  const { data: defects = [], isLoading } = useQuery({
    queryKey: ['defects', 'global-list'],
    queryFn: () => defectApi.getDefects()
  });

  // --- KPI CALCULATIONS (Dynamic) ---
  const openCount = defects.filter(d => d.status === 'OPEN').length;
  const inProgressCount = defects.filter(d => d.status === 'IN_PROGRESS').length;
  const highPriorityCount = defects.filter(d => d.priority === 'HIGH' || d.priority === 'CRITICAL').length;

  // --- LATEST 5 LOGIC ---
  const latestDefects = [...defects]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    setOpenThreadRow(null); // Close thread when expanding details
  };

  const toggleThread = (id) => {
    setOpenThreadRow(openThreadRow === id ? null : id);
    setExpandedRow(null); // Close details when opening thread
  };
  if (isLoading) return <div className="dashboard-container">Loading Fleet Overview...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Fleet Overview</h1>

      {/* KPI CARDS (Now Dynamic) */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data">
            <h2>{openCount}</h2>
            <p>Open Defects</p>
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon"><Clock size={24} /></div>
          <div className="kpi-data">
            <h2>{inProgressCount}</h2>
            <p>In Progress</p>
          </div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-icon"><AlertTriangle size={24} /></div>
          <div className="kpi-data">
            <h2>{highPriorityCount}</h2>
            <p>High Priority</p>
          </div>
        </div>

        <div className="kpi-card green clickable-card" onClick={() => navigate('/shore/tasks')}>
          <div className="kpi-icon"><ClipboardList size={24} /></div>
          <div className="kpi-data"><h2>5</h2><p>My Tasks</p></div>
        </div>
      </div>

      <div className="section-header">
        <h3>Latest 5 Defects (Global)</h3>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vessel Name</th>
              <th>IMO</th>
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
                  <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{defect.vessel_name || 'Unknown'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>{defect.vessel_imo}</td>
                  <td>{defect.equipment_name}</td>
                  <td className="title-cell">{defect.title}</td>
                  <td><span className={`badge badge-${defect.priority.toLowerCase()}`}>{defect.priority}</span></td>
                  <td><span className={`status-dot ${defect.status.toLowerCase().replace('_', '-')}`}></span>{defect.status.replace('_', ' ')}</td>
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

                {/* EXPANDED DETAILS - WITHOUT THREAD */}
                {expandedRow === defect.id && (
                  <tr className="detail-row">
                    <td colSpan="8" style={{ padding: 0 }}>
                      <div className="detail-content">
                        {/* 1. INFO GRID */}
                        <div className="detail-grid" style={{ padding: '20px' }}>
                          <div>
                            <strong>Description:</strong>
                            <p>{defect.description}</p>
                          </div>
                          <div>
                            <strong>Ship Remarks:</strong>
                            <p>{defect.ships_remarks || 'No remarks provided.'}</p>
                          </div>
                          <div>
                            <strong>Responsibility:</strong>
                            <p>{defect.responsibility || 'Not Assigned'}</p>
                          </div>
                          <div>
                            <strong>Reported Date:</strong>
                            <p>{new Date(defect.date_identified).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* 2. ACTION BUTTONS */}
                        <div className="detail-actions" style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
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

                {/* THREAD ROW - SEPARATE */}
                {openThreadRow === defect.id && (
                  <tr className="detail-row">
                    <td colSpan="8" style={{ padding: 0 }}>
                      <div className="detail-content">
                        <ThreadSection defectId={defect.id} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No defects found in the cloud database.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShoreDashboard;