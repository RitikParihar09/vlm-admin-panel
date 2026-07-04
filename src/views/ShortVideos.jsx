import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataList from '../components/DataList';
import ActionModal from '../components/ActionModal';

const ShortVideos = () => {
  const { shortVideos, addShortVideo, deleteShortVideo } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1:00');
  const [link, setLink] = useState('');

  const openAddModal = () => {
    setTitle('');
    setDuration('1:00');
    setLink('https://example.com/short.mp4');
    setModalOpen(true);
  };

  const handleSubmit = () => {
    addShortVideo({ title, duration, link });
    setModalOpen(false);
  };

  const columns = [
    { header: 'ID', key: 'id', width: '60px' },
    { header: 'Video Title', key: 'title', render: (row) => (
      <div className="material-title-info">
        <span className="material-title-text">🎥 {row.title}</span>
        {row.link && <span className="material-grade-sub">{row.link}</span>}
      </div>
    )},
    { header: 'Duration', key: 'duration', render: (row) => (
      <span className="duration-tag">⏱️ {row.duration}</span>
    )},
    { header: 'Total Views', key: 'views', render: (row) => (
      <span className="views-count">📈 {row.views || '0'} Views</span>
    )},
    { header: 'Actions', key: 'actions', width: '80px', render: (row) => (
      <button className="action-icon-btn delete" onClick={() => deleteShortVideo(row.id)} title="Delete short video">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    )}
  ];

  return (
    <div className="shortvideos-view">
      <DataList
        data={shortVideos}
        columns={columns}
        searchPlaceholder="Search shorts by title..."
        searchKey="title"
        actionButton={
          <button className="glass-button short-add-btn" onClick={openAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Short Video
          </button>
        }
      />

      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Short Video Feed"
        onSubmit={handleSubmit}
        submitText="Publish Clip"
      >
        <div className="form-group">
          <label>Video Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introduction to Calculus in 60 seconds"
            className="glass-input"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Duration (MM:SS)</label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0:59"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>Source Video Link (MP4/HLS)</label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/videos/calc-short.mp4"
              className="glass-input"
            />
          </div>
        </div>
      </ActionModal>

      <style>{`
        .short-add-btn {
          background: linear-gradient(135deg, var(--parent-color) 0%, rgba(236, 72, 153, 0.7) 100%);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        .short-add-btn:hover {
          box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
        }

        .duration-tag {
          font-weight: 550;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .views-count {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default ShortVideos;
