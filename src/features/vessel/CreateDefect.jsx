import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Paperclip, MessageSquare, X } from 'lucide-react';

// Phase 1 Services
import { generateId } from '../../services/idGenerator';
import { uploadFileToBlob } from '../../services/blobUploadService';
import { defectApi } from '../../services/defectApi';

const CreateDefect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- State ---
  const [isSaving, setIsSaving] = useState(false);
  const [initialComment, setInitialComment] = useState("");
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    equipment: '',
    description: '',
    remarks: '',
    priority: 'Normal',
    status: 'Open',
    responsibility: 'Engine Dept',
    officeSupport: 'No',
    prNumber: '',
    prStatus: ''
  });

  // --- Load Edit Data ---
  useEffect(() => {
    if (location.state?.defectToEdit) {
      const { defectToEdit } = location.state;
      setFormData({
        date: defectToEdit.date || '',
        equipment: defectToEdit.equipment || '',
        description: defectToEdit.description || '',
        remarks: defectToEdit.remarks || '',
        priority: defectToEdit.priority || 'Normal',
        status: defectToEdit.status || 'Open',
        responsibility: defectToEdit.responsibility || 'Engine Dept',
        officeSupport: defectToEdit.officeSupport || 'No',
        prNumber: defectToEdit.prNumber || '',
        prStatus: defectToEdit.prStatus || ''
      });
    }
  }, [location]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.equipment || !formData.description) {
      alert("Please fill in the Component Name and Description.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Generate IDs upfront (Idempotency)
      const defectId = location.state?.defectToEdit?.id || generateId();
      const threadId = generateId();

      // 2. BLOB-FIRST: Upload attachments directly to Azure
      const uploadedAttachments = [];
      for (const file of files) {
        const attachmentId = generateId();
        // Direct upload to Azure Blob Storage
        const blobPath = await uploadFileToBlob(file, defectId, attachmentId);
        
        uploadedAttachments.push({
          id: attachmentId,
          thread_id: threadId,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          blob_path: blobPath // Verified path in Azure
        });
      }

      // 3. METADATA-SECOND: Register records in PostgreSQL via API
      // Create/Update Defect
      await defectApi.createDefect({
        id: defectId,
        ...formData,
        vessel_id: 'VESSEL-001', // Replace with actual vessel context
        updated_at: new Date().toISOString()
      });

      // Create Initial Thread (The Comment)
      // Only create if it's a new defect or if a comment was provided
      if (!location.state?.defectToEdit || initialComment) {
        await defectApi.createThread({
          id: threadId,
          defect_id: defectId,
          author: "Chief Engineer", // Replace with Auth context
          body: initialComment || "Defect Reported",
          created_at: new Date().toISOString()
        });

        // Create Attachment Metadata linked to this thread
        for (const attachment of uploadedAttachments) {
          await defectApi.createAttachment(attachment);
        }
      }

      alert("Defect successfully saved to cloud.");
      navigate('/vessel/dashboard');
    } catch (error) {
      console.error("Cloud Save Failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-defect-container">
      <div className="form-header-row">
        <h1 className="page-title">
          {location.state?.defectToEdit ? `Update Defect: ${location.state.defectToEdit.id}` : 'Report New Defect'}
        </h1>
        
        <button 
          className="btn-primary" 
          onClick={handleSubmit} 
          disabled={isSaving}
          style={{ opacity: isSaving ? 0.7 : 1 }}
        >
          <Save size={18} /> 
          {isSaving ? 'Uploading to Cloud...' : (location.state?.defectToEdit ? 'Update Changes' : 'Save to Cloud')}
        </button>
      </div>

      <div className="form-layout">
        
        {/* LEFT COLUMN: THE FORM (All original rows restored) */}
        <div className="form-card">
          <h3>Defect Details</h3>
          
          <form className="defect-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date Identified</label>
                <input 
                  type="date" 
                  name="date"
                  className="input-field" 
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group flex-2">
                <label>Component Name</label>
                <input 
                  type="text" 
                  name="equipment"
                  className="input-field" 
                  placeholder="e.g. Main Engine Fuel Pump #2" 
                  value={formData.equipment}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Defect Description</label>
              <textarea 
                className="input-field area" 
                name="description"
                rows="3" 
                placeholder="Describe the failure detail..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Ship's Remarks / Action Taken</label>
              <textarea 
                className="input-field area" 
                name="remarks"
                rows="2" 
                placeholder="Temporary repairs done? Spares used?"
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-row three-col">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" className="input-field" value={formData.priority} onChange={handleChange}>
                  <option>Normal</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Responsibility</label>
                <select name="responsibility" className="input-field" value={formData.responsibility} onChange={handleChange}>
                  <option>Engine Dept</option>
                  <option>Deck Dept</option>
                  <option>Electrical</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Office Support Required?</label>
                <select name="officeSupport" className="input-field" value={formData.officeSupport} onChange={handleChange}>
                  <option>No</option>
                  <option>Yes - Spares</option>
                  <option>Yes - Service Engineer</option>
                </select>
              </div>
              <div className="form-group">
                <label>PR Number (Optional)</label>
                <input type="text" name="prNumber" className="input-field" value={formData.prNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>PR Status</label>
                <input type="text" name="prStatus" className="input-field" value={formData.prStatus} onChange={handleChange} />
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: ATTACHMENTS & CHAT */}
        <div className="side-panel">
          
          {/* File Upload */}
          <div className="panel-card">
            <h3><Paperclip size={18} /> Attachments</h3>
            <div className="upload-zone">
              <input 
                type="file" 
                multiple 
                id="file-upload" 
                onChange={handleFileChange} 
                accept="image/*,.pdf"
                hidden 
              />
              <label htmlFor="file-upload" className="upload-label">
                <span>Click to Upload Photos/PDF</span>
                <small>Direct Cloud Upload</small>
              </label>
            </div>
            
            {files.length > 0 && (
              <ul className="file-list">
                {files.map((f, i) => (
                  <li key={i}>
                    <div className="file-info">
                      <span className="file-name">{f.name}</span>
                      <span className="size">({(f.size/1024).toFixed(0)}kb)</span>
                    </div>
                    <button className="btn-remove" onClick={() => removeFile(i)}><X size={14}/></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Initial Comment */}
          {!location.state?.defectToEdit && (
            <div className="panel-card">
              <h3><MessageSquare size={18} /> Initial Comment</h3>
              <textarea 
                className="input-field area" 
                rows="4" 
                placeholder="Tag @Superintendent or add initial context..."
                value={initialComment}
                onChange={(e) => setInitialComment(e.target.value)}
              ></textarea>
              <div className="hint-text">This starts the cloud chat thread.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreateDefect;