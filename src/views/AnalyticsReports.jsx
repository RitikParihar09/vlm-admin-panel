import React from 'react';

const AnalyticsReports = () => {
  const reportsList = [
    { id: 1, name: 'Student Enrollment Report Q2', type: 'Excel Spreadsheet (XLSX)', size: '2.4 MB', date: 'Yesterday, 17:00' },
    { id: 2, name: 'Active Teachers Payroll Ledger', type: 'PDF Document', size: '840 KB', date: 'Jul 14, 2026' },
    { id: 3, name: 'MCQ Term Exam Aggregated Analysis', type: 'CSV Document', size: '12.8 MB', date: 'Jul 10, 2026' },
    { id: 4, name: 'Google Ads Marketing Campaign Leads', type: 'CSV Document', size: '1.2 MB', date: 'Jul 05, 2026' }
  ];

  const cohorts = [
    { cohort: 'May 2026 Batch', size: 1200, m1: '95%', m2: '89%', m3: '84%' },
    { cohort: 'June 2026 Batch', size: 1540, m1: '97%', m2: '91%', m3: '--' },
    { cohort: 'July 2026 Batch', size: 1890, m1: '98%', m2: '--', m3: '--' }
  ];

  return (
    <div className="analytics-reports-view">
      <div>
        <h2 className="view-title">Analytics & Reports Engine</h2>
        <p className="view-subtitle">Inspect cohorts, compile average test score matrices, and download detailed audits.</p>
      </div>

      <div className="analytics-grid">
        {/* Left: Retention Cohorts */}
        <div className="analytics-col-left glass-panel cohorts-card">
          <h3>Batch Retention Cohorts</h3>
          <p className="cohort-subtitle">Percentage of students continuing active studies month-over-month.</p>

          <div className="cohort-table-wrapper">
            <table className="cohort-table">
              <thead>
                <tr>
                  <th>Cohort Batch</th>
                  <th>Size</th>
                  <th>Month 1</th>
                  <th>Month 2</th>
                  <th>Month 3</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c, idx) => (
                  <tr key={idx}>
                    <td className="c-name">{c.cohort}</td>
                    <td>{c.size.toLocaleString()}</td>
                    <td className="c-pct">{c.m1}</td>
                    <td className="c-pct">{c.m2}</td>
                    <td className="c-pct">{c.m3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Download Reports */}
        <div className="analytics-col-right glass-panel reports-download-card">
          <div className="reports-header-row">
            <h3>Download Custom Audit Files</h3>
            <button className="glass-button size-sm" onClick={() => alert('New reports generator launched')}>Compile Report</button>
          </div>
          <div className="reports-download-list">
            {reportsList.map((r) => (
              <div key={r.id} className="report-row-dl">
                <div className="report-row-left">
                  <span className="report-icon-dl">📊</span>
                  <div>
                    <h4 className="report-name-dl">{r.name}</h4>
                    <span className="report-meta-dl">{r.type} • {r.size}</span>
                  </div>
                </div>
                <button className="glass-button size-sm secondary" onClick={() => alert(`Downloading ${r.name}`)}>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .analytics-reports-view {
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

        .analytics-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        .cohorts-card, .reports-download-card {
          padding: 24px;
        }

        .cohorts-card h3, .reports-download-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .cohort-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 6px 0 20px 0;
        }

        .cohort-table-wrapper {
          overflow-x: auto;
        }

        .cohort-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .cohort-table th {
          color: var(--text-muted);
          font-weight: 600;
          padding: 12px;
          border-bottom: 1px solid var(--panel-border);
          font-size: 11px;
          text-transform: uppercase;
        }

        .cohort-table td {
          padding: 14px 12px;
          border-bottom: 1px solid var(--panel-border);
          color: var(--text-primary);
        }

        .c-name {
          font-weight: 600;
        }

        .c-pct {
          color: var(--success-color);
          font-weight: 600;
        }

        .reports-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .reports-download-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .report-row-dl {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .report-row-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .report-icon-dl {
          font-size: 22px;
        }

        .report-name-dl {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .report-meta-dl {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default AnalyticsReports;
