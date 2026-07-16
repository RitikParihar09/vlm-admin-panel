import React, { useState, useEffect } from 'react';

const PdfViewer = ({ pdfUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pdfUrl) {
      setIsLoading(true);
    }
  }, [pdfUrl]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      link.click();
    }
  };

  if (!pdfUrl) return null;

  return (
    <div className="pdf-viewer-overlay" onClick={onClose}>
      <div className="pdf-viewer-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <h3>PDF Viewer</h3>
          <div className="pdf-viewer-controls">
            <button onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))} className="glass-button secondary">
              -
            </button>
            <span style={{ margin: '0 10px', fontSize: '14px' }}>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(prev => Math.min(2, prev + 0.1))} className="glass-button secondary">
              +
            </button>
            <button onClick={handleDownload} className="glass-button secondary" style={{ marginLeft: '10px' }}>
              Download
            </button>
            <button onClick={onClose} className="glass-button secondary" style={{ marginLeft: '10px' }}>
              Close
            </button>
          </div>
        </div>
        
        <div className="pdf-viewer-content">
          {isLoading && (
            <div className="pdf-loading">
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
              <p>Loading PDF...</p>
            </div>
          )}
          <iframe
            src={pdfUrl}
            style={{ 
              width: '100%', 
              height: '80vh', 
              border: 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
            onLoad={() => setIsLoading(false)}
            title="PDF Viewer"
          />
        </div>
      </div>

      <style>{`
        .pdf-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .pdf-viewer-container {
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .pdf-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--panel-border);
          background: rgba(10, 15, 24, 0.5);
        }
        
        .pdf-viewer-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-primary);
        }
        
        .pdf-viewer-controls {
          display: flex;
          align-items: center;
        }
        
        .pdf-viewer-content {
          flex: 1;
          overflow: auto;
          position: relative;
        }
        
        .pdf-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: var(--text-secondary);
        }
        
        .glass-button.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--panel-border);
          color: var(--text-primary);
          box-shadow: none;
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .glass-button.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PdfViewer;