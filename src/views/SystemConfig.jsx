import React, { useState } from 'react';

const SystemConfig = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [smtpServer, setSmtpServer] = useState('smtp.sendgrid.net');

  const handleSaveConfig = (e) => {
    e.preventDefault();
    alert('System configurations saved successfully.');
  };

  return (
    <div className="system-config-view">
      <div>
        <h2 className="view-title">System Settings & Configuration</h2>
        <p className="view-subtitle">Toggle server operational states, manage assets branding, and inspect SMTP configs.</p>
      </div>

      <div className="config-grid">
        {/* Left Column: Server Status & Brand */}
        <div className="config-col-left">
          <div className="glass-panel maint-card">
            <h3>Server Operations Scope</h3>
            <div className="toggle-row-maint">
              <div>
                <h4 className="toggle-heading">Maintenance Mode</h4>
                <p className="toggle-desc">Instantly disconnect all active non-admin sessions and show a temporary downtime poster.</p>
              </div>
              <button 
                type="button" 
                className={`maint-btn ${maintenance ? 'active' : ''}`}
                onClick={() => setMaintenance(!maintenance)}
              >
                {maintenance ? '🔴 Active' : '🟢 Offline'}
              </button>
            </div>
          </div>

          <div className="glass-panel brand-card">
            <h3>Visual Branding Custody</h3>
            <form onSubmit={handleSaveConfig} className="brand-form">
              <div className="form-group">
                <label>Institution Logo URL</label>
                <input 
                  type="text" 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)} 
                  placeholder="https://assets.vlm.com/logo.png"
                  className="glass-input"
                />
              </div>
              <div className="form-group">
                <label>Portal Accent Shade</label>
                <div className="color-presets">
                  <span className="color-dot blue active"></span>
                  <span className="color-dot indigo"></span>
                  <span className="color-dot violet"></span>
                  <span className="color-dot pink"></span>
                </div>
              </div>
              <button type="submit" className="glass-button save-brand-btn">
                Apply Brand Tokens
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Server Credentials */}
        <div className="config-col-right glass-panel mail-db-card">
          <h3>SMTP Mail & Datastore Configurations</h3>
          <p className="db-sub">Manage system triggers, background tasks, and mailing lists.</p>
          
          <form onSubmit={handleSaveConfig} className="smtp-form">
            <div className="form-group">
              <label>SMTP Relay Server Address</label>
              <input 
                type="text" 
                value={smtpServer} 
                onChange={(e) => setSmtpServer(e.target.value)} 
                className="glass-input" 
              />
            </div>
            <div className="form-group-row-config">
              <div className="form-group">
                <label>SMTP Port</label>
                <input type="text" defaultValue="587" className="glass-input" style={{ width: '80px' }} />
              </div>
              <div className="form-group">
                <label>Mail Encryption</label>
                <select className="glass-select">
                  <option value="tls">STARTTLS (Secure)</option>
                  <option value="ssl">SSL/TLS</option>
                  <option value="none">None (Insecure)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Automated Database Backups</label>
              <div className="checkbox-setting-row">
                <input type="checkbox" defaultChecked id="db-backup" className="setting-checkbox" />
                <label htmlFor="db-backup" className="checkbox-setting-label">
                  Perform daily cron dumps to AWS S3 bucket.
                </label>
              </div>
            </div>

            <button type="submit" className="glass-button save-smtp-btn">
              Apply Server Configs
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .system-config-view {
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

        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .config-grid {
            grid-template-columns: 1fr;
          }
        }

        .config-col-left {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .maint-card, .brand-card, .mail-db-card {
          padding: 24px;
        }

        .maint-card h3, .brand-card h3, .mail-db-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 18px;
        }

        .toggle-row-maint {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .toggle-heading {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .toggle-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
          max-width: 320px;
        }

        .maint-btn {
          border: 1px solid var(--panel-border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          min-width: 90px;
          text-align: center;
        }

        .maint-btn.active {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--error-color);
          color: var(--error-color);
        }

        .brand-form, .smtp-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .color-presets {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .color-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .color-dot.blue { background: #3b82f6; }
        .color-dot.indigo { background: #6366f1; }
        .color-dot.violet { background: #8b5cf6; }
        .color-dot.pink { background: #ec4899; }

        .color-dot:hover {
          transform: scale(1.1);
        }

        .color-dot.active {
          border-color: var(--text-primary);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .save-brand-btn, .save-smtp-btn {
          width: 100%;
          justify-content: center;
        }

        .db-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .form-group-row-config {
          display: flex;
          gap: 16px;
        }

        .checkbox-setting-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .setting-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--accent-blue);
          cursor: pointer;
        }

        .checkbox-setting-label {
          font-size: 13px;
          color: var(--text-secondary) !important;
          font-weight: 400 !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SystemConfig;
