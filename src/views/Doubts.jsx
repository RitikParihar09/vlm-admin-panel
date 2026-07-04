import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const Doubts = () => {
  const { doubts, teachers, updateDoubt } = useAdmin();
  const [selectedDoubtId, setSelectedDoubtId] = useState(doubts[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('All');

  const selectedDoubt = doubts.find(d => d.id === selectedDoubtId);
  const filteredDoubts = doubts.filter(d => filter === 'All' || d.status === filter);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDoubtId) return;

    updateDoubt(selectedDoubtId, selectedDoubt.status, selectedDoubt.teacherId, replyText);
    setReplyText('');
  };

  const handleStatusChange = (status) => {
    updateDoubt(selectedDoubtId, status, selectedDoubt.teacherId);
  };

  const handleTeacherAssign = (teacherId) => {
    // If assigned to a teacher, change status to Assigned automatically if it was Open
    const newStatus = selectedDoubt.status === 'Open' ? 'Assigned' : selectedDoubt.status;
    updateDoubt(selectedDoubtId, newStatus, teacherId);
  };

  return (
    <div className="doubts-view">
      <div className="doubts-container glass-panel">
        
        {/* Left List Pane */}
        <div className="doubts-list-pane">
          <div className="list-pane-header">
            <h4>Doubt Queries</h4>
            <div className="filters-row">
              {['All', 'Open', 'Assigned', 'Resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn-filter-tab ${filter === f ? 'active' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="doubts-cards-list">
            {filteredDoubts.length > 0 ? (
              filteredDoubts.map(d => {
                const isSelected = selectedDoubtId === d.id;
                let statusClass = 'badge-student';
                if (d.status === 'Assigned') statusClass = 'badge-teacher';
                if (d.status === 'Resolved') statusClass = 'badge-success';

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDoubtId(d.id)}
                    className={`doubt-item-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="doubt-card-header">
                      <span className="student-lbl">👤 {d.studentName}</span>
                      <span className={`badge ${statusClass} scale-sm`}>{d.status}</span>
                    </div>
                    <p className="doubt-query-snippet">{d.question}</p>
                    <span className="doubt-card-id">ID: {d.id}</span>
                  </div>
                );
              })
            ) : (
              <div className="no-doubts-prompt">No doubts match this category</div>
            )}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        <div className="doubts-chat-pane">
          {selectedDoubt ? (
            <div className="chat-pane-inner">
              <div className="chat-pane-header">
                <div className="header-student-details">
                  <div className="student-avatar-big">S</div>
                  <div className="student-profile-text">
                    <h4>{selectedDoubt.studentName}</h4>
                    <span>Doubt ID: {selectedDoubt.id}</span>
                  </div>
                </div>

                <div className="header-controls">
                  <div className="form-group-inline">
                    <label>Status</label>
                    <select
                      value={selectedDoubt.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="glass-select dropdown-sm"
                    >
                      <option value="Open">Open</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="form-group-inline">
                    <label>Assign Teacher</label>
                    <select
                      value={selectedDoubt.teacherId || ''}
                      onChange={(e) => handleTeacherAssign(e.target.value)}
                      className="glass-select dropdown-sm"
                    >
                      <option value="">Select Educator...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="chat-thread-container">
                {/* Student original question */}
                <div className="chat-bubble student">
                  <div className="bubble-sender">{selectedDoubt.studentName} (Student)</div>
                  <div className="bubble-text">{selectedDoubt.question}</div>
                </div>

                {/* Staff replies */}
                {selectedDoubt.replies?.map((r, idx) => {
                  const isTeacher = r.sender.startsWith('T');
                  let senderLabel = 'Administrator';
                  if (isTeacher) {
                    const teacherObj = teachers.find(t => t.id === r.sender);
                    senderLabel = teacherObj ? `${teacherObj.name} (Teacher)` : 'Teacher';
                  }

                  return (
                    <div key={idx} className={`chat-bubble ${isTeacher ? 'teacher' : 'admin'}`}>
                      <div className="bubble-sender">{senderLabel}</div>
                      <div className="bubble-text">{r.text}</div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendReply} className="chat-input-bar">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official admin response..."
                  className="glass-input"
                  required
                />
                <button type="submit" className="glass-button reply-send-btn">
                  Send Response
                </button>
              </form>

            </div>
          ) : (
            <div className="no-doubt-selected-full">
              <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Select a doubt query from the left list to review and resolve.
            </div>
          )}
        </div>

      </div>

      <style>{`
        .doubts-container {
          display: grid;
          grid-template-columns: 1fr 1.8fr;
          height: calc(100vh - var(--navbar-height) - 70px);
          border-radius: 16px;
          border: 1px solid var(--panel-border);
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .doubts-container {
            grid-template-columns: 1fr;
          }
          .doubts-chat-pane {
            display: none; /* simple fallback */
          }
        }

        .doubts-list-pane {
          border-right: 1px solid var(--panel-border);
          display: flex;
          flex-direction: column;
          background: rgba(10, 15, 24, 0.2);
        }

        .list-pane-header {
          padding: 20px;
          border-bottom: 1px solid var(--panel-border);
        }

        .list-pane-header h4 {
          font-size: 15px;
          color: var(--text-primary);
          margin-bottom: 12px;
          font-weight: 600;
        }

        .filters-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .btn-filter-tab {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--panel-border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-filter-tab:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }

        .btn-filter-tab.active {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.3);
          color: var(--accent-blue);
        }

        .doubts-cards-list {
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .doubt-item-card {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .doubt-item-card:hover {
          background: rgba(255,255,255,0.02);
        }

        .doubt-item-card.selected {
          background: rgba(59, 130, 246, 0.05);
          border-left: 3px solid var(--accent-blue);
          padding-left: 17px;
        }

        .doubt-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .student-lbl {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .scale-sm {
          font-size: 9px;
          padding: 2px 6px;
        }

        .doubt-query-snippet {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doubt-card-id {
          font-size: 10px;
          color: var(--text-muted);
          font-family: monospace;
        }

        .no-doubts-prompt {
          padding: 30px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          font-style: italic;
        }

        /* Right Pane */
        .doubts-chat-pane {
          display: flex;
          flex-direction: column;
          background: rgba(10, 15, 24, 0.1);
        }

        .chat-pane-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .chat-pane-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--panel-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(18, 26, 38, 0.2);
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-student-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .student-avatar-big {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--student-color) 0%, #0891b2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 16px;
        }

        .student-profile-text h4 {
          font-size: 15px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .student-profile-text span {
          font-size: 11px;
          color: var(--text-muted);
          font-family: monospace;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .form-group-inline {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group-inline label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .dropdown-sm {
          padding: 6px 30px 6px 12px;
          font-size: 12px;
          border-radius: 6px;
          background-position: right 8px center;
        }

        .chat-thread-container {
          flex-grow: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chat-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          line-height: 1.4;
        }

        .chat-bubble.student {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--panel-border);
          border-bottom-left-radius: 2px;
        }

        .chat-bubble.teacher {
          align-self: flex-end;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-bottom-right-radius: 2px;
        }

        .chat-bubble.admin {
          align-self: flex-end;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-bottom-right-radius: 2px;
        }

        .bubble-sender {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .chat-bubble.student .bubble-sender { color: var(--student-color); }
        .chat-bubble.teacher .bubble-sender { color: var(--teacher-color); }
        .chat-bubble.admin .bubble-sender { color: var(--accent-blue); }

        .bubble-text {
          font-size: 13.5px;
          color: var(--text-primary);
        }

        .chat-input-bar {
          padding: 16px 24px;
          border-top: 1px solid var(--panel-border);
          display: flex;
          gap: 12px;
          background: rgba(18, 26, 38, 0.2);
        }

        .chat-input-bar input {
          flex-grow: 1;
        }

        .reply-send-btn {
          flex-shrink: 0;
        }

        .no-doubt-selected-full {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: 14px;
          padding: 40px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Doubts;
