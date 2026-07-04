import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataList from '../components/DataList';
import ActionModal from '../components/ActionModal';

const LiveClasses = () => {
  const { liveClasses, teachers, addLiveClass, updateLiveClass, deleteLiveClass } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  // Form State
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [teacherId, setTeacherId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('Scheduled');

  // Prefill dropdowns
  const handleOpenAddModal = () => {
    setEditingClass(null);
    setTopic('');
    setSubject('Mathematics');
    setTeacherId(teachers[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('10:00');
    setEndTime('11:00');
    setLink('https://meet.google.com/abc-defg-hij');
    setStatus('Scheduled');
    setModalOpen(true);
  };

  const handleOpenEditModal = (lc) => {
    setEditingClass(lc);
    setTopic(lc.topic);
    setSubject(lc.subject);
    setTeacherId(lc.teacherId);
    setDate(lc.date);
    setStartTime(lc.startTime);
    setEndTime(lc.endTime);
    setLink(lc.link);
    setStatus(lc.status);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const classData = {
      topic,
      subject,
      teacherId,
      date,
      startTime,
      endTime,
      link,
      status
    };

    if (editingClass) {
      updateLiveClass(editingClass.id, classData);
    } else {
      addLiveClass(classData);
    }
    setModalOpen(false);
  };

  const handleQuickStatus = (id, newStatus) => {
    updateLiveClass(id, { status: newStatus });
  };

  const columns = [
    { header: 'Topic & Subject', key: 'topic', render: (row) => (
      <div className="class-topic-info">
        <span className="topic-text">{row.topic}</span>
        <span className="badge badge-student" style={{ width: 'fit-content', fontSize: '10px', padding: '2px 6px', marginTop: '4px' }}>
          {row.subject}
        </span>
      </div>
    )},
    { header: 'Assigned Teacher', key: 'teacherId', render: (row) => {
      const teacher = teachers.find(t => t.id === row.teacherId);
      return <span className="teacher-name">{teacher ? teacher.name : 'Unknown Teacher'}</span>;
    }},
    { header: 'Date & Time', key: 'date', render: (row) => (
      <div className="time-details">
        <span className="date-text">📅 {row.date}</span>
        <span className="time-text">🕒 {row.startTime} - {row.endTime}</span>
      </div>
    )},
    { header: 'Streaming URL', key: 'link', render: (row) => (
      <a href={row.link} target="_blank" rel="noopener noreferrer" className="link-anchor">
        Launch Class Link
        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    )},
    { header: 'Status', key: 'status', render: (row) => {
      let badgeClass = 'badge-student';
      if (row.status === 'Live') badgeClass = 'badge-success';
      if (row.status === 'Completed') badgeClass = 'badge-parent';

      return (
        <div className="status-cell">
          <span className={`badge ${badgeClass}`}>{row.status}</span>
          <div className="quick-status-actions">
            {row.status === 'Scheduled' && (
              <button className="status-btn live" onClick={() => handleQuickStatus(row.id, 'Live')}>Go Live</button>
            )}
            {row.status === 'Live' && (
              <button className="status-btn complete" onClick={() => handleQuickStatus(row.id, 'Completed')}>End</button>
            )}
          </div>
        </div>
      );
    }},
    { header: 'Actions', key: 'actions', width: '120px', render: (row) => (
      <div className="table-actions">
        <button className="action-icon-btn edit" onClick={() => handleOpenEditModal(row)} title="Edit class details">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button className="action-icon-btn delete" onClick={() => deleteLiveClass(row.id)} title="Cancel class">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    )}
  ];

  return (
    <div className="liveclasses-view">
      <DataList
        data={liveClasses}
        columns={columns}
        searchPlaceholder="Search classes by topic..."
        searchKey="topic"
        actionButton={
          <button className="glass-button class-add-btn" onClick={handleOpenAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Schedule Live Class
          </button>
        }
      />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClass ? 'Edit Scheduled Live Class' : 'Schedule New Live Class'}
        onSubmit={handleSubmit}
        submitText={editingClass ? 'Save Schedule' : 'Schedule Lecture'}
      >
        <div className="form-group">
          <label>Lecture Topic / Title</label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Introduction to Trigonometry"
            className="glass-input"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="glass-select"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assign Teacher</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="glass-select"
              required
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Lecture Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Class Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="glass-select"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Zoom/Meeting Streaming URL</label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://zoom.us/j/123456"
              className="glass-input"
            />
          </div>
        </div>
      </ActionModal>

      <style>{`
        .class-add-btn {
          background: linear-gradient(135deg, var(--accent-purple) 0%, rgba(139, 92, 246, 0.7) 100%);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        .class-add-btn:hover {
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        .class-topic-info {
          display: flex;
          flex-direction: column;
        }

        .topic-text {
          font-weight: 600;
          color: var(--text-primary);
        }

        .time-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
        }

        .date-text {
          color: var(--text-primary);
        }

        .time-text {
          color: var(--text-muted);
        }

        .link-anchor {
          display: inline-flex;
          align-items: center;
          color: var(--student-color);
          text-decoration: none;
          font-weight: 550;
          font-size: 13px;
          transition: color 0.2s ease;
        }

        .link-anchor:hover {
          color: #22d3ee;
          text-decoration: underline;
        }

        .status-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .quick-status-actions {
          display: flex;
          gap: 4px;
        }

        .status-btn {
          padding: 2px 6px;
          font-size: 10px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .status-btn.live {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success-color);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-btn.live:hover {
          background: var(--success-color);
          color: white;
        }

        .status-btn.complete {
          background: rgba(236, 72, 153, 0.15);
          color: var(--parent-color);
          border: 1px solid rgba(236, 72, 153, 0.3);
        }

        .status-btn.complete:hover {
          background: var(--parent-color);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default LiveClasses;
