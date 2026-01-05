import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVessel } from '../../api/vessels'; 
import { defectApi } from '../../services/defectApi';
import { blobUploadService } from '../../services/blobUploadService';
import { generateId } from '../../services/idGenerator';
import { CONFIG } from '../../config';
import {
  MessageSquare, ChevronDown, ChevronUp, RotateCcw, Plus, X, Ship, Paperclip, Send, Download
} from 'lucide-react';

const ShoreVesselData = () => {
  const { selectedVessels } = useOutletContext();
  const queryClient = useQueryClient();

  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defects, setDefects] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    imo_number: '',
    vessel_type: 'Oil Tanker',
    flag: ''
  });

  useEffect(() => {
    // Fetch real defects from API
    defectApi.getDefects(selectedVessels).then(setDefects);
  }, [selectedVessels]);

  const addVesselMutation = useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      alert("Vessel Added Successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', imo_number: '', vessel_type: 'Oil Tanker', flag: '' });
      queryClient.invalidateQueries(['vessels']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.imo_number.length !== 7) return alert("IMO must be 7 digits.");
    addVesselMutation.mutate(formData);
  };

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <h1 className="page-title">Vessel Data</h1>
        <div className="filter-controls">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Vessel
          </button>
          <button className="reset-btn"><RotateCcw size={14} /></button>
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
            {defects.map((defect) => (
              <React.Fragment key={defect.id}>
                <tr>
                  <td>{defect.vessel_name || defect.vessel_id}</td>
                  <td>{defect.id}</td>
                  <td>{defect.equipment}</td>
                  <td>{defect.description?.substring(0, 30)}...</td>
                  <td><span className={`badge ${defect.priority?.toLowerCase()}`}>{defect.priority}</span></td>
                  <td>{defect.status}</td>
                  <td><MessageSquare size={16} /></td>
                  <td>
                    <button className="btn-icon" onClick={() => setExpandedRow(expandedRow === defect.id ? null : defect.id)}>
                      {expandedRow === defect.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </td>
                </tr>
                {expandedRow === defect.id && (
                  <tr>
                    <td colSpan="8" className="expanded-content-cell">
                       <ThreadSection defectId={defect.id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD VESSEL MODAL (Restored) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <div className="modal-header">
              <h3><Ship size={18} style={{ marginRight: '8px' }} /> Register New Vessel</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Vessel Name</label>
                <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} required />
              </div>
              <div className="form-group">
                <label>IMO Number</label>
                <input type="text" className="input-field" maxLength={7} value={formData.imo_number} onChange={(e) => setFormData({ ...formData, imo_number: e.target.value.replace(/\D/g, '') })} required />
              </div>
              <div className="form-group">
                <label>Vessel Type</label>
                <select className="input-field" value={formData.vessel_type} onChange={(e) => setFormData({ ...formData, vessel_type: e.target.value })}>
                  <option>Oil Tanker</option><option>Bulk Carrier</option><option>Container Ship</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={addVesselMutation.isPending}>
                  {addVesselMutation.isPending ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ThreadSection = ({ defectId }) => {
  const [threads, setThreads] = useState([]);
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const loadThreads = () => defectApi.getThreads(defectId).then(setThreads);
  useEffect(() => { loadThreads(); }, [defectId]);

  const handleReply = async () => {
    if (!reply && files.length === 0) return;
    setIsSending(true);
    try {
      const threadId = generateId();
      for (const file of files) {
        const path = await blobUploadService.uploadBinary(file, defectId, generateId());
        await defectApi.createAttachment({ id: generateId(), thread_id: threadId, file_name: file.name, blob_path: path });
      }
      await defectApi.createThread({ id: threadId, defect_id: defectId, author: "Superintendent", body: reply });
      setReply(""); setFiles([]); loadThreads();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="thread-view-container">
      <div className="thread-history">
        {threads.map(t => (
          <div key={t.id} className="thread-message">
            <div className="message-header"><strong>{t.author}</strong></div>
            <p>{t.body}</p>
            {t.attachments?.map(a => (
              <a key={a.id} href={`${CONFIG.AZURE_STORAGE_URL}/${a.blob_path}${CONFIG.AZURE_SAS_TOKEN}`} target="_blank" rel="noreferrer" className="attachment-link">
                <Download size={14} /> {a.file_name}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="reply-box">
        <textarea className="input-field" placeholder="Type reply..." value={reply} onChange={e => setReply(e.target.value)} />
        <div className="reply-actions">
          <input type="file" multiple id={`file-${defectId}`} onChange={e => setFiles(Array.from(e.target.files))} hidden />
          <label htmlFor={`file-${defectId}`} className="btn-secondary"><Paperclip size={16} /> {files.length} files</label>
          <button className="btn-primary" onClick={handleReply} disabled={isSending}>{isSending ? 'Sending...' : 'Send Reply'}</button>
        </div>
      </div>
    </div>
  );
};

export default ShoreVesselData;