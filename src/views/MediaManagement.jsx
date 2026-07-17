import React from 'react';

const MediaManagement = () => {
  const assets = [
    { id: 1, name: 'class12_math_limits.mp4', type: 'Video', size: '240.5 MB', uploader: 'Dr. Ramesh Patil', cdn: 'Cached' },
    { id: 2, name: 'physics_handout_thermo.pdf', type: 'PDF Document', size: '4.8 MB', uploader: 'Prof. Amrit Sen', cdn: 'Cached' },
    { id: 3, name: 'banner_national_scholarship.jpg', type: 'Image', size: '1.2 MB', uploader: 'Marketing Team', cdn: 'Direct' },
    { id: 4, name: 'chemistry_class_structure.xlsx', type: 'Spreadsheet', size: '120 KB', uploader: 'Super Admin', cdn: 'Direct' }
  ];

  return (
    <div className="media-management-view">
      <div>
        <h2 className="view-title">Media & Asset Management</h2>
        <p className="view-subtitle">Inspect uploaded lectures, configure image/video transcoders, and trace CDN caches.</p>
      </div>

      <div className="media-metrics">
        <div className="glass-panel metric-card-media">
          <span className="mme-lbl">Datastore Consumption</span>
          <span className="mme-val">1.2 TB</span>
          <div className="progress-bar-container-media">
            <div className="progress-fill-media" style={{ width: '68%' }}></div>
          </div>
          <span className="mme-trend">68% of 2 TB AWS S3 tier</span>
        </div>
        <div className="glass-panel metric-card-media">
          <span className="mme-lbl">Monthly CDN Traffic</span>
          <span className="mme-val">14.8 TB</span>
          <span className="mme-trend pos">98.4% Cache Hit Rate</span>
        </div>
        <div className="glass-panel metric-card-media">
          <span className="mme-lbl">Transcoded Outputs</span>
          <span className="mme-val">12,450 files</span>
          <span className="mme-trend">Multi-bitrate MP4s</span>
        </div>
      </div>

      <div className="media-grid">
        {/* Left Column: Asset Library */}
        <div className="media-col-left glass-panel asset-library-card">
          <div className="library-header">
            <h3>Uploaded Media Assets</h3>
            <button className="glass-button size-sm" onClick={() => alert('Drag and drop files dialog opened')}>+ Upload Asset</button>
          </div>
          
          <div className="assets-list">
            {assets.map((asset) => (
              <div key={asset.id} className="asset-row">
                <div className="asset-left">
                  <span className="asset-type-icon">
                    {asset.type === 'Video' ? '🎥' : asset.type === 'PDF Document' ? '📄' : '🖼️'}
                  </span>
                  <div>
                    <h4 className="asset-name">{asset.name}</h4>
                    <span className="asset-meta">{asset.type} • {asset.size} • By {asset.uploader}</span>
                  </div>
                </div>
                <div className="asset-right">
                  <span className={`cdn-badge ${asset.cdn.toLowerCase()}`}>{asset.cdn}</span>
                  <button className="glass-button size-sm secondary" onClick={() => alert(`Deleting asset ${asset.name}`)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Compression Transcoder */}
        <div className="media-col-right glass-panel transcoder-card">
          <h3>Transcoder & CDN Controls</h3>
          <p className="trans-desc">Tweak optimization codecs for video delivery.</p>

          <form className="transcoder-form">
            <div className="form-group">
              <label>Default Video Codec</label>
              <select className="glass-select">
                <option value="h264">H.264 / AVC (Most Compatible)</option>
                <option value="h265">H.265 / HEVC (High Efficiency)</option>
                <option value="vp9">VP9 (Web Optimized)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Available Resolutions</label>
              <div className="resolution-checkboxes">
                <label className="res-chk"><input type="checkbox" defaultChecked /> 1080p Full HD</label>
                <label className="res-chk"><input type="checkbox" defaultChecked /> 720p HD</label>
                <label className="res-chk"><input type="checkbox" defaultChecked /> 480p SD</label>
                <label className="res-chk"><input type="checkbox" /> 360p Mobile</label>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Cloudflare Cache Purge</label>
              <button type="button" className="glass-button secondary purge-btn" onClick={() => alert('CDN caches purged completely.')}>
                Purge Entire CDN Cache
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .media-management-view {
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

        .media-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .media-metrics {
            grid-template-columns: 1fr;
          }
        }

        .metric-card-media {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mme-lbl {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .mme-val {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mme-trend {
          font-size: 12px;
          color: var(--text-muted);
        }

        .progress-bar-container-media {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-fill-media {
          height: 100%;
          background: var(--accent-blue);
          border-radius: 4px;
        }

        .media-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .media-grid {
            grid-template-columns: 1fr;
          }
        }

        .asset-library-card, .transcoder-card {
          padding: 24px;
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .asset-library-card h3, .transcoder-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .assets-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .asset-row {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .asset-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .asset-type-icon {
          font-size: 24px;
        }

        .asset-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
          word-break: break-all;
        }

        .asset-meta {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .asset-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cdn-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .cdn-badge.cached {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }

        .cdn-badge.direct {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }

        .trans-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 18px;
        }

        .transcoder-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .resolution-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .res-chk {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .res-chk input {
          accent-color: var(--accent-blue);
          cursor: pointer;
        }

        .purge-btn {
          border-color: rgba(239, 68, 68, 0.2) !important;
          color: var(--error-color) !important;
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default MediaManagement;
