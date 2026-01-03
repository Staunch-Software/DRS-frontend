import React from 'react';
import { CheckSquare, Calendar, ArrowUpRight, MessageSquare } from 'lucide-react';

const MyTasks = () => {
  // Mock Data for Tasks
  const myTasks = [
    { id: 101, title: 'Isolate Fuel Valve', defectId: 'DEF-001', due: 'Today', status: 'Pending' },
    { id: 102, title: 'Take Photos of Seal', defectId: 'DEF-001', due: 'Today', status: 'Pending' },
    { id: 105, title: 'Check Spare Part Stock', defectId: 'DEF-002', due: 'Tomorrow', status: 'Pending' },
    { id: 109, title: 'Weekly Maintenance', defectId: 'Routine', due: '28 Oct', status: 'Done' },
  ];

  return (
    <div className="dashboard-container">
      <div className="form-header-row">
        <h1 className="page-title">My Assigned Tasks</h1>
        <div className="task-stats">
          <span className="stat-pill">Pending: <strong>3</strong></span>
          <span className="stat-pill success">Completed: <strong>5</strong></span>
        </div>
      </div>

      <div className="task-list-container">
        {myTasks.map((task) => (
          <div key={task.id} className={`task-row ${task.status === 'Done' ? 'done' : ''}`}>
            
            {/* Checkbox Area */}
            <div className="task-check">
               <input type="checkbox" checked={task.status === 'Done'} readOnly />
            </div>

            {/* Task Info */}
            <div className="task-info">
              <h4>{task.title}</h4>
              <div className="task-meta">
                <span className="meta-tag">
                  <ArrowUpRight size={12} /> {task.defectId}
                </span>
                <span className="meta-tag">
                  <Calendar size={12} /> {task.due}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="task-actions">
              <button className="btn-secondary small">View Defect</button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasks;