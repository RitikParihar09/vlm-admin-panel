import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaBook,
  FaVideo,
  FaQuestionCircle,
  FaBell
} from "react-icons/fa";

const Navbar = ({ activeView, setActiveView }) => {
  const { adminUser, doubts, updateAdminUser } = useAdmin();

  const getViewName = () => {
    switch (activeView) {
      case 'dashboard': return 'Admin Overview';
      case 'students': return 'Student Directory & Rewards';
      case 'teachers': return 'Teacher Registry';
      case 'parents': return 'Parent Links Manager';
      case 'liveclasses': return 'Live Lecture Schedules';
      case 'studymaterial': return 'Study Resource Library';
      case 'mcqtasks': return 'MCQ Assessment Builder';
      case 'doubts': return 'Student Doubt Center';
      case 'shortvideos': return 'Short Clip Management';
      default: return 'Admin Console';
    }
  };

  const getViewIcon = () => {
    switch (activeView) {
      case 'dashboard':
        return <FaTachometerAlt className="navbar-title-icon" style={{ color: '#3b82f6' }} />;

      case 'students':
        return <FaUserGraduate className="navbar-title-icon" style={{ color: '#10b981' }} />;

      case 'teachers':
        return <FaChalkboardTeacher className="navbar-title-icon" style={{ color: '#f59e0b' }} />;

      case 'parents':
        return <FaUsers className="navbar-title-icon" style={{ color: '#8b5cf6' }} />;

      case 'liveclasses':
        return <FaVideo className="navbar-title-icon" style={{ color: '#ef4444' }} />;

      case 'studymaterial':
        return <FaBook className="navbar-title-icon" style={{ color: '#06b6d4' }} />;

      case 'mcqtasks':
        return <FaBook className="navbar-title-icon" style={{ color: '#22c55e' }} />;

      case 'doubts':
        return <FaQuestionCircle className="navbar-title-icon" style={{ color: '#f97316' }} />;

      case 'shortvideos':
        return <FaVideo className="navbar-title-icon" style={{ color: '#ec4899' }} />;
    }
  };

  const openDoubtsCount = (doubts || []).filter(d => d.status === 'Open').length;
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: adminUser?.username || '', role: adminUser?.role || '' });

  return (
    <>
      <header className="navbar-container glass-panel">
        <div className="navbar-left">
          {getViewIcon()}
          <h2>{getViewName()}</h2>
        </div>

        <div className="navbar-right">
          {openDoubtsCount > 0 && (
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              className="alert-badge tooltip"
              data-tooltip={`${openDoubtsCount} doubts need response`}
              aria-label={`${openDoubtsCount} open doubts, view notifications`}
            >
              <FaBell className="animate-pulse" size={20} color="#facc15" />
              <span className="badge-count">{openDoubtsCount}</span>
            </button>
          )}

          <div
            className="admin-profile"
            role="button"
            tabIndex={0}
            onClick={() => { setAdminForm({ username: adminUser?.username || '', role: adminUser?.role || '' }); setAdminOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setAdminForm({ username: adminUser?.username || '', role: adminUser?.role || '' }); setAdminOpen(true); } }}
          >
            <div className="admin-avatar">A</div>
            <div className="admin-info">
              <span className="admin-name">{adminUser?.username || 'Administrator'}</span>
              <span className="admin-role">{adminUser?.role || 'Super Admin'}</span>
            </div>
          </div>
        </div>

        <style>{`
      .glass-button.size-sm{
    padding:8px 14px;
    font-size:13px;
}
      .navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-title-icon {
  font-size: 28px;
  flex-shrink: 0;
}
        .navbar-container {
          height: var(--navbar-height);
          margin: 15px 15px 0 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 25px;
          border-radius: 16px;
          border: 1px solid var(--panel-border);
        }

        .navbar-left h2 {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.5px;
          background: linear-gradient(120deg, #ffffff, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .alert-badge {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--panel-border);
          transition: all 0.2s ease;
        }

        .alert-badge:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--panel-border-hover);
        }

        .alert-badge svg {
          width: 20px;
          height: 20px;
          color: var(--warning-color);
        }

        .badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--error-color);
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 6px 14px 6px 6px;
          border-radius: 9999px;
          border: 1px solid var(--panel-border);
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .admin-profile:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }

        .admin-info {
          display: flex;
          flex-direction: column;
        }

        .admin-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .admin-role {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
      `}</style>
      </header>

      {notifOpen && (
        <div className="notif-overlay" role="dialog" aria-modal="true" onClick={() => setNotifOpen(false)}>
          <div
            className="notif-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
            role="document"
            aria-label="Notifications"
          >
            <div className="notif-header">
              <h3>Notifications</h3>
              <button
                className="modal-close-btn"
                onClick={() => setNotifOpen(false)}
                aria-label="Close notifications"
              >
                ×
              </button>
            </div>

            <div className="notif-list">
              {doubts.filter(d => d.status === 'Open').length === 0 && (
                <div className="notif-empty">No new notifications.</div>
              )}

              {doubts.filter(d => d.status === 'Open').map((d) => (
                <div key={d.id} className="notif-item">
                  <div className="notif-title">{d.studentName}</div>
                  <div className="notif-body">{d.question}</div>
                  <div className="notif-actions">
                    <button
                      className="glass-button secondary size-sm"
                      onClick={() => { setNotifOpen(false); setActiveView && setActiveView('doubts'); }}
                    >
                      Open Doubt Center
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .notif-overlay {
              position: fixed;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0,0,0,0.45);
              backdrop-filter: blur(6px);
              z-index: 999999;
              padding: 20px;
            }

            .notif-modal {
              width: 500px;
              max-width: 90vw;
              max-height: 70vh;
              overflow-y: auto;
              border-radius: 14px;
              padding: 18px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.45);
              border: 1px solid rgba(255,255,255,0.06);
              background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
              display: flex;
              flex-direction: column;
              gap: 14px;
            }

            .notif-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            }

            .notif-header h3 {
              margin: 0;
              font-size: 18px;
              font-weight: 700;
              color: var(--text-primary);
            }

            .modal-close-btn {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.04);
              color: var(--text-primary);
              font-size: 18px;
              line-height: 1;
              width: 36px;
              height: 36px;
              border-radius: 10px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.15s ease;
            }

            .modal-close-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.06); }

            .notif-list { display: flex; flex-direction: column; gap: 12px; padding-top: 6px; }

            .notif-item {
              padding: 12px;
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.03);
              background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01));
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .notif-title { font-weight: 700; color: var(--text-primary); font-size: 14px; }
            .notif-body { color: var(--text-secondary); font-size: 13px; }
            .notif-actions { display: flex; justify-content: flex-end; }
            .notif-empty { color: var(--text-muted); text-align: center; padding: 18px 8px; }
          `}</style>
        </div>
      )}

      {adminOpen && (
        <div className="admin-overlay" role="dialog" aria-modal="true" onClick={() => setAdminOpen(false)}>
          <div
            className="admin-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
            role="document"
            aria-label="Admin Profile"
          >
            <div className="admin-header">
              <h3>Admin Profile</h3>
              <button className="modal-close-btn" onClick={() => setAdminOpen(false)} aria-label="Close admin profile">×</button>
            </div>

            <form className="admin-form" onSubmit={(e) => { e.preventDefault(); updateAdminUser(adminForm); setAdminOpen(false); }}>
              <div className="form-row">
                <label htmlFor="adminUsername">Username</label>
                <input id="adminUsername" name="adminUsername" value={adminForm.username} onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))} className="glass-input" />
              </div>

              <div className="form-row">
                <label htmlFor="adminRole">Role</label>
                <input id="adminRole" name="adminRole" value={adminForm.role} onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value }))} className="glass-input" />
              </div>

              <div className="form-actions">
                <button type="button" className="glass-button secondary" onClick={() => setAdminOpen(false)}>Cancel</button>
                <button type="submit" className="glass-button">Save</button>
              </div>
            </form>
          </div>

          <style>{`
            .admin-overlay {
              position: fixed;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0,0,0,0.45);
              backdrop-filter: blur(6px);
              z-index: 999999;
              padding: 20px;
            }

            .admin-modal {
              width: 500px;
              max-width: 90vw;
              max-height: 70vh;
              overflow-y: auto;
              border-radius: 14px;
              padding: 20px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.45);
              border: 1px solid rgba(255,255,255,0.06);
              background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .admin-header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
            .admin-header h3 { margin:0; font-size:18px; }
            .admin-form { display:flex; flex-direction:column; gap:12px; }
            .form-row { display:flex; flex-direction:column; gap:6px; }
            .form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:6px; }
            .glass-input { padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:transparent; color:var(--text-primary); }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Navbar;
