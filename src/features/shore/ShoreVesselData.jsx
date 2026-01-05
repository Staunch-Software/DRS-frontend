import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVessel, getVessels } from '../../api/vessels';
import { 
  MessageSquare, CheckCircle, Plus, X, Ship, Mail, AlertTriangle 
} from 'lucide-react';

const ShoreVesselData = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch Vessels
  const { data: vesselList, isLoading, isError, error } = useQuery({
    queryKey: ['vessels'],
    queryFn: getVessels
  });
  
  // --- FORM STATE (Removed 'code') ---
  const [formData, setFormData] = useState({
    name: '',
    imo_number: '',
    vessel_type: 'Oil Tanker',
    email: ''
  });

  const addVesselMutation = useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      alert("Vessel Added Successfully!");
      setIsModalOpen(false);
      // Reset form (No code field)
      setFormData({ name: '', imo_number: '', vessel_type: 'Oil Tanker', email: '' });
      queryClient.invalidateQueries(['vessels']);
    },
    onError: (err) => {
      alert("Error: " + (err.response?.data?.detail || err.message));
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

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <h1 className="page-title">Vessel Data</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Register Vessel
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vessel Name</th>
              <th>IMO Number</th>
              <th>Type</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
             {isLoading && <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Loading Fleet...</td></tr>}
             
             {isError && <tr><td colSpan="6" style={{color:'red', textAlign:'center'}}>Error: {error.message}</td></tr>}

             {vesselList && vesselList.map((v) => (
               <tr key={v.imo_number}>
                 <td style={{fontWeight:'600'}}>{v.name}</td>
                 <td>{v.imo_number}</td>
                 <td>{v.vessel_type}</td>
                 <td style={{fontSize:'13px', color:'#64748b'}}>
                    {v.email || '-'}
                 </td>
                 <td>
                   {v.is_active ? 
                     <span style={{color:'green', display:'flex', alignItems:'center', gap:'4px'}}><CheckCircle size={14}/> Active</span> : 
                     <span style={{color:'gray'}}>Inactive</span>}
                 </td>
                 <td><button className="btn-icon"><MessageSquare size={16}/></button></td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL (Code Input Removed) --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width: '450px'}}>
            <div className="modal-header">
              <h3><Ship size={18} style={{marginRight:'8px'}}/> Register New Vessel</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              
              <div className="form-group">
                <label>IMO Number</label>
                <input 
                  className="input-field" 
                  maxLength={7}
                  placeholder="9792058"
                  value={formData.imo_number}
                  onChange={(e) => setFormData({...formData, imo_number: e.target.value.replace(/\D/g,'')})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vessel Name</label>
                <input 
                  className="input-field" 
                  placeholder="A.M. UMANG" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vessel Type</label>
                <select 
                  className="input-field"
                  value={formData.vessel_type}
                  onChange={(e) => setFormData({...formData, vessel_type: e.target.value})}
                >
                  <option>Bulk Carrier</option>
                  <option>Oil Tanker</option>
                  <option>Container Ship</option>
                  <option>LNG Carrier</option>
                  <option>General Cargo</option>
                </select>
              </div>

              <div className="form-group">
                <label><Mail size={14} style={{verticalAlign:'middle'}}/> Ship Email (Optional)</label>
                <input 
                  type="email"
                  className="input-field" 
                  placeholder="master.umang@shipping.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
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