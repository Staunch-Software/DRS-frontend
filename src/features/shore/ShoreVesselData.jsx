import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVessel, getVessels } from '../../api/vessels';
import { getDefects } from '../../api/defects';
import { 
  MessageSquare, CheckCircle, Plus, X, Ship, Mail, Filter, 
  Search, ChevronDown, Check
} from 'lucide-react';

const ShoreVesselData = () => {
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null);
  
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Toggle Dropdown
  const [vesselSearch, setVesselSearch] = useState('');    // Search inside dropdown
  const [selectedImos, setSelectedImos] = useState([]);    // Array of selected IMOs

  // --- QUERY 1: FETCH VESSELS ---
  const { data: vesselList = [] } = useQuery({
    queryKey: ['vessels'],
    queryFn: getVessels
  });

  // --- QUERY 2: FETCH ALL DEFECTS ---
  // We fetch ALL defects (empty string) and filter them in the UI using checkboxes
  const { data: allDefects = [], isLoading: isDefectsLoading } = useQuery({
    queryKey: ['defects', 'all'], 
    queryFn: () => getDefects('') 
  });

  // --- EFFECT: DEFAULT SELECT ALL ---
  // When vessels load, auto-select all of them
  useEffect(() => {
    if (vesselList.length > 0 && selectedImos.length === 0) {
      setSelectedImos(vesselList.map(v => v.imo_number));
    }
  }, [vesselList]);

  // --- EFFECT: CLICK OUTSIDE TO CLOSE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // --- FILTER LOGIC ---
  const toggleVessel = (imo) => {
    if (selectedImos.includes(imo)) {
      setSelectedImos(selectedImos.filter(id => id !== imo));
    } else {
      setSelectedImos([...selectedImos, imo]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedImos.length === vesselList.length) {
      setSelectedImos([]); // Deselect All
    } else {
      setSelectedImos(vesselList.map(v => v.imo_number)); // Select All
    }
  };

  // Filter the vessels shown INSIDE the dropdown (Search bar logic)
  const dropdownVessels = vesselList.filter(v => 
    v.name.toLowerCase().includes(vesselSearch.toLowerCase())
  );

  // Filter the DEFECTS shown in the TABLE
  const filteredDefects = allDefects.filter(defect => 
    selectedImos.includes(defect.vessel_imo)
  );

  // --- MUTATION: CREATE VESSEL ---
  const [formData, setFormData] = useState({
    name: '', imo_number: '', vessel_type: 'Oil Tanker', email: ''
  });

  const addVesselMutation = useMutation({
    mutationFn: createVessel,
    onSuccess: () => {
      alert("Vessel Added Successfully!");
      setIsModalOpen(false);
      setFormData({ name: '', imo_number: '', vessel_type: 'Oil Tanker', email: '' });
      queryClient.invalidateQueries(['vessels']); 
    },
    onError: (err) => alert("Error: " + (err.response?.data?.detail || err.message))
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData.imo_number.length !== 7) return alert("IMO Number must be exactly 7 digits.");
    addVesselMutation.mutate(formData);
  };

  return (
    <div className="dashboard-container">
      
      {/* --- HEADER --- */}
      <div className="section-header-with-filters">
        <div>
          <h1 className="page-title">Defect Overview</h1>
          <p style={{fontSize:'13px', color:'#64748b', marginTop:'4px'}}>
            Showing <strong>{filteredDefects.length}</strong> defects from <strong>{selectedImos.length}</strong> vessels.
          </p>
        </div>
        
        <div className="filter-controls">
          
          {/* --- CUSTOM MULTI-SELECT DROPDOWN --- */}
          <div className="custom-dropdown-container" ref={dropdownRef} style={{position:'relative'}}>
            
            {/* The Button */}
            <button 
              className="filter-btn" 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                display:'flex', alignItems:'center', gap:'8px', 
                background:'white', border:'1px solid #cbd5e1', 
                padding:'8px 16px', borderRadius:'6px', cursor:'pointer', minWidth:'200px', justifyContent:'space-between'
              }}
            >
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <Filter size={14} color="#64748b"/>
                <span style={{fontSize:'13px', color:'#334155'}}>
                  {selectedImos.length === vesselList.length ? 'All Vessels' : `${selectedImos.length} Selected`}
                </span>
              </div>
              <ChevronDown size={14} color="#64748b"/>
            </button>

            {/* The Dropdown Content */}
            {isFilterOpen && (
              <div className="dropdown-menu" style={{
                position:'absolute', top:'45px', right:'0', width:'280px',
                background:'white', border:'1px solid #e2e8f0', boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                borderRadius:'8px', zIndex: 100, padding:'10px'
              }}>
                
                {/* Search Bar */}
                <div style={{position:'relative', marginBottom:'10px'}}>
                  <Search size={14} style={{position:'absolute', left:'10px', top:'9px', color:'#94a3b8'}}/>
                  <input 
                    type="text" 
                    placeholder="Search ships..." 
                    value={vesselSearch}
                    onChange={(e) => setVesselSearch(e.target.value)}
                    style={{
                      width:'100%', padding:'6px 10px 6px 30px', 
                      border:'1px solid #e2e8f0', borderRadius:'6px', fontSize:'13px'
                    }}
                  />
                </div>

                {/* List */}
                <div style={{maxHeight:'200px', overflowY:'auto'}}>
                  
                  {/* Select All */}
                  <div 
                    onClick={toggleSelectAll}
                    style={{
                      display:'flex', alignItems:'center', gap:'10px', padding:'8px', 
                      cursor:'pointer', borderRadius:'4px', 
                      background: selectedImos.length === vesselList.length ? '#eff6ff' : 'transparent'
                    }}
                  >
                     <div style={{
                       width:'16px', height:'16px', border:'1px solid #cbd5e1', borderRadius:'4px',
                       display:'flex', alignItems:'center', justifyContent:'center',
                       background: selectedImos.length === vesselList.length ? '#3b82f6' : 'white',
                       borderColor: selectedImos.length === vesselList.length ? '#3b82f6' : '#cbd5e1'
                     }}>
                        {selectedImos.length === vesselList.length && <Check size={12} color="white"/>}
                     </div>
                     <span style={{fontSize:'13px', fontWeight:'600', color:'#1e293b'}}>Select All</span>
                  </div>

                  <div style={{height:'1px', background:'#e2e8f0', margin:'5px 0'}}></div>

                  {/* Individual Ships */}
                  {dropdownVessels.map(v => {
                    const isSelected = selectedImos.includes(v.imo_number);
                    return (
                      <div 
                        key={v.imo_number}
                        onClick={() => toggleVessel(v.imo_number)}
                        style={{
                          display:'flex', alignItems:'center', gap:'10px', padding:'8px', 
                          cursor:'pointer', borderRadius:'4px',
                          background: isSelected ? '#f1f5f9' : 'transparent'
                        }}
                      >
                         <div style={{
                           width:'16px', height:'16px', border:'1px solid #cbd5e1', borderRadius:'4px',
                           display:'flex', alignItems:'center', justifyContent:'center',
                           background: isSelected ? '#3b82f6' : 'white',
                           borderColor: isSelected ? '#3b82f6' : '#cbd5e1'
                         }}>
                            {isSelected && <Check size={12} color="white"/>}
                         </div>
                         <div style={{display:'flex', flexDirection:'column'}}>
                           <span style={{fontSize:'13px', color:'#1e293b'}}>{v.name}</span>
                           <span style={{fontSize:'11px', color:'#94a3b8'}}>IMO: {v.imo_number}</span>
                         </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Register Vessel
          </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vessel</th>
              <th>Equipment</th>
              <th>Defect Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Thread</th>
            </tr>
          </thead>
          <tbody>
             {isDefectsLoading && <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>Loading Defects...</td></tr>}
             
             {!isDefectsLoading && filteredDefects.length === 0 && (
               <tr>
                 <td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>
                   <CheckCircle size={24} style={{marginBottom:'10px', color:'#10b981'}}/>
                   <br/>No defects found.
                 </td>
               </tr>
             )}

             {filteredDefects.map((defect) => (
               <tr key={defect.id}>
                 <td style={{fontFamily:'monospace', fontSize:'12px', color:'#64748b'}}>{defect.id.substring(0,8)}...</td>
                 <td style={{fontWeight:'600'}}>{defect.vessel_name || defect.vessel_imo}</td>
                 <td>{defect.equipment_name || defect.equipment}</td>
                 <td>{defect.title}</td>
                 <td><span className={`badge ${defect.priority.toLowerCase()}`}>{defect.priority}</span></td>
                 <td><span className={`status-dot ${defect.status.toLowerCase()}`}></span>{defect.status.replace('_', ' ')}</td>
                 <td><button className="btn-icon"><MessageSquare size={16}/></button></td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
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
                <input className="input-field" maxLength={7} placeholder="9792058" value={formData.imo_number} onChange={(e) => setFormData({...formData, imo_number: e.target.value.replace(/\D/g,'')})} required />
              </div>
              <div className="form-group">
                <label>Vessel Name</label>
                <input className="input-field" placeholder="A.M. UMANG" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
              </div>
              <div className="form-group">
                <label>Vessel Type</label>
                <select className="input-field" value={formData.vessel_type} onChange={(e) => setFormData({...formData, vessel_type: e.target.value})}>
                  <option>Bulk Carrier</option><option>Oil Tanker</option><option>Container Ship</option>
                </select>
              </div>
              <div className="form-group">
                <label><Mail size={14} style={{verticalAlign:'middle'}}/> Ship Email</label>
                <input type="email" className="input-field" placeholder="email@ship.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="modal-footer" style={{borderTop:'none', padding:'0', marginTop:'20px'}}>
                <button type="submit" className="btn-primary" style={{width:'100%'}}>Confirm Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoreVesselData;