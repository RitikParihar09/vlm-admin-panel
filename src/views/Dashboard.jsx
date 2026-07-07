import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DashboardCard from '../components/DashboardCard';
import CustomChart from '../components/CustomChart';

const Dashboard = ({ setActiveView }) => {
  const {
    students = [],
    teachers = [],
    parents = [],
    liveClasses = [],
    doubts = [],
    mcqTasks = []
  } = useAdmin();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [logs, setLogs] = useState([
    { id: 1, time: '17:05', text: 'Daily MCQ Task "Cell Anatomy Quiz" created for Class 9.' },
    { id: 2, time: '16:00', text: 'Mr. Rajesh Verma started live class "Cell Division".' },
    { id: 3, time: '14:23', text: 'New student Ram Kumar added to Class 10.' },
    { id: 4, time: '11:10', text: 'Doubt D3 resolved by teacher Mrs. Kalyani Rao.' }
  ]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      { id: Date.now(), time, text: `BROADCAST: "${broadcastMessage}" sent to all students.` },
      ...prev
    ]);
    setBroadcastMessage('');
  };

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalParents = parents.length;
  const openDoubts = (doubts || []).filter(d => d.status === 'Open').length;
  const liveCount = liveClasses.filter(c => c.status === 'Live').length;

  const handleViewClick = (viewId) => {
    if (typeof setActiveView === 'function') {
      setActiveView(viewId);
    }
  };

  // Donut chart user data
  const userData = [
    { label: 'Students', value: totalStudents },
    { label: 'Teachers', value: totalTeachers },
    { label: 'Parents', value: totalParents }
  ];

  // Dummy monthly analytics data
  const doubtTrendData = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 5 },
    { label: 'Thu', value: 15 },
    { label: 'Fri', value: 10 },
    { label: 'Sat', value: 4 },
    { label: 'Sun', value: 3 }
  ];

  const mcqAnalytics = mcqTasks.map(task => ({
    label: task.title.split(' ')[0], // first word
    value: parseInt(task.completionRate) || 0
  }));

  return (
    <div className="dashboard-view">
      <div className="stats-grid">
        <DashboardCard 
          title="Total Students" 
          value={totalStudents} 
          themeClass="student"
          subtext="Active users"
          onClick={() => handleViewClick('students')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <DashboardCard 
          title="Total Teachers" 
          value={totalTeachers} 
          themeClass="teacher"
          subtext="Verified educators"
          onClick={() => handleViewClick('teachers')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <DashboardCard 
          title="Total Parents" 
          value={totalParents} 
          themeClass="parent"
          subtext="Linked supervisors"
          onClick={() => handleViewClick('parents')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <DashboardCard 
          title="Pending Doubts" 
          value={openDoubts} 
          themeClass="default"
          subtext="Awaiting response"
          onClick={() => handleViewClick('doubts')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardCard 
          title="Pending Approvals" 
          value={liveCount} 
          themeClass="pending"
          subtext="Pending approvals"
          onClick={() => handleViewClick('liveclasses')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-main-charts">
          <div className="chart-grid-container">
            <CustomChart 
              type="line" 
              data={doubtTrendData} 
              title="Daily Support Doubts Submitted" 
            />
            {mcqAnalytics.length > 0 && (
              <CustomChart 
                type="bar" 
                data={mcqAnalytics} 
                title="MCQ Daily Assessment Completion Rate (%)" 
              />
            )}
          </div>
        </div>

        <div className="dashboard-side-panels">
          <CustomChart 
            type="donut" 
            data={userData} 
            title="User Model Distribution" 
          />
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        {/* Notice Board Broadcast */}
        <div className="bottom-panel-card glass-panel">
          <div className="panel-header">
            <h3>Broadcast Notice</h3>
          </div>
          <form onSubmit={handleBroadcast} className="broadcast-form">
            <div className="form-group">
              <label htmlFor="broadcastMessage">Broadcasting alert message</label>
              <textarea
                id="broadcastMessage"
                name="broadcastMessage"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type a message to instantly broadcast to all students..."
                className="glass-input broadcast-textarea"
                rows="3"
                required
              />
            </div>
            <button type="submit" className="glass-button broadcast-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Broadcast Alert
            </button>
          </form>
        </div>

        {/* Audit Log / Activity */}
        <div className="bottom-panel-card glass-panel">
          <div className="panel-header">
            <h3>Live Activity Log</h3>
          </div>
          <div className="logs-container">
            {logs.map((log) => (
              <div key={log.id} className="log-row">
                <span className="log-time">{log.time}</span>
                <span className="log-divider">|</span>
                <span className="log-text">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .chart-grid-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        @media (max-width: 900px) {
          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        .bottom-panel-card {
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--panel-border);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .broadcast-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .broadcast-textarea {
          resize: none;
          line-height: 1.4;
        }

        .logs-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 160px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .log-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .log-time {
          color: var(--text-muted);
          font-weight: 600;
          font-family: ui-monospace, monospace;
          min-width: 45px;
        }

        .log-divider {
          color: var(--panel-border-hover);
        }

        .log-text {
          color: var(--text-secondary);
        }
          .broadcast-btn {
  width: fit-content;
  align-self: flex-start;
  padding: 8px 14px;
  font-size: 13px;
  height: 36px;
}

.broadcast-btn svg {
  width: 14px;
  height: 14px;
}
      `}</style>
    </div>
  );
};

export default Dashboard;
