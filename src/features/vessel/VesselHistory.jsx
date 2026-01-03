import React from 'react';
import { CheckCircle, MessageSquare } from 'lucide-react';

const VesselHistory = () => {
  // Mock Closed Data
  const closedDefects = [
    { id: 'DEF-000', equipment: 'Radar #2', title: 'Magnetron Failure', priority: 'High', date: '01 Oct 2025' },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Maintenance History</h1>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipment</th>
              <th>Defect Title</th>
              <th>Closed Date</th>
              <th>Status</th>
              <th>Thread</th>
            </tr>
          </thead>
          <tbody>
            {closedDefects.map((defect) => (
              <tr key={defect.id} style={{opacity: 0.7}}>
                <td className="id-cell">{defect.id}</td>
                <td>{defect.equipment}</td>
                <td>{defect.title}</td>
                <td>{defect.date}</td>
                <td><span className="badge badge-normal">Closed</span></td>
                <td>
                  <button className="thread-btn">
                    <MessageSquare size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VesselHistory;