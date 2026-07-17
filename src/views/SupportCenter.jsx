import React, { useState } from 'react';

const SupportCenter = () => {
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [tickets, setTickets] = useState([
    { id: 'TKT-1049', student: 'Rohan Gupta', subject: 'Math Video playback error', category: 'Technical', date: '10 min ago', status: 'Open', message: 'Hello, the class 12 Math video on Limits and Derivatives crashes at 12:40. I tried in other browsers too.' },
    { id: 'TKT-1048', student: 'Aditi Sharma', subject: 'MCQ Point allocation wrong', category: 'Academics', date: '1 hr ago', status: 'In Progress', message: 'My score shows 8/10 but the rewards wallet only credited 20 coins instead of 40.' },
    { id: 'TKT-1047', student: 'Rajesh Sen', subject: 'Subscription payment failed', category: 'Billing', date: 'Yesterday', status: 'Closed', message: 'I tried to purchase the Pro Plan, amount was debited but subscription is still basic.' }
  ]);

  const [chats, setChats] = useState({
    'TKT-1049': [
      { sender: 'student', name: 'Rohan Gupta', time: '10 min ago', text: 'Hello, the class 12 Math video on Limits and Derivatives crashes at 12:40. I tried in other browsers too.' }
    ],
    'TKT-1048': [
      { sender: 'student', name: 'Aditi Sharma', time: '1 hr ago', text: 'My score shows 8/10 but the rewards wallet only credited 20 coins instead of 40.' },
      { sender: 'admin', name: 'Support Rep', time: '40 min ago', text: 'Hi Aditi, I am checking the database log details for this quiz. Give me a moment.' }
    ]
  });

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const newReply = {
      sender: 'admin',
      name: 'Super Admin',
      time: 'Just now',
      text: replyText
    };

    setChats({
      ...chats,
      [activeTicket.id]: [...(chats[activeTicket.id] || []), newReply]
    });

    // Update ticket status to In Progress if it was Open
    setTickets(tickets.map(t => {
      if (t.id === activeTicket.id && t.status === 'Open') {
        return { ...t, status: 'In Progress' };
      }
      return t;
    }));

    setReplyText('');
  };

  const getActiveChats = () => {
    if (!activeTicket) return [];
    return chats[activeTicket.id] || [];
  };

  return (
    <div className="support-center-view">
      <div>
        <h2 className="view-title">Support Ticket Desk</h2>
        <p className="view-subtitle">Resolve support claims, manage student complaints, and update ticket states.</p>
      </div>

      <div className="support-grid">
        {/* Left: Tickets List */}
        <div className="support-col-left glass-panel tickets-list-card">
          <h3>Active Tickets</h3>
          <div className="tickets-list">
            {tickets.map((t) => (
              <div 
                key={t.id} 
                className={`ticket-row-desk ${activeTicket?.id === t.id ? 'active' : ''}`}
                onClick={() => setActiveTicket(t)}
              >
                <div className="ticket-header-desk">
                  <span className="t-id">{t.id}</span>
                  <span className={`t-status ${t.status.toLowerCase().replace(' ', '-')}`}>
                    {t.status}
                  </span>
                </div>
                <h4 className="t-subject">{t.subject}</h4>
                <div className="ticket-meta-desk">
                  <span>{t.student} • {t.category}</span>
                  <span className="t-date">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ticket Chat Workspace */}
        <div className="support-col-right glass-panel chat-workspace-card">
          {activeTicket ? (
            <div className="workspace-container">
              <div className="workspace-header">
                <div>
                  <h3>{activeTicket.subject}</h3>
                  <p className="ws-meta">Ticket ID: {activeTicket.id} • Student: {activeTicket.student}</p>
                </div>
                <div className="ws-actions">
                  <button className="glass-button size-sm secondary" onClick={() => {
                    setTickets(tickets.map(t => t.id === activeTicket.id ? { ...t, status: 'Closed' } : t));
                    setActiveTicket({ ...activeTicket, status: 'Closed' });
                  }}>
                    Close Ticket
                  </button>
                </div>
              </div>

              <div className="chat-messages-box">
                {getActiveChats().map((chat, idx) => (
                  <div key={idx} className={`chat-bubble-row ${chat.sender}`}>
                    <div className="chat-bubble">
                      <div className="bubble-header">
                        <span className="bubble-name">{chat.name}</span>
                        <span className="bubble-time">{chat.time}</span>
                      </div>
                      <p className="bubble-text">{chat.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'Closed' ? (
                <form onSubmit={handleSendReply} className="chat-reply-form">
                  <input 
                    type="text" 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                    placeholder="Type your response to the student..." 
                    className="glass-input chat-input-desk"
                    required
                  />
                  <button type="submit" className="glass-button send-reply-btn">Reply</button>
                </form>
              ) : (
                <div className="closed-ticket-notice">
                  This ticket has been marked as Closed.
                </div>
              )}
            </div>
          ) : (
            <div className="no-ticket-selected">
              <span className="no-t-icon">📨</span>
              <p>Select a ticket from the left panel to open the communication workspace.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .support-center-view {
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

        .support-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 25px;
        }

        @media (max-width: 1024px) {
          .support-grid {
            grid-template-columns: 1fr;
          }
        }

        .tickets-list-card, .chat-workspace-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          min-height: 520px;
        }

        .tickets-list-card h3, .chat-workspace-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 18px;
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex-grow: 1;
        }

        .ticket-row-desk {
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ticket-row-desk:hover {
          border-color: var(--panel-border-hover);
          transform: translateY(-1px);
        }

        .ticket-row-desk.active {
          border-color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.04);
        }

        .ticket-header-desk {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .t-id {
          font-family: monospace;
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 12px;
        }

        .t-status {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .t-status.open {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-color);
        }

        .t-status.in-progress {
          background: rgba(245, 158, 11, 0.1);
          color: var(--teacher-color);
        }

        .t-status.closed {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }

        .t-subject {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .ticket-meta-desk {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
        }

        .workspace-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-grow: 1;
        }

        .workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--panel-border);
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .ws-meta {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 4px 0 0 0;
        }

        .chat-messages-box {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 6px;
          overflow-y: auto;
          margin-bottom: 18px;
          max-height: 320px;
        }

        .chat-bubble-row {
          display: flex;
        }

        .chat-bubble-row.student {
          justify-content: flex-start;
        }

        .chat-bubble-row.admin {
          justify-content: flex-end;
        }

        .chat-bubble {
          max-width: 80%;
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          padding: 12px 16px;
          border-radius: 12px;
        }

        .chat-bubble-row.admin .chat-bubble {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .bubble-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 6px;
          font-size: 11px;
        }

        .bubble-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .bubble-time {
          color: var(--text-muted);
        }

        .bubble-text {
          font-size: 13px;
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .chat-reply-form {
          display: flex;
          gap: 12px;
        }

        .chat-input-desk {
          flex-grow: 1;
        }

        .closed-ticket-notice {
          text-align: center;
          background: var(--bg-secondary);
          border: 1px solid var(--panel-border);
          padding: 14px;
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 550;
        }

        .no-ticket-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          text-align: center;
          color: var(--text-muted);
          gap: 12px;
        }

        .no-t-icon {
          font-size: 40px;
        }

        .no-ticket-selected p {
          font-size: 13px;
          max-width: 280px;
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default SupportCenter;
