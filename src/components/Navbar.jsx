import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaBars,
  FaSearch,
  FaQuestionCircle,
  FaBell,
  FaEnvelope,
  FaAngleDown
} from "react-icons/fa";

const Navbar = ({ activeView, setActiveView, sidebarCollapsed, setSidebarCollapsed }) => {
  const { adminUser, doubts, updateAdminUser } = useAdmin();
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: adminUser?.username || '', role: adminUser?.role || '' });

  const getViewName = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'students': return 'Students Manager';
      case 'teachers': return 'Teachers Manager';
      case 'parents': return 'Parents Linker';
      case 'liveclasses': return 'Live Class schedules';
      case 'studymaterial': return 'Content Management';
      case 'mcqtasks': return 'Test & MCQ Tasks';
      case 'doubts': return 'Doubt & Session Center';
      case 'shortvideos': return 'Short Videos Feed';
      case 'aimanager': return 'AI Management';
      case 'gamification': return 'Gamification Controls';
      case 'communication': return 'Communication Desk';
      case 'subscription':
      case 'sub-plans':
      case 'sub-trials':
      case 'sub-upgrades':
      case 'sub-list':
      case 'sub-renewals':
      case 'sub-expiring':
      case 'sub-billing':
      case 'sub-gst':
        return 'Subscription Management';
      case 'wallet': return 'Wallet & Rewards';
      case 'support': return 'Support Center';
      case 'analytics': return 'Analytics & Reports';
      case 'marketing': return 'Marketing Hub';
      case 'sysconfig': return 'System Configuration';
      case 'security': return 'Security & Compliance';
      case 'media': return 'Media Management';
      case 'founder': return 'Founder Dashboard';
      default: return 'Admin Console';
    }
  };

  const getViewSubtitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Welcome back, Super Admin! 👋';
      default: return `Overview and control parameters for ${getViewName().toLowerCase()}`;
    }
  };

  const openDoubtsCount = (doubts || []).filter(d => d.status === 'Open').length;

  return (
    <>
      <header className="navbar-container">
        {/* Left Side: Toggle menu and View Title */}
        <div className="navbar-left">
          <button 
            type="button" 
            className="menu-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
          <div className="navbar-title-col">
            <h2 className="navbar-title">{getViewName()}</h2>
            <span className="navbar-subtitle">{getViewSubtitle()}</span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="navbar-center">
          <div className="search-bar-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for students, teachers, content..." 
              className="navbar-search-input"
            />
            <span className="kbd-shortcut-badge">⌘K</span>
          </div>
        </div>

        {/* Right Side: Badges and Admin Profile */}
        <div className="navbar-right">
          <button className="navbar-action-btn" aria-label="Help">
            <FaQuestionCircle />
          </button>
          
          <button 
            className="navbar-action-btn badge-btn" 
            aria-label="Notifications"
            onClick={() => setNotifOpen(true)}
          >
            <FaBell />
            <span className="notif-count-badge">12</span>
          </button>

          <button className="navbar-action-btn badge-btn" aria-label="Messages">
            <FaEnvelope />
            <span className="notif-count-badge msg">5</span>
          </button>

          <div 
            className="admin-profile-card"
            onClick={() => { setAdminForm({ username: adminUser?.username || '', role: adminUser?.role || '' }); setAdminOpen(true); }}
          >
            <div className="profile-avatar">SA</div>
            <div className="profile-info-col">
              <span className="profile-name">{adminUser?.username || 'Super Admin'}</span>
              <span className="profile-role">{adminUser?.role || 'Super Admin'}</span>
            </div>
            <FaAngleDown className="profile-chevron" />
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      {notifOpen && (
        <div className="notif-overlay" onClick={() => setNotifOpen(false)}>
          <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notif-header">
              <h3>Notifications</h3>
              <button className="modal-close-btn" onClick={() => setNotifOpen(false)}>×</button>
            </div>

            <div className="notif-list">
              {doubts.filter(d => d.status === 'Open').length === 0 && (
                <div className="notif-empty">No new notifications.</div>
              )}

              {doubts.filter(d => d.status === 'Open').map((d) => (
                <div key={d.id} className="notif-item">
                  <div className="notif-title">{d.studentName} submitted a doubt</div>
                  <div className="notif-body">"{d.question}"</div>
                  <button
                    className="glass-button secondary size-sm"
                    onClick={() => { setNotifOpen(false); setActiveView('doubts'); }}
                    style={{ marginTop: '8px', alignSelf: 'flex-end' }}
                  >
                    Open Doubt Center
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile Details Modal */}
      {adminOpen && (
        <div className="admin-overlay" onClick={() => setAdminOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-header">
              <h3>Admin Profile</h3>
              <button className="modal-close-btn" onClick={() => setAdminOpen(false)}>×</button>
            </div>

            <form className="admin-form" onSubmit={(e) => { e.preventDefault(); updateAdminUser(adminForm); setAdminOpen(false); }}>
              <div className="form-row">
                <label>Username</label>
                <input 
                  value={adminForm.username} 
                  onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))} 
                  className="glass-input" 
                />
              </div>

              <div className="form-row">
                <label>Role</label>
                <input 
                  value={adminForm.role} 
                  onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value }))} 
                  className="glass-input" 
                />
              </div>

              <div className="form-actions">
                <button type="button" className="glass-button secondary" onClick={() => setAdminOpen(false)}>Cancel</button>
                <button type="submit" className="glass-button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .navbar-container {
          height: var(--navbar-height);
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-toggle-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .menu-toggle-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .navbar-title-col {
          display: flex;
          flex-direction: column;
        }

        .navbar-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .navbar-subtitle {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .navbar-center {
          flex-grow: 1;
          max-width: 480px;
          margin: 0 30px;
        }

        .search-bar-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          font-size: 14px;
        }

        .navbar-search-input {
          width: 100%;
          padding: 10px 46px 10px 38px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          font-size: 13.5px;
          color: #0f172a;
          transition: all 0.2s;
        }

        .navbar-search-input:focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .kbd-shortcut-badge {
          position: absolute;
          right: 14px;
          font-size: 10px;
          font-weight: 600;
          background: #e2e8f0;
          color: #64748b;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: inherit;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .navbar-action-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          transition: all 0.2s;
          position: relative;
        }

        .navbar-action-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .notif-count-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          min-width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        .notif-count-badge.msg {
          background: #3b82f6;
        }

        .admin-profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 5px 14px 5px 5px;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .admin-profile-card:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .profile-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-info-col {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .profile-role {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
        }

        .profile-chevron {
          font-size: 11px;
          color: #64748b;
          margin-left: 2px;
        }

        /* Overlay Modals styling */
        .notif-overlay, .admin-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 1000;
          padding: 20px;
        }

        .notif-modal, .admin-modal {
          width: 480px;
          max-width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: modalScale 0.2s ease-out;
        }

        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .notif-header, .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-header h3, .admin-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .modal-close-btn {
          border: none;
          background: #f1f5f9;
          color: #64748b;
          font-size: 18px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
        }

        .notif-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
        }

        .notif-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .notif-body {
          font-size: 12px;
          color: #475569;
        }

        .notif-empty {
          color: #94a3b8;
          text-align: center;
          padding: 20px 0;
          font-size: 13px;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>
    </>
  );
};

export default Navbar;
