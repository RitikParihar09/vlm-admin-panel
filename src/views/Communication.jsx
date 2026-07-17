import React, { useState } from 'react';

const Communication = () => {
  const [target, setTarget] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [commType, setCommType] = useState('push'); // push, email, sms
  const [logs, setLogs] = useState([
    { id: 1, type: 'Email', target: 'Class 12 Students', subject: 'Term 1 Syllabus Release', date: '2026-07-16 10:00', status: 'Sent (145 students)' },
    { id: 2, type: 'Push', target: 'All Parents', subject: 'Report Card Availability', date: '2026-07-15 14:30', status: 'Sent (920 parents)' },
    { id: 3, type: 'SMS', target: 'Teachers List', subject: 'Urgent: Faculty meeting postponed', date: '2026-07-14 09:15', status: 'Failed (3 errors)' }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newLog = {
      id: Date.now(),
      type: commType.toUpperCase(),
      target: target === 'all' ? 'All Users' : target.toUpperCase(),
      subject: subject || 'No Subject',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Sent (Delivered)'
    };

    setLogs([newLog, ...logs]);
    setMessage('');
    setSubject('');
    alert('Communication broadcast sent successfully.');
  };

  return (
    <div className="communication-view">
      <div>
        <h2 className="view-title">Communication Console</h2>
        <p className="view-subtitle">Broadcast mass push alerts, dispatch newsletter emails, and coordinate sms texts.</p>
      </div>

      <div className="comm-grid">
        {/* Left: Dispatch Form */}
        <div className="comm-col-left glass-panel dispatch-card">
          <h3>Compose Notification</h3>
          <form onSubmit={handleSend} className="dispatch-form">
            <div className="form-group-row">
              <div className="form-group">
                <label>Channel Type</label>
                <div className="channel-toggle-row">
                  <button 
                    type="button" 
                    className={`channel-btn ${commType === 'push' ? 'active' : ''}`}
                    onClick={() => setCommType('push')}
                  >
                    🔔 Push Alert
                  </button>
                  <button 
                    type="button" 
                    className={`channel-btn ${commType === 'email' ? 'active' : ''}`}
                    onClick={() => setCommType('email')}
                  >
                    ✉️ Email Blast
                  </button>
                  <button 
                    type="button" 
                    className={`channel-btn ${commType === 'sms' ? 'active' : ''}`}
                    onClick={() => setCommType('sms')}
                  >
                    💬 SMS Text
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="glass-select">
                <option value="all">All Users (Students, Teachers, Parents)</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="parents">Parents Only</option>
                <option value="class-10">Class 10 Batch</option>
                <option value="class-12">Class 12 Batch</option>
              </select>
            </div>

            {commType === 'email' && (
              <div className="form-group">
                <label>Email Subject Title</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. Important Term Schedule Alert"
                  className="glass-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert details or email markup here..."
                rows="6"
                className="glass-input textarea-comm"
                required
              />
            </div>

            <button type="submit" className="glass-button send-comm-btn">
              ⚡ Dispatch Broadcast
            </button>
          </form>
        </div>

        {/* Right: Broadcast Logs */}
        <div className="comm-col-right glass-panel history-card">
          <h3>Recent Communications Activity</h3>
          <p className="history-subtitle">View sent newsletters and pushes logs.</p>

          <div className="history-table-wrapper">
            <table className="comm-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Subject/Topic</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`channel-badge ${log.type.toLowerCase()}`}>
                        {log.type}
                      </span>
                    </td>
                    <td>{log.target}</td>
                    <td>{log.subject}</td>
                    <td className="log-date">{log.date}</td>
                    <td>{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .communication-view {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .view-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .view-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .comm-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 25px;
        }

        @media (max-width: 1200px) {
          .comm-grid {
            grid-template-columns: 1fr;
          }
        }

        .dispatch-card, .history-card {
          padding: 24px;
        }

        .dispatch-card h3, .history-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 18px;
        }

        .channel-toggle-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .channel-btn {
          border: 1px solid var(--panel-border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 550;
          transition: all 0.2s ease;
        }

        .channel-btn:hover {
          border-color: var(--panel-border-hover);
          color: var(--text-primary);
        }

        .channel-btn.active {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
        }

        .textarea-comm {
          width: 100%;
          font-family: inherit;
        }

        .send-comm-btn {
          width: 100%;
          justify-content: center;
          margin-top: 10px;
        }

        .history-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 18px;
        }

        .history-table-wrapper {
          overflow-x: auto;
        }

        .comm-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .comm-table th {
          color: var(--text-muted);
          font-weight: 600;
          padding: 12px 14px;
          border-bottom: 1px solid var(--panel-border);
          text-transform: uppercase;
          font-size: 11px;
        }

        .comm-table td {
          padding: 14px;
          border-bottom: 1px solid var(--panel-border);
          color: var(--text-primary);
        }

        .channel-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .channel-badge.push {
          background: rgba(245, 158, 11, 0.1);
          color: var(--teacher-color);
        }

        .channel-badge.email {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
        }

        .channel-badge.sms {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }

        .log-date {
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default Communication;
