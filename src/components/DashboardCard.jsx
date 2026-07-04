import React from 'react';

const DashboardCard = ({ title, value, icon, subtext, themeClass, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`stat-card glass-panel ${themeClass ? 'glow-' + themeClass : ''}`}
      disabled={!onClick}
      aria-label={`${title} card`}
    >
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      <div className={`stat-icon-wrapper ${themeClass || 'default'}`}>
        {icon}
      </div>

      <style>{`
        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px;
          border: 1px solid var(--panel-border);
          position: relative;
          overflow: hidden;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }

        .stat-card:disabled {
          cursor: default;
          opacity: 0.9;
        }

        .stat-card:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .stat-subtext {
          font-size: 12px;
          font-weight: 500;
          color: var(--success-color);
        }

        .stat-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--panel-border);
          color: var(--text-secondary);
        }

        .stat-icon-wrapper.student {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.2);
          color: var(--student-color);
        }

        .stat-icon-wrapper.teacher {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
          color: var(--teacher-color);
        }

        .stat-icon-wrapper.parent {
          background: rgba(236, 72, 153, 0.1);
          border-color: rgba(236, 72, 153, 0.2);
          color: var(--parent-color);
        }

        .stat-icon-wrapper.default {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
          color: var(--accent-blue);
        }
      `}</style>
      </button>
  );
};

export default DashboardCard;
