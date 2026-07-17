import React from 'react';

const FounderDashboard = () => {
  const metrics = [
    { title: 'Investor Pitch Target (Series A)', progress: '75%', value: '₹ 15.0 Cr Seek', status: 'In Due Diligence' },
    { title: 'Customer Acquisition Cost (CAC)', progress: '92%', value: '₹ 840 / student', status: 'Within Target (₹900)' },
    { title: 'Customer Lifetime Value (LTV)', progress: '120%', value: '₹ 18,400', status: 'Excellent Growth' }
  ];

  const financialLogs = [
    { label: 'System Monthly Burn Rate', value: '₹ 14.5 Lakhs', status: 'Stable' },
    { label: 'Net Profit Margin Ratio', value: '38.2%', status: 'Healthy' },
    { label: 'Annual Contract Value Run-rate', value: '₹ 29.8 Crore', status: 'Increasing' },
    { label: 'Current Cash Runway Index', value: '18 Months', status: 'Safe Zone' }
  ];

  return (
    <div className="founder-dashboard-view">
      <div>
        <h2 className="view-title">Founder Strategic Dashboard</h2>
        <p className="view-subtitle">Private custody KPIs, Series A capitalization metrics, burn rate forecasts, and customer LTV ratios.</p>
      </div>

      <div className="founder-metrics-row">
        <div className="glass-panel metric-card-fnd">
          <span className="mf-lbl">LTV : CAC Ratio</span>
          <span className="mf-val">21.9x</span>
          <span className="mf-trend pos">Outstanding (Target: {'>'} 5.0x)</span>
        </div>
        <div className="glass-panel metric-card-fnd">
          <span className="mf-lbl">Monthly Cash Runway</span>
          <span className="mf-val">18.4 Months</span>
          <span className="mf-trend">Cash Reserves: ₹ 2.6 Crore</span>
        </div>
        <div className="glass-panel metric-card-fnd">
          <span className="mf-lbl">Series A Target Achieved</span>
          <span className="mf-val">75%</span>
          <span className="mf-trend pos">₹ 11.2 Cr committed</span>
        </div>
      </div>

      <div className="founder-grid">
        {/* Left: Strategic Targets */}
        <div className="founder-col-left glass-panel targets-card">
          <h3>Strategic Growth Targets</h3>
          <div className="targets-list-fnd">
            {metrics.map((m, idx) => (
              <div key={idx} className="target-row-fnd">
                <div className="target-header-fnd">
                  <h4 className="target-title-fnd">{m.title}</h4>
                  <span className="target-val-fnd">{m.value}</span>
                </div>
                <div className="target-progress-container-fnd">
                  <div className="target-progress-fill-fnd" style={{ width: m.progress }}></div>
                </div>
                <div className="target-meta-fnd">
                  <span>Progress: {m.progress}</span>
                  <span className="target-status-tag">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Private Ledger */}
        <div className="founder-col-right glass-panel ledger-card">
          <h3>Private Financial Ledger</h3>
          <p className="ledger-desc">Confidential runway indices, targets, and strategic margins.</p>
          <div className="ledger-rows-fnd">
            {financialLogs.map((log, idx) => (
              <div key={idx} className="ledger-row-fnd">
                <span className="ledger-lbl">{log.label}</span>
                <div className="ledger-right">
                  <span className="ledger-val">{log.value}</span>
                  <span className="ledger-status-badge">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .founder-dashboard-view {
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

        .founder-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .founder-metrics-row {
            grid-template-columns: 1fr;
          }
        }

        .metric-card-fnd {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mf-lbl {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .mf-val {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mf-trend {
          font-size: 12px;
          color: var(--text-muted);
        }

        .mf-trend.pos {
          color: var(--success-color);
          font-weight: 550;
        }

        .founder-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .founder-grid {
            grid-template-columns: 1fr;
          }
        }

        .targets-card, .ledger-card {
          padding: 24px;
        }

        .targets-card h3, .ledger-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 18px;
        }

        .ledger-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .targets-list-fnd {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .target-row-fnd {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .target-header-fnd {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .target-title-fnd {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .target-val-fnd {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-blue);
        }

        .target-progress-container-fnd {
          width: 100%;
          height: 6px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .target-progress-fill-fnd {
          height: 100%;
          background: var(--accent-blue);
          border-radius: 3px;
        }

        .target-meta-fnd {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
        }

        .target-status-tag {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .ledger-rows-fnd {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ledger-row-fnd {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ledger-lbl {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 550;
        }

        .ledger-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ledger-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ledger-status-badge {
          font-size: 10px;
          font-weight: 700;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default FounderDashboard;
