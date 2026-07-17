import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaKey,
  FaShieldAlt,
  FaUserCheck,
  FaCircle,
  FaTimes
} from 'react-icons/fa';

const SecurityCompliance = () => {
  const {
    adminUser,
    employees = [],
    addEmployee,
    updateEmployee,
    deleteEmployee,
    globalLoading
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'employees'
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [empPermissions, setEmpPermissions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [sessions, setSessions] = useState([
    { id: 1, location: 'New Delhi, India (IP: 103.88.22.45)', device: 'Chrome / macOS', active: 'Active Now' },
    { id: 2, location: 'Mumbai, India (IP: 49.36.12.89)', device: 'Safari / iPhone 14', active: '2 hours ago' },
    { id: 3, location: 'Bengaluru, India (IP: 182.74.88.110)', device: 'Edge / Windows 11', active: 'Jul 15, 2026' }
  ]);

  const [logs] = useState([
    { id: 1, event: 'Successful Login', user: 'admin@vlm.com', date: 'Today, 12:40', ip: '103.88.22.45' },
    { id: 2, event: 'Failed Password Attempt', user: 'guest_teacher', date: 'Today, 09:15', ip: '106.51.223.14' },
    { id: 3, event: 'API Key Created', user: 'developer_root', date: 'Yesterday, 14:00', ip: '182.74.88.110' },
    { id: 4, event: 'Password Recovery Dispatched', user: 'parent_harsh', date: 'Jul 15, 11:20', ip: '49.36.12.89' }
  ]);

  const permissionList = [
    { key: 'students', label: 'Students Manager', category: 'Management' },
    { key: 'teachers', label: 'Teachers Manager', category: 'Management' },
    { key: 'parents', label: 'Parents Manager', category: 'Management' },
    { key: 'study-materials', label: 'Content Management', category: 'Management' },
    { key: 'liveclasses', label: 'Live Class Schedule', category: 'Management' },
    { key: 'mcqs', label: 'Test & MCQ', category: 'Management' },
    { key: 'ai', label: 'AI Engine Management', category: 'Management' },
    { key: 'gamification', label: 'Gamification Systems', category: 'Management' },
    { key: 'communication', label: 'Communication Hub', category: 'Management' },
    { key: 'financials', label: 'Subscription & Billing', category: 'Management' },
    { key: 'wallet', label: 'Wallet & Rewards', category: 'Management' },
    { key: 'tickets', label: 'Support Tickets', category: 'Management' },
    { key: 'analytics', label: 'Analytics & Reports', category: 'Operations' },
    { key: 'banners', label: 'Marketing Banner Ads', category: 'Operations' },
    { key: 'settings', label: 'System Configuration', category: 'Operations' },
    { key: 'employees', label: 'Security & Employees', category: 'Operations' },
    { key: 'media', label: 'CDN & Media Manager', category: 'Operations' },
    { key: 'founder', label: 'Founder Projections', category: 'Founder' }
  ];

  const handleTerminateSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    alert('Session terminated. Force logout will trigger on next API handshake.');
  };

  const isSuperAdminOrHasPermission = adminUser?.isSuperAdmin || adminUser?.permissions?.includes('employees');

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedEmp(null);
    setName('');
    setEmail('');
    setPassword('');
    setStatus('active');
    setEmpPermissions([]);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setModalMode('edit');
    setSelectedEmp(emp);
    setName(emp.name || '');
    setEmail(emp.email || '');
    setPassword('');
    setStatus(emp.status || 'active');
    setEmpPermissions(emp.permissions || []);
    setErrorMsg('');
    setShowModal(true);
  };

  const handlePermissionToggle = (key) => {
    if (empPermissions.includes(key)) {
      setEmpPermissions(empPermissions.filter(k => k !== key));
    } else {
      setEmpPermissions([...empPermissions, key]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email) {
      setErrorMsg('Name and Email are required.');
      return;
    }

    if (modalMode === 'add' && !password) {
      setErrorMsg('Password is required for new employees.');
      return;
    }

    const payload = {
      name,
      email,
      permissions: empPermissions,
      status
    };

    if (password) {
      payload.password = password;
    }

    try {
      let success = false;
      if (modalMode === 'add') {
        success = await addEmployee(payload);
      } else {
        success = await updateEmployee(selectedEmp._id, payload);
      }

      if (success) {
        setShowModal(false);
      } else {
        setErrorMsg('Failed to save employee. Email might already exist.');
      }
    } catch (err) {
      setErrorMsg('An error occurred while saving.');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee account? This action is irreversible.')) {
      try {
        await deleteEmployee(id);
      } catch (err) {
        alert('Failed to delete employee.');
      }
    }
  };

  return (
    <div className="security-compliance-view">
      {/* Page Header */}
      <div className="security-header-row">
        <div>
          <h2 className="view-title">Security & Employee Access Control</h2>
          <p className="view-subtitle">Monitor security alerts, audit sign-in sessions, and configure role permissions for employees.</p>
        </div>

        {/* Tab Selector */}
        <div className="sec-tab-selectors">
          <button 
            className={`sec-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <FaShieldAlt style={{ marginRight: '6px' }} /> Sign-ins & Logs
          </button>
          {isSuperAdminOrHasPermission && (
            <button 
              className={`sec-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <FaUserShield style={{ marginRight: '6px' }} /> Employee Permissions
            </button>
          )}
        </div>
      </div>

      {activeTab === 'logs' && (
        <div className="security-grid">
          {/* Left Column: Sign-in audit log */}
          <div className="security-col-left glass-panel audit-logs-card">
            <h3>Authentication Audit Log</h3>
            <p className="sec-sub">Real-time gatekeeping log events.</p>
            <div className="sec-logs-list">
              {logs.map((log) => (
                <div key={log.id} className="sec-log-row">
                  <div className="sec-log-left">
                    <span className={`sec-icon-badge ${log.event.includes('Failed') ? 'fail' : 'success'}`}>
                      {log.event.includes('Failed') ? '⚠️' : '🔑'}
                    </span>
                    <div>
                      <h4 className="sec-event">{log.event}</h4>
                      <span className="sec-user">{log.user} • IP: {log.ip}</span>
                    </div>
                  </div>
                  <span className="sec-date">{log.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sessions management */}
          <div className="security-col-right glass-panel sessions-card">
            <h3>Active Admin Sessions</h3>
            <p className="sec-sub">Review open browser handles holding security tokens.</p>
            <div className="sessions-list">
              {sessions.map((s) => (
                <div key={s.id} className="session-row">
                  <div>
                    <h4 className="sess-dev">{s.device}</h4>
                    <span className="sess-loc">{s.location} • <span className="active-tag">{s.active}</span></span>
                  </div>
                  {s.active !== 'Active Now' && (
                    <button className="glass-button size-sm secondary revoke-sess-btn" onClick={() => handleTerminateSession(s.id)}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && isSuperAdminOrHasPermission && (
        <div className="glass-panel employees-manager-card">
          <div className="emp-card-header">
            <div>
              <h3>Employee Sub-Admin Accounts</h3>
              <p className="sec-sub">Manage logins and assign workspace-specific permission features.</p>
            </div>
            <button className="glass-button size-md primary add-emp-btn" onClick={handleOpenAdd}>
              <FaPlus style={{ marginRight: '6px' }} /> Add Employee
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="emp-empty-state">
              <span className="empty-emoji">👥</span>
              <h4>No Employee Accounts Found</h4>
              <p>Create dedicated employee sub-admin credentials and assign custom feature modules.</p>
            </div>
          ) : (
            <div className="emp-table-wrapper">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Assigned Feature Permissions</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="emp-name-cell">
                          <span className="emp-avatar-init">{emp.name?.slice(0, 2).toUpperCase()}</span>
                          <span className="emp-name-text">{emp.name}</span>
                        </div>
                      </td>
                      <td><span className="emp-email-text">{emp.email}</span></td>
                      <td>
                        <span className={`emp-status-badge ${emp.status === 'blocked' ? 'blocked' : 'active'}`}>
                          <FaCircle style={{ fontSize: '7px', marginRight: '5px' }} />
                          {emp.status === 'blocked' ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="emp-permissions-wrap">
                          {emp.permissions?.length === 0 ? (
                            <span className="no-perm-tag">No Access (View Only)</span>
                          ) : (
                            emp.permissions?.map(perm => (
                              <span key={perm} className="perm-badge-pill">
                                {permissionList.find(p => p.key === perm)?.label || perm}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="emp-actions-row">
                          <button 
                            className="emp-action-btn edit" 
                            title="Edit Permissions"
                            onClick={() => handleOpenEdit(emp)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="emp-action-btn delete" 
                            title="Remove Employee"
                            onClick={() => handleDeleteClick(emp._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Form Modal */}
      {showModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-card glass-panel animate-slide">
            <div className="modal-header-new">
              <h3>{modalMode === 'add' ? 'Create Employee Account' : 'Edit Employee Permissions'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form-new">
              {errorMsg && <div className="modal-error-alert">⚠️ {errorMsg}</div>}

              <div className="form-grid-2col">
                <div className="form-group-new">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="form-group-new">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@vlmacademy.com"
                    required
                    disabled={modalMode === 'edit'}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="form-group-new">
                  <label>{modalMode === 'add' ? 'Access Password' : 'Reset Password (optional)'}</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={modalMode === 'add' ? 'Set password' : 'Leave empty to keep current'}
                    required={modalMode === 'add'}
                  />
                </div>
                <div className="form-group-new">
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="modal-permissions-section">
                <h4>Feature Module Permissions</h4>
                <p className="section-desc">Select which dashboard tabs and features this employee is authorized to access.</p>
                
                <div className="perm-checkbox-grid">
                  {permissionList.map((perm) => {
                    const isChecked = empPermissions.includes(perm.key);
                    return (
                      <div 
                        key={perm.key} 
                        className={`perm-checkbox-card ${isChecked ? 'selected' : ''}`}
                        onClick={() => handlePermissionToggle(perm.key)}
                      >
                        <div className="checkbox-outer">
                          <div className={`checkbox-inner ${isChecked ? 'checked' : ''}`} />
                        </div>
                        <div className="perm-info">
                          <span className="perm-lbl-text">{perm.label}</span>
                          <span className="perm-cat-lbl">{perm.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer-new">
                <button type="button" className="glass-button size-md secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="glass-button size-md primary" disabled={globalLoading}>
                  {globalLoading ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .security-compliance-view {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .security-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .security-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
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

        .sec-tab-selectors {
          display: flex;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 4px;
          border: 1px solid #e2e8f0;
        }

        .sec-tab-btn {
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 650;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .sec-tab-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .security-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .security-grid {
            grid-template-columns: 1fr;
          }
        }

        .audit-logs-card, .sessions-card, .employees-manager-card {
          padding: 24px;
        }

        .audit-logs-card h3, .sessions-card h3, .employees-manager-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .sec-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 6px 0 20px 0;
        }

        .sec-logs-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sec-log-row {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sec-log-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sec-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .sec-icon-badge.success {
          background: rgba(16, 185, 129, 0.1);
        }

        .sec-icon-badge.fail {
          background: rgba(239, 68, 68, 0.1);
        }

        .sec-event {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .sec-user {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .sec-date {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .session-row {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sess-dev {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .sess-loc {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .sess-loc .active-tag {
          color: var(--success-color);
          font-weight: 600;
        }

        .revoke-sess-btn {
          border-color: rgba(239, 68, 68, 0.2) !important;
          color: var(--error-color) !important;
        }

        .revoke-sess-btn:hover {
          background: rgba(239, 68, 68, 0.05) !important;
        }

        /* Employees Management Tab */
        .emp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .emp-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
        }

        .empty-emoji {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .emp-empty-state h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .emp-empty-state p {
          font-size: 13px;
          color: #64748b;
          max-width: 400px;
        }

        .emp-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 10px;
        }

        .emp-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .emp-table th {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 12px 16px;
          border-bottom: 2px solid #f1f5f9;
        }

        .emp-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .emp-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .emp-avatar-init {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 700;
        }

        .emp-name-text {
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
        }

        .emp-email-text {
          font-size: 13px;
          color: #64748b;
        }

        .emp-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }

        .emp-status-badge.active {
          background: #ecfdf5;
          color: #047857;
        }

        .emp-status-badge.blocked {
          background: #fef2f2;
          color: #b91c1c;
        }

        .emp-permissions-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-width: 450px;
        }

        .perm-badge-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
        }

        .no-perm-tag {
          font-size: 11.5px;
          color: #94a3b8;
          font-style: italic;
        }

        .emp-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .emp-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .emp-action-btn.edit:hover {
          background: #f0fdf4;
          border-color: #86efac;
          color: #16a34a;
        }

        .emp-action-btn.delete:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        /* Modal Overlay & Card */
        .emp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .emp-modal-card {
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          background: #ffffff;
          padding: 28px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .close-modal-btn {
          background: transparent;
          border: none;
          font-size: 16px;
          color: #64748b;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-modal-btn:hover {
          color: #0f172a;
        }

        .modal-form-new {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 15px;
        }

        .modal-error-alert {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 600;
        }

        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .form-grid-2col {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }

        .form-group-new {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group-new label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
        }

        .form-group-new input, .form-group-new select {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }

        .form-group-new input:focus, .form-group-new select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-permissions-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }

        .modal-permissions-section h4 {
          font-size: 14px;
          font-weight: 650;
          color: #0f172a;
          margin: 0;
        }

        .section-desc {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
        }

        .perm-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        @media (max-width: 768px) {
          .perm-checkbox-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .perm-checkbox-grid {
            grid-template-columns: 1fr;
          }
        }

        .perm-checkbox-card {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .perm-checkbox-card:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .perm-checkbox-card.selected {
          border-color: #3b82f6;
          background: #f0f6ff;
        }

        .checkbox-outer {
          width: 16px;
          height: 16px;
          border: 2px solid #94a3b8;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .perm-checkbox-card.selected .checkbox-outer {
          border-color: #3b82f6;
          background: #3b82f6;
        }

        .checkbox-inner {
          width: 6px;
          height: 6px;
          background: transparent;
          border-radius: 1px;
          transition: all 0.2s;
        }

        .checkbox-inner.checked {
          background: #ffffff;
        }

        .perm-info {
          display: flex;
          flex-direction: column;
        }

        .perm-lbl-text {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .perm-cat-lbl {
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .modal-footer-new {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 15px;
          border-top: 1px solid #f1f5f9;
          padding-top: 18px;
        }
      `}</style>
    </div>
  );
};

export default SecurityCompliance;
