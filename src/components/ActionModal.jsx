import React, { useEffect } from 'react';

const ActionModal = ({ isOpen, onClose, title, children, onSubmit, submitText = 'Save Changes' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          if (onSubmit) await onSubmit(e);
        }}>
          <div className="modal-body">
            {children}
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn primary">
              {submitText}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 7, 12, 0.6);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 580px;
          border-radius: 24px;
          border: 1px solid var(--panel-border);
          overflow: hidden;
          background: #ffffff;
          animation: modalFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--panel-border);
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-close-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          max-height: 75vh;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--panel-border);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }

        .modal-btn {
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .modal-btn.primary {
          background: linear-gradient(135deg, #6140EA 0%, #7c3aed 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(97, 64, 234, 0.25);
        }

        .modal-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(97, 64, 234, 0.35);
        }

        .modal-btn.secondary {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .modal-btn.secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ActionModal;
