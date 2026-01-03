import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, MessageSquare, Search } from 'lucide-react';

const ShoreHistory = () => {
  // 1. Get Sidebar Filters
  const { selectedVessels } = useOutletContext();

  // 2. MOCK CLOSED DATA
  const historyData = [
    { 
      id: 'DEF-099', vesselId: 'v1', vesselName: 'MT ALFA', 
      equipment: 'Main Engine', title: 'Exhaust Valve Stuck', 
      closedDate: '2025-10-01', status: 'Closed', comments: 5 
    },
    { 
      id: 'DEF-085', vesselId: 'v2', vesselName: 'MT BRAVO', 
      equipment: 'Generator #2', title: 'Low Frequency Trip', 
      closedDate: '2025-09-28', status: 'Closed', comments: 2 
    },
    { 
      id: 'DEF-072', vesselId: 'v1', vesselName: 'MT ALFA', 
      equipment: 'Galley', title: 'Dishwasher Leak', 
      closedDate: '2025-09-15', status: 'Closed', comments: 0 
    },
    { 
      id: 'DEF-050', vesselId: 'v3', vesselName: 'MT CHARLIE', 
      equipment: 'Deck Crane', title: 'Hydraulic Hose Burst', 
      closedDate: '2025-08-30', status: 'Closed', comments: 8 
    },
  ];

  // 3. Filter Logic (Show only selected vessels)
  const filteredHistory = historyData.filter(d => selectedVessels.includes(d.vesselId));

  return (
    <div className="dashboard-container">
      <div className="section-header-with-filters">
        <h1 className="page-title">Maintenance History</h1>
        <div className="filter-controls">
           {/* Optional local search for history */}
           <div className="v-search-box" style={{marginBottom:0, background:'white', border:'1px solid #cbd5e1'}}>
              <Search size={14} color="#64748b"/>
              <input type="text" placeholder="Search archives..." style={{color:'#333'}} />
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
              <th>Closed Date</th>
              <th>Status</th>
              <th>Thread</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((defect) => (
                <tr key={defect.id} style={{ opacity: 0.8 }}> {/* Slight opacity to indicate 'History' */}
                  <td style={{fontWeight: 'bold', color: '#0f172a'}}>{defect.vesselName}</td>
                  <td className="id-cell">{defect.id}</td>
                  <td>{defect.equipment}</td>
                  <td className="title-cell">{defect.title}</td>
                  <td>{defect.closedDate}</td>
                  <td>
                    <span className="badge" style={{background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'}}>
                      <CheckCircle size={10} style={{marginRight:4, verticalAlign:'middle'}}/>
                      Closed
                    </span>
                  </td>
                  <td>
                    <button className="thread-btn">
                      <MessageSquare size={16} />
                      {defect.comments > 0 && <span className="msg-count" style={{background:'#94a3b8'}}>{defect.comments}</span>}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No closed records found for the selected vessels.
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