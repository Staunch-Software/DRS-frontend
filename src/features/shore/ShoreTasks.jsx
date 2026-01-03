import React from 'react';
import { ArrowUpRight, Ship, Calendar } from 'lucide-react';

const ShoreTasks = () => {
  const tasks = [
    { id: 1, title: 'Approve Spares PR-205', vessel: 'MT ALFA', defectId: 'DEF-101', status: 'Pending', due: 'Today' },
    { id: 2, title: 'Review Critical Defect Report', vessel: 'MT CHARLIE', defectId: 'DEF-303', status: 'Pending', due: 'Tomorrow' },
    { id: 3, title: 'Verify Close-out Evidence', vessel: 'MT BRAVO', defectId: 'DEF-202', status: 'Done', due: 'Yesterday' },
  ];

  return (
    <div className="dashboard-container">
       <h1 className="page-title">My Pending Tasks</h1>
       
       <div className="task-list-container">
          {tasks.map(task => (
             <div key={task.id} className="task-row" style={{background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0'}}>
                
                <div style={{flex: 1}}>
                   <h4 style={{margin: '0 0 5px 0', color: '#0f172a'}}>{task.title}</h4>
                   <div className="task-meta" style={{display: 'flex', gap: '10px'}}>
                      <span className="meta-tag" style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px'}}>
                        <Ship size={12}/> {task.vessel}
                      </span>
                      <span className="meta-tag" style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px'}}>
                        <ArrowUpRight size={12}/> {task.defectId}
                      </span>
                   </div>
                </div>

                <div>
                   <button style={{background: 'white', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>
                      Review
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default ShoreTasks;