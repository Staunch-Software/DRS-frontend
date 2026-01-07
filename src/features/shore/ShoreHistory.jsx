import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle, MessageSquare, Search, ChevronDown, ChevronUp,
  Send, Paperclip, Download
} from 'lucide-react';
import { defectApi } from '../../services/defectApi';
import { blobUploadService } from '../../services/blobUploadService';
import { generateId } from '../../services/idGenerator';

/**
 * SUB-COMPONENT: ThreadSection
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
        author: "Superintendent",
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

  if (isLoading) return <div style={{ padding: '20px', color: '#64748b' }}>Loading conversation...</div>;

  return (
    <div className="thread-section-wrapper" style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div className="thread-history" style={{ marginBottom: '20px' }}>
        {threads.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No messages yet.</p>
        ) : (
          threads.map(t => (
            <div key={t.id} className="chat-msg" style={{ marginBottom: '15px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px' }}>{t.author}</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(t.created_at).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '14px', margin: 0 }}>{t.body}</p>
              {t.attachments?.map(a => (
                <a key={a.id} href={a.blob_path} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '12px', color: '#3b82f6', marginTop: '5px', textDecoration: 'none' }}>
                  <Download size={12} /> {a.file_name}
                </a>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="reply-box">
        <textarea 
          className="input-field" 
          placeholder="Type a reply..." 
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }}
        />
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

const ShoreHistory = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [openThreadRow, setOpenThreadRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- API QUERY ---
  const { data: defects = [], isLoading } = useQuery({
    queryKey: ['defects', 'closed-history'],
    queryFn: () => defectApi.getDefects()
  });

  // --- FILTER LOGIC (Closed defects only + search) ---
  const filteredHistory = defects.filter(defect => {
    const isClosed = defect.status === 'CLOSED';
    const matchSearch = searchQuery === '' || 
      defect.equipment_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defect.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isClosed && matchSearch;
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

  if (isLoading) return <div className="dashboard-container">Loading History...</div>;

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <h1 className="page-title">Maintenance History ({filteredHistory.length})</h1>
        <div className="filter-controls">
          <div className="v-search-box" style={{ marginBottom: 0, background: 'white', border: '1px solid #cbd5e1' }}>
            <Search size={14} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search archives..." 
              style={{ color: '#333' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              <th>Closed Date</th>
              <th>Thread</th>
              <th>Expand</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((defect) => (
                <React.Fragment key={defect.id}>
                  <tr className={expandedRow === defect.id ? 'expanded-active' : ''} style={{ opacity: 0.85 }}>
                    <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{defect.vessel_name || defect.vessel_imo}</td>
                    <td className="id-cell">{defect.id.substring(0, 8)}</td>
                    <td>{defect.equipment_name}</td>
                    <td className="title-cell">{defect.title}</td>
                    <td>
                      <span className={`badge badge-${defect.priority.toLowerCase()}`}>
                        {defect.priority}
                      </span>
                    </td>
                    <td>{new Date(defect.updated_at || defect.created_at).toLocaleDateString()}</td>
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
                      <td colSpan="8" style={{ padding: 0 }}>
                        <div className="detail-content">
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
                          <div className="detail-actions" style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                            <span className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '8px 16px', fontSize: '14px' }}>
                              <CheckCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                              Defect Closed
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* THREAD ROW */}
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
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  {searchQuery ? 'No closed records match your search.' : 'No closed records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShoreHistory;