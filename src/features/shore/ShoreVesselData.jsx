import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVessel, getVessels } from '../../api/vessels';
import { defectApi } from '../../services/defectApi'; // Centralized API service
import { blobUploadService } from '../../services/blobUploadService';
import { generateId } from '../../services/idGenerator';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare, CheckCircle, Plus, X, Ship, Mail, Filter,
  Search, ChevronDown, ChevronUp, Check, Send, Paperclip, Download
} from 'lucide-react';

/**
 * SUB-COMPONENT: ThreadSection
 * Handles the conversation dropdown logic
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

  // 1. Fetch Threads for this specific defect
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

  // 2. Reply Logic (Blob-First, Metadata-Second)
  const handleReply = async () => {
    if (!replyText && files.length === 0) return;
    setIsUploading(true);

    try {
      const threadId = generateId();
      const uploadedAttachments = [];

      // A. BLOB-FIRST: Upload files to Azure
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

      // B. METADATA-SECOND: Save Thread
      await defectApi.createThread({
        id: threadId,
        defect_id: defectId,
        author: "Superintendent",
        body: replyText,
        tagged_user_ids: taggedUsers
      });
      setTaggedUsers([]);

      // C. METADATA-SECOND: Save Attachment Records
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

  if (isLoading) return <div style={{ padding: '20px', color: '#64748b', fontSize: '13px' }}>Loading conversation...</div>;

  return (
    <div className="thread-expand-container" style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      {/* Message History */}
      <div className="thread-history" style={{ marginBottom: '20px' }}>
        {threads.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No conversation history.</p>
        ) : (
          threads.map(t => {
            const isMyMessage = t.user_id === user?.id;
            return (
              <div key={t.id} style={{ display: 'flex', justifyContent: isMyMessage ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
                <div style={{ maxWidth: '70%', padding: '12px', background: isMyMessage ? '#dcf8c6' : 'white', borderRadius: isMyMessage ? '12px 12px 2px 12px' : '12px 12px 12px 2px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: isMyMessage ? '#065f46' : '#1e293b' }}>{t.author}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#334155', margin: '0' }}>
                    {t.body.split(/(@[\w\s]+)/g).map((part, i) =>
                      part.startsWith('@') ? <span key={i} style={{ color: '#3b82f6', fontWeight: '600' }}>{part}</span> : part
                    )}
                  </p>

                  {t.attachments?.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {t.attachments.map(a => (
                        <a key={a.id} href={a.blob_path} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3b82f6', textDecoration: 'none', padding: '4px 8px', background: '#eff6ff', borderRadius: '4px' }}>
                          <Download size={12} /> {a.file_name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Input */}
      <div className="reply-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="file" multiple id={`file-reply-${defectId}`} onChange={(e) => setFiles(Array.from(e.target.files))} hidden />
            <label htmlFor={`file-reply-${defectId}`} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
              <Paperclip size={14} /> {files.length > 0 ? `${files.length} files` : 'Attach Files'}
            </label>
          </div>
          <button className="btn-primary" onClick={handleReply} disabled={isUploading || (!replyText && files.length === 0)}>
            <Send size={14} /> {isUploading ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShoreVesselData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [vesselSearch, setVesselSearch] = useState('');
  const [selectedImos, setSelectedImos] = useState([]);
  const [expandedDefectId, setExpandedDefectId] = useState(null); // <--- RESTORED

  const { data: vesselList = [] } = useQuery({ queryKey: ['vessels'], queryFn: getVessels });
  const { data: allDefects = [], isLoading: isDefectsLoading } = useQuery({ queryKey: ['defects', 'all'], queryFn: () => defectApi.getDefects() });

  useEffect(() => {
    if (vesselList.length > 0 && selectedImos.length === 0) {
      setSelectedImos(vesselList.map(v => v.imo_number));
    }
  }, [vesselList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleVessel = (imo) => {
    setSelectedImos(prev => prev.includes(imo) ? prev.filter(id => id !== imo) : [...prev, imo]);
  };

  const toggleSelectAll = () => {
    setSelectedImos(selectedImos.length === vesselList.length ? [] : vesselList.map(v => v.imo_number));
  };

  const filteredDefects = allDefects.filter(defect => selectedImos.includes(defect.vessel_imo));

  const [formData, setFormData] = useState({ name: '', imo_number: '', vessel_type: 'Oil Tanker', email: '' });
  const addVesselMutation = useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      alert("Vessel Added Successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', imo_number: '', vessel_type: 'Oil Tanker', email: '' });
      queryClient.invalidateQueries(['vessels']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.imo_number.length !== 7) return alert("IMO Number must be 7 digits.");
    addVesselMutation.mutate(formData);
  };

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <div>
          <h1 className="page-title">Defect Overview</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Showing <strong>{filteredDefects.length}</strong> defects from <strong>{selectedImos.length}</strong> vessels.
          </p>
        </div>

        <div className="filter-controls">
          {/* Vessel Filter Dropdown */}
          <div className="custom-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button className="filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', minWidth: '200px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={14} color="#64748b" />
                <span style={{ fontSize: '13px', color: '#334155' }}>{selectedImos.length === vesselList.length ? 'All Vessels' : `${selectedImos.length} Selected`}</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {isFilterOpen && (
              <div className="dropdown-menu" style={{ position: 'absolute', top: '45px', right: '0', width: '280px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 100, padding: '10px' }}>
                <input type="text" placeholder="Search ships..." value={vesselSearch} onChange={(e) => setVesselSearch(e.target.value)} style={{ width: '90%', padding: '6px 10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }} />
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <div onClick={toggleSelectAll} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', border: '1px solid #cbd5e1', borderRadius: '4px', background: selectedImos.length === vesselList.length ? '#3b82f6' : 'white' }}>
                      {selectedImos.length === vesselList.length && <Check size={12} color="white" />}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Select All</span>
                  </div>
                  {vesselList.filter(v => v.name.toLowerCase().includes(vesselSearch.toLowerCase())).map(v => (
                    <div key={v.imo_number} onClick={() => toggleVessel(v.imo_number)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer' }}>
                      <div style={{ width: '16px', height: '16px', border: '1px solid #cbd5e1', borderRadius: '4px', background: selectedImos.includes(v.imo_number) ? '#3b82f6' : 'white' }}>
                        {selectedImos.includes(v.imo_number) && <Check size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: '13px' }}>{v.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user?.role === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Register Vessel
            </button>
          )}
        </div>
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
            </tr>
          </thead>
          <tbody>
            {isDefectsLoading && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading Defects...</td></tr>}
            {filteredDefects.map((defect) => (
              <React.Fragment key={defect.id}>
                <tr style={{ cursor: 'pointer', background: expandedDefectId === defect.id ? '#f8fafc' : 'transparent' }}>
                  <td style={{ fontWeight: '600' }}>{defect.vessel_name || 'Unknown'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>{defect.vessel_imo}</td>
                  <td>{defect.equipment_name || defect.equipment}</td>
                  <td>{defect.title}</td>
                  <td><span className={`badge ${defect.priority.toLowerCase()}`}>{defect.priority}</span></td>
                  <td><span className={`status-dot ${defect.status.toLowerCase()}`}></span>{defect.status.replace('_', ' ')}</td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => setExpandedDefectId(expandedDefectId === defect.id ? null : defect.id)}
                    >
                      {expandedDefectId === defect.id ? <ChevronUp size={18} /> : <MessageSquare size={18} />}
                    </button>
                  </td>
                </tr>
                {/* --- EXPANDED THREAD ROW --- */}
                {expandedDefectId === defect.id && (
                  <tr>
                    <td colSpan="7" style={{ padding: '0' }}>
                      <ThreadSection defectId={defect.id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Vessel Modal (Unchanged) */}
      {isModalOpen && user?.role === 'ADMIN' && (
        <div className="modal-overlay">
          {/* ... (Your existing modal code) ... */}
        </div>
      )}
    </div>
  );
};

export default ShoreVesselData;