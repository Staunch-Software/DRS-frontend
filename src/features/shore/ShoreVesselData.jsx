import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVessel } from '../../api/vessels'; // Import API
import { 
  MessageSquare, ChevronDown, ChevronUp, CheckCircle, 
  ShieldAlert, RotateCcw, Plus, X, Ship 
} from 'lucide-react';

const ShoreVesselData = () => {
  const { selectedVessels } = useOutletContext(); 
  const queryClient = useQueryClient();
  
  // --- UI STATES ---
  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',
    imo_number: '',
    vessel_type: 'Oil Tanker',
    flag: ''
  });

  // --- API MUTATION ---
  const addVesselMutation = useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      alert("Vessel Added Successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', imo_number: '', vessel_type: 'Oil Tanker', flag: '' });
      // Invalidate queries if you are fetching vessel list dynamically
      queryClient.invalidateQueries(['vessels']);
    },
    onError: (error) => {
      alert("Error: " + (error.response?.data?.detail || error.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData.imo_number.length !== 7) {
      alert("IMO Number must be exactly 7 digits.");
      return;
    }
    addVesselMutation.mutate(formData);
  };

  // MOCK DATA (Replace with useQuery later)
  const allDefects = [
    { id: 'DEF-101', vesselId: 'v1', vesselName: 'MT ALFA', equipment: 'Main Engine', title: 'Fuel Pump Leak', priority: 'Critical', status: 'Open', date: '2025-10-26', comments: 4, description: 'Leakage.', remarks: 'Spare ordered.' },
    // ... rest of your mock data
  ];

  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <h1 className="page-title">Vessel Data</h1>
        
        <div className="filter-controls">
          {/* ADD VESSEL BUTTON */}
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Vessel
          </button>
          
          <button className="reset-btn" title="Reset Filters">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="table-card">
        {/* ... (Your existing table code remains exactly the same) ... */}
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
             {/* ... Table Body ... */}
             <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>Mock Data Table</td></tr>
          </tbody>
        </table>
      </div>

      {/* --- ADD VESSEL MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width: '450px'}}>
            <div className="modal-header">
              <h3><Ship size={18} style={{marginRight:'8px'}}/> Register New Vessel</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              
              <div className="form-group">
                <label>Vessel Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. MT CHARLIE" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="form-group">
                <label>IMO Number (Unique ID)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 9123456" 
                  maxLength={7}
                  value={formData.imo_number}
                  onChange={(e) => setFormData({...formData, imo_number: e.target.value.replace(/\D/g,'')})} // Only numbers
                  required
                />
                <small style={{color:'#64748b', fontSize:'11px'}}>Must be exactly 7 digits.</small>
              </div>

              <div className="form-group">
                <label>Vessel Type</label>
                <select 
                  className="input-field"
                  value={formData.vessel_type}
                  onChange={(e) => setFormData({...formData, vessel_type: e.target.value})}
                >
                  <option>Oil Tanker</option>
                  <option>Bulk Carrier</option>
                  <option>Container Ship</option>
                  <option>LNG Carrier</option>
                  <option>General Cargo</option>
                </select>
              </div>

              <div className="form-group">
                {/* <label>Flag State (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Panama" 
                  value={formData.flag}
                  onChange={(e) => setFormData({...formData, flag: e.target.value})}
                /> */}
              </div>

              <div className="modal-footer" style={{borderTop:'none', padding:'0', marginTop:'20px'}}>
                <button type="submit" className="btn-primary" style={{width:'100%'}} disabled={addVesselMutation.isPending}>
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

export default ShoreVesselData;