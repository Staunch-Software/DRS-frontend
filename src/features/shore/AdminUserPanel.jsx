import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVessels } from '../../api/vessels';
import api from '../../api/axios'; 
import { UserPlus, Save, AlertCircle } from 'lucide-react';

const AdminUserPanel = () => {
  // 1. Fetch Vessels with Status
  const { data: vessels, isLoading, isError } = useQuery({ 
    queryKey: ['vessels'], 
    queryFn: getVessels 
  });

  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', role: 'CHIEF_ENGINEER', assigned_vessel_imos: []
  });

  const handleVesselToggle = (imo) => {
    setFormData(prev => {
      const current = prev.assigned_vessel_imos;
      if (current.includes(imo)) {
        return { ...prev, assigned_vessel_imos: current.filter(i => i !== imo) };
      } else {
        return { ...prev, assigned_vessel_imos: [...current, imo] };
      }
    });
  };

  const createUser = async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      alert("Please fill in all required fields.");
      return;
    }
    
    // Logic: If role is CREW, they MUST have a vessel assigned
    if (['MASTER', 'CHIEF_ENGINEER', 'SECOND_ENGINEER'].includes(formData.role)) {
       if (formData.assigned_vessel_imos.length === 0) {
         alert("Crew members must be assigned to at least one vessel.");
         return;
       }
    }

    try {
        await api.post('/users/', formData);
        alert("User Created Successfully!");
        setFormData({ full_name: '', email: '', password: '', role: 'CHIEF_ENGINEER', assigned_vessel_imos: [] });
    } catch (e) {
        console.error(e);
        alert("Error: " + (e.response?.data?.detail || "Failed to create user"));
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="page-title"><UserPlus size={24} style={{verticalAlign:'middle'}}/> Admin: Add New User</h1>
      
      <div className="form-card" style={{maxWidth: '600px'}}>
        
        {/* ... Name, Email, Password inputs (Keep same as before) ... */}
        
        <div className="form-group">
            <label>Full Name</label>
            <input className="input-field" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
        </div>
        <div className="form-group">
            <label>Email</label>
            <input className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-group">
            <label>Password</label>
            <input className="input-field" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>

        <div className="form-group">
            <label>Role</label>
            <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <optgroup label="Vessel Crew">
                  <option value="CHIEF_ENGINEER">Chief Engineer</option>
                  <option value="MASTER">Master</option>
                  <option value="SECOND_ENGINEER">2nd Engineer</option>
                </optgroup>
                <optgroup label="Shore Staff">
                  <option value="SUPERINTENDENT">Superintendent</option>
                  <option value="FLEET_MANAGER">Fleet Manager</option>
                </optgroup>
            </select>
        </div>

        {/* VESSEL MULTI-SELECT WITH STATUS */}
        <div className="form-group">
            <label>Assign Vessels (Select multiple)</label>
            
            <div className="v-list" style={{border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', background: '#f8fafc'}}>
                
                {isLoading && <div style={{padding:'10px', color:'#64748b'}}>Loading vessels...</div>}
                
                {isError && <div style={{padding:'10px', color:'#ef4444'}}>Failed to load vessels. Is backend running?</div>}
                
                {!isLoading && !isError && vessels?.length === 0 && (
                   <div style={{padding:'10px', color:'#f59e0b', fontSize:'13px'}}>
                     <AlertCircle size={14} style={{verticalAlign:'middle', marginRight:'5px'}}/>
                     No vessels found in database. Please add a vessel first.
                   </div>
                )}

                {vessels?.map(v => (
                    <label key={v.imo_number} className="v-checkbox" style={{color: '#333', display:'flex', alignItems:'center', marginBottom:'5px', cursor:'pointer'}}>
                        <input 
                            type="checkbox" 
                            style={{marginRight:'10px'}}
                            checked={formData.assigned_vessel_imos.includes(v.imo_number)}
                            onChange={() => handleVesselToggle(v.imo_number)}
                        />
                        <span>{v.name} <small style={{color:'#64748b'}}>({v.imo_number})</small></span>
                    </label>
                ))}
            </div>
        </div>

        <button className="btn-primary" onClick={createUser} style={{marginTop: '20px', width: '100%'}}>
            <Save size={18} /> Create User
        </button>
      </div>
    </div>
  );
};

export default AdminUserPanel;