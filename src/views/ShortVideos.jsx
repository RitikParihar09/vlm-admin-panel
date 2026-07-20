import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  FaCheck, 
  FaTimes, 
  FaTrash, 
  FaPlay, 
  FaSearch, 
  FaEye, 
  FaHeart, 
  FaComment,
  FaShareAlt,
  FaUsers,
  FaVideo,
  FaFilter,
  FaUndo,
  FaGlobe,
  FaEyeSlash,
  FaEllipsisV,
  FaChevronDown,
  FaChevronUp,
  FaCloudDownloadAlt,
  FaPlusCircle,
  FaMinusCircle,
  FaFileExport,
  FaPlus,
  FaEdit
} from 'react-icons/fa';

const ShortVideos = () => {
  const { getShortVideos, approveShortVideo, rejectShortVideo, deleteShortVideo } = useAdmin();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterBoard, setFilterBoard] = useState('All');
  const [filterUploader, setFilterUploader] = useState('All');
  const [sortOrder, setSortOrder] = useState('latest');

  // Tab State
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [previewVideo, setPreviewVideo] = useState(null);
  const [rejectingVideo, setRejectingVideo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Custom confirm modal state
  const [confirmModal, setConfirmModal] = useState(null);
  // confirmModal shape: { title, message, type: 'approve'|'delete', onConfirm, requireTyped?: true }
  const [confirmTypedValue, setConfirmTypedValue] = useState('');

  const loadVideos = async () => {
    if (!getShortVideos) return;
    setLoading(true);
    const data = await getShortVideos();
    if (Array.isArray(data)) {
      setReels(data);
    } else {
      setReels([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVideos();
  }, [getShortVideos]);

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this video?')) {
      const ok = await approveShortVideo(id);
      if (ok) loadVideos();
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return alert('Please enter a rejection reason');
    const ok = await rejectShortVideo(rejectingVideo._id, rejectionReason);
    if (ok) {
      setRejectingVideo(null);
      setRejectionReason('');
      loadVideos();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video permanently?')) {
      const ok = await deleteShortVideo(id);
      if (ok) loadVideos();
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterSubject('All');
    setFilterClass('All');
    setFilterBoard('All');
    setFilterUploader('All');
    setSortOrder('latest');
  };

  // ── Bulk selection state (handlers are defined after filteredReels below)
  const [selectedIds, setSelectedIds] = useState([]);


  // Metrics computation
  const totalUploaded = reels.length;
  const totalPending = reels.filter(r => r.status === 'pending').length;
  const totalApproved = reels.filter(r => r.status === 'approved').length;
  const totalRejected = reels.filter(r => r.status === 'rejected').length;
  const totalViews = reels.reduce((acc, r) => acc + (r.views || 0), 0);
  const totalLikes = reels.reduce((acc, r) => acc + (r.likes || 0), 0);

  // Dynamic dropdown lists for filters
  const subjectsList = ['All', ...new Set(reels.map(r => r.subject).filter(Boolean))];
  const classesList = ['All', ...new Set(reels.map(r => r.class).filter(Boolean))];
  const boardsList = ['All', ...new Set(reels.map(r => r.uploader?.board).filter(Boolean))];
  const uploadersList = ['All', ...new Set(reels.map(r => r.uploader?.name).filter(Boolean))];

  // Filtering & Sorting Logic
  const filteredReels = reels.filter(r => {
    // Tab filter
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'approved' && r.status !== 'approved') return false;
    if (activeTab === 'rejected' && r.status !== 'rejected') return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = r.title && r.title.toLowerCase().includes(query);
      const matchSubject = r.subject && r.subject.toLowerCase().includes(query);
      const matchUploader = r.uploader?.name && r.uploader.name.toLowerCase().includes(query);
      if (!matchTitle && !matchSubject && !matchUploader) return false;
    }

    // Status Dropdown
    if (filterStatus !== 'All' && r.status !== filterStatus.toLowerCase()) return false;

    // Subject Dropdown
    if (filterSubject !== 'All' && r.subject !== filterSubject) return false;

    // Class Dropdown
    if (filterClass !== 'All' && r.class !== filterClass) return false;

    // Board Dropdown
    if (filterBoard !== 'All' && r.uploader?.board !== filterBoard) return false;

    // Uploader Dropdown
    if (filterUploader !== 'All' && r.uploader?.name !== filterUploader) return false;

    return true;
  }).sort((a, b) => {
    if (sortOrder === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === 'views') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  // ── Bulk selection derived flags & handlers (after filteredReels to avoid TDZ)
  const isAllSelected = filteredReels.length > 0 && selectedIds.length === filteredReels.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredReels.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReels.map(r => r._id));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      title: `Approve ${selectedIds.length} Video${selectedIds.length > 1 ? 's' : ''}?`,
      message: `This will publish ${selectedIds.length} video${selectedIds.length > 1 ? 's' : ''} and make ${selectedIds.length > 1 ? 'them' : 'it'} visible to students.`,
      type: 'approve',
      onConfirm: async () => {
        await Promise.all(selectedIds.map(id => approveShortVideo(id)));
        setSelectedIds([]);
        loadVideos();
      }
    });
    setConfirmTypedValue('');
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    const reason = window.prompt(`Enter rejection reason for ${selectedIds.length} video(s):`);
    if (!reason?.trim()) return;
    await Promise.all(selectedIds.map(id => rejectShortVideo(id, reason)));
    setSelectedIds([]);
    loadVideos();
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmTypedValue('');
    setConfirmModal({
      title: `Delete ${selectedIds.length} Video${selectedIds.length > 1 ? 's' : ''}?`,
      message: `This will permanently delete ${selectedIds.length} video${selectedIds.length > 1 ? 's' : ''} and all associated data. This action cannot be undone.`,
      type: 'delete',
      requireTyped: true,
      onConfirm: async () => {
        await Promise.all(selectedIds.map(id => deleteShortVideo(id)));
        setSelectedIds([]);
        loadVideos();
      }
    });
  };

  const formatUploadedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} ${ampm}`
    };
  };

  return (
    <div className="shorts-management-custom-view">
      
      {/* Header Title and Action Row */}
      <div className="shorts-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="shorts-main-title" style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Shorts Management</h2>
          <p className="shorts-main-sub" style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Manage, review and control short videos across the platform</p>
        </div>
        <button className="upload-short-header-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', fontWeight: '700', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
          <FaPlus /> Upload Short
        </button>
      </div>

      {/* Metrics Row */}
      <div className="custom-metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="card-top">
            <span className="card-title">Total Shorts</span>
            <div className="icon-wrapper purple"><FaVideo /></div>
          </div>
          <span className="card-value">{totalUploaded}</span>
          <span className="card-subtext">All time uploads</span>
        </div>

        <div className="metric-card warning" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="card-top">
            <span className="card-title">Pending Approval</span>
            <div className="icon-wrapper orange"><FaEye /></div>
          </div>
          <span className="card-value">{totalPending}</span>
          <span className="card-subtext">Awaiting review</span>
        </div>

        <div className="metric-card green-border" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="card-top">
            <span className="card-title">Approved</span>
            <div className="icon-wrapper green"><FaCheck /></div>
          </div>
          <span className="card-value">{totalApproved}</span>
          <span className="card-subtext">Published shorts</span>
        </div>

        <div className="metric-card blue-border" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="card-top">
            <span className="card-title">Rejected</span>
            <div className="icon-wrapper blue"><FaTimes /></div>
          </div>
          <span className="card-value">{totalRejected}</span>
          <span className="card-subtext">Rejected shorts</span>
        </div>

        <div className="metric-card red-border" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-top">
            <span className="card-title">Total Views</span>
            <div className="icon-wrapper red"><FaEye /></div>
          </div>
          <span className="card-value">{totalViews.toLocaleString()}</span>
          <span className="card-subtext">All time views</span>
        </div>

        <div className="metric-card teal-border" style={{ borderLeft: '4px solid #0d9488' }}>
          <div className="card-top">
            <span className="card-title">Total Likes</span>
            <div className="icon-wrapper teal"><FaHeart /></div>
          </div>
          <span className="card-value">{totalLikes.toLocaleString()}</span>
          <span className="card-subtext">All time likes</span>
        </div>
      </div>

      {/* Professional Filter Card System */}
      <div className="custom-filters-panel">
        
        {/* Row 1 */}
        <div className="filters-row">
          <div className="filter-group text-search">
            <label>Search</label>
            <div className="search-input-wrap">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search shorts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Subject</label>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="All">All Subjects</option>
              {subjectsList.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Class</label>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="All">All Classes</option>
              {classesList.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Board</label>
            <select value={filterBoard} onChange={(e) => setFilterBoard(e.target.value)}>
              <option value="All">All Boards</option>
              {boardsList.filter(b => b !== 'All').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Uploader</label>
            <select value={filterUploader} onChange={(e) => setFilterUploader(e.target.value)}>
              <option value="All">All Uploaders</option>
              {uploadersList.filter(u => u !== 'All').map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="filters-row flex-end" style={{ marginTop: '16px' }}>
          <div className="filter-group max-200">
            <label>Sort By</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          <div className="filter-actions-row">
            <button className="reset-filter-btn" onClick={handleResetFilters}>
              <FaUndo style={{ marginRight: '6px' }} /> Reset
            </button>
            <button className="apply-filter-btn" onClick={loadVideos} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaFilter /> Apply Filters
            </button>
          </div>
        </div>

      </div>

      {/* Segmented Tab Row */}
      <div className="shorts-tab-navigation-bar">
        <button 
          className={`nav-tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Shorts ({totalUploaded})
        </button>
        <button 
          className={`nav-tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({totalPending})
        </button>
        <button 
          className={`nav-tab-item ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({totalApproved})
        </button>
        <button 
          className={`nav-tab-item ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected ({totalRejected})
        </button>
      </div>

      {/* Bulk actions bar */}
      <div className="shorts-bulk-actions-strip">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="checkbox"
            className="custom-chk"
            checked={isAllSelected}
            ref={el => { if (el) el.indeterminate = isIndeterminate; }}
            onChange={handleSelectAll}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginRight: '8px' }}>Select All</span>

          {/* Context-aware buttons based on active tab */}
          {selectedIds.length > 0 && (
            <>
              {/* Approve — shown on pending or all tabs */}
              {(activeTab === 'pending' || activeTab === 'all') && (
                <button
                  className="bulk-action-pill green"
                  onClick={handleBulkApprove}
                >
                  <FaCheck /> Approve ({selectedIds.length})
                </button>
              )}

              {/* Reject — shown on pending or all tabs */}
              {(activeTab === 'pending' || activeTab === 'all') && (
                <button
                  className="bulk-action-pill orange"
                  onClick={handleBulkReject}
                >
                  <FaTimes /> Reject ({selectedIds.length})
                </button>
              )}

              {/* Delete — always shown */}
              <button
                className="bulk-action-pill red"
                onClick={handleBulkDelete}
              >
                <FaTrash /> Delete ({selectedIds.length})
              </button>

              <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: '4px', borderLeft: '1px solid #e2e8f0', marginLeft: '4px' }}>
                {selectedIds.length} selected
              </span>
            </>
          )}

          {selectedIds.length === 0 && (
            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Select videos to perform bulk actions</span>
          )}
        </div>
      </div>

      {/* Table Listing */}
      <div className="glass-panel table-panel-custom-shorts">
        <table className="custom-shorts-library-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" className="custom-chk" readOnly /></th>
              <th style={{ width: '260px' }}>Short Details</th>
              <th style={{ width: '120px' }}>Uploader</th>
              <th style={{ width: '100px' }}>Uploader Type</th>
              <th style={{ width: '150px' }}>Stats</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '80px' }}>Visibility</th>
              <th style={{ width: '110px' }}>Uploaded On</th>
              <th className="sticky-actions-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  Loading video records...
                </td>
              </tr>
            ) : filteredReels.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  No short videos match these filter settings.
                </td>
              </tr>
            ) : (
              filteredReels.map((reel) => {
                const uploader = reel.uploader || {};
                const { date, time } = formatUploadedDate(reel.createdAt);

                return (
                  <tr key={reel._id} style={{ background: selectedIds.includes(reel._id) ? 'rgba(79,70,229,0.04)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        className="custom-chk"
                        checked={selectedIds.includes(reel._id)}
                        onChange={() => handleToggleRow(reel._id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    
                    {/* Short Details Column */}
                    <td>
                      <div className="shorts-details-wrapper">
                        <div className="shorts-thumb-holder" onClick={() => setPreviewVideo(reel)}>
                          {reel.thumbnailUrl ? (
                            <img src={reel.thumbnailUrl} alt={reel.title} />
                          ) : reel.videoUrl ? (
                            <video 
                              src={reel.videoUrl} 
                              muted 
                              preload="metadata" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160" alt={reel.title} />
                          )}
                          <span className="duration-tag-overlay">
                            {reel.duration ? `${Math.floor(reel.duration / 60)}:${(reel.duration % 60).toString().padStart(2, '0')}` : '0:45'}
                          </span>
                        </div>
                        <div className="shorts-text-meta">
                          <span className="shorts-title-bold">{reel.title}</span>
                          {reel.description && <span className="shorts-desc-gray">{reel.description}</span>}
                          <div className="shorts-tag-row">
                            <span className="tag-pill-custom blue">{reel.subject || 'General'}</span>
                            <span className="tag-pill-custom grey">Class {reel.class || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Uploader Column */}
                    <td>
                      <div className="uploader-meta-col" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="uploader-name-span" style={{ fontSize: '13px', fontWeight: '750', color: '#1e293b' }}>
                          {uploader.name || 'Unknown'}
                        </span>
                        <span className="uploader-username-span" style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
                          {uploader.username ? `@${uploader.username}` : '@username'}
                        </span>
                      </div>
                    </td>

                    {/* Uploader Type Column */}
                    <td>
                      <span className={`uploader-role-badge-c ${uploader.role || 'student'}`} style={{ textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '850', background: uploader.role === 'teacher' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(139, 92, 246, 0.08)', color: uploader.role === 'teacher' ? '#3b82f6' : '#8b5cf6' }}>
                        {uploader.role || 'student'}
                      </span>
                    </td>

                    {/* Stats Column */}
                    <td>
                      {reel.status === 'approved' ? (
                        <div className="stats-grid-cell">
                          <div className="stat-label-row"><FaEye /> {(reel.views || 0).toLocaleString()}</div>
                          <div className="stat-label-row"><FaHeart /> {(reel.likes || 0).toLocaleString()}</div>
                          <div className="stat-label-row"><FaComment /> {reel.comments?.length || 0}</div>
                          <div className="stat-label-row"><FaShareAlt /> {reel.shares || 0}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: '600', paddingLeft: '8px' }}>—</span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td>
                      <div className={`status-custom-badge ${reel.status || 'pending'}`}>
                        <span className="status-dot"></span>
                        {reel.status || 'pending'}
                      </div>
                    </td>

                    {/* Visibility Column */}
                    <td>
                      <div className="visibility-cell-row">
                        {reel.status === 'approved' ? (
                          <>
                            <FaGlobe className="icon public" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="icon private" />
                            <span>Private</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Uploaded On Column */}
                    <td>
                      <div className="uploaded-date-col">
                        <span className="date-main">{date}</span>
                        <span className="time-sub">{time}</span>
                      </div>
                    </td>

                    {/* Actions Column - sticky right */}
                    <td className="sticky-actions-td">
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', width: '100px', alignItems: 'stretch' }}>
                        {reel.status === 'pending' ? (
                          <>
                            <button 
                              className="text-action-btn approve" 
                              onClick={() => handleApprove(reel._id)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.06)', color: '#10b981', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            >
                              <FaCheck style={{ fontSize: '9px' }} /> Approve
                            </button>
                            <button 
                              className="text-action-btn reject" 
                              onClick={() => setRejectingVideo(reel)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.06)', color: '#f59e0b', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            >
                              <FaTimes style={{ fontSize: '9px' }} /> Reject
                            </button>
                            <button 
                              className="text-action-btn preview" 
                              onClick={() => setPreviewVideo(reel)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.06)', color: '#3b82f6', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            >
                              <FaPlay style={{ fontSize: '9px' }} /> Preview
                            </button>
                            <button 
                              className="text-action-btn delete" 
                              onClick={() => handleDelete(reel._id)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.06)', color: '#ef4444', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            >
                              <FaTrash style={{ fontSize: '9px' }} /> Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="text-action-btn preview" 
                              onClick={() => setPreviewVideo(reel)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.06)', color: '#3b82f6', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            >
                              <FaPlay style={{ fontSize: '9px' }} /> Preview
                            </button>
                            <button 
                              className="text-action-btn delete" 
                              onClick={() => handleDelete(reel._id)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.06)', color: '#ef4444', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            >
                              <FaTrash style={{ fontSize: '9px' }} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="premium-modal-overlay" onClick={() => setPreviewVideo(null)}>
          <div className="video-simple-preview-container animate-zoom-in" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #cbd5e1' }}>
            <div className="preview-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{previewVideo.title}</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Uploaded by @{previewVideo.uploader?.name || 'Unknown'}</span>
              </div>
              <button onClick={() => setPreviewVideo(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', padding: '4px' }}><FaTimes /></button>
            </div>
            
            <div className="preview-modal-body" style={{ padding: '0', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '16/9' }}>
              <video 
                src={previewVideo.videoUrl} 
                controls 
                autoPlay 
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>

            <div className="preview-modal-footer" style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>{previewVideo.description || 'No description provided.'}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: previewVideo.status === 'pending' ? '14px' : '0' }}>
                <span style={{ fontSize: '9px', fontWeight: '800', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>Class {previewVideo.class}</span>
                <span style={{ fontSize: '9px', fontWeight: '800', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{previewVideo.subject}</span>
              </div>

              {/* Approve / Reject actions inside preview — only for pending videos */}
              {previewVideo.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      handleApprove(previewVideo._id);
                      setPreviewVideo(null);
                    }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                      border: 'none', borderRadius: '10px', padding: '10px 16px',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    ✓ Approve Video
                  </button>
                  <button
                    onClick={() => {
                      setPreviewVideo(null);
                      setRejectingVideo(previewVideo);
                    }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff',
                      border: 'none', borderRadius: '10px', padding: '10px 16px',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(249,115,22,0.3)', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    ✕ Reject Video
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVideo && (
        <div className="premium-modal-overlay" onClick={() => setRejectingVideo(null)}>
          <div className="premium-modal-content animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <h3>Reject Video Submission</h3>
              <button className="close-panel-btn" onClick={() => setRejectingVideo(null)}><FaTimes /></button>
            </div>
            <div className="side-panel-body">
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
                Provide feedback for <strong>"{rejectingVideo.title}"</strong>. The student or teacher will see this reason inside their dashboard.
              </p>
              <div className="form-group-side">
                <label>Rejection Reason</label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Low video clarity, incorrect explanation, or bad audio..."
                  className="side-input"
                  rows={4}
                  style={{ resize: 'none', padding: '12px' }}
                />
              </div>
            </div>
            <div className="side-panel-footer" style={{ marginTop: '20px' }}>
              <button className="cancel-side-panel-btn" onClick={() => setRejectingVideo(null)}>Cancel</button>
              <button className="save-side-panel-btn" onClick={handleRejectSubmit} style={{ background: '#ef4444' }}>Reject Submission</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Confirm Modal */}
      {confirmModal && (
        <div className="premium-modal-overlay" onClick={() => setConfirmModal(null)}>
          <div
            className="animate-zoom-in"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '440px',
              maxWidth: '92%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              border: `2px solid ${confirmModal.type === 'delete' ? '#fee2e2' : '#d1fae5'}`
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px 16px',
              background: confirmModal.type === 'delete' ? 'linear-gradient(135deg, #fef2f2, #fff)' : 'linear-gradient(135deg, #f0fdf4, #fff)',
              borderBottom: `1px solid ${confirmModal.type === 'delete' ? '#fee2e2' : '#d1fae5'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  background: confirmModal.type === 'delete' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  color: confirmModal.type === 'delete' ? '#ef4444' : '#10b981'
                }}>
                  {confirmModal.type === 'delete' ? <FaTrash /> : <FaCheck />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{confirmModal.title}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {confirmModal.type === 'delete' ? '⚠ This action is irreversible' : 'Confirm bulk approval'}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmModal(null)}
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                {confirmModal.message}
              </p>

              {confirmModal.requireTyped && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmTypedValue}
                    onChange={e => setConfirmTypedValue(e.target.value)}
                    placeholder="Type DELETE here..."
                    autoFocus
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px', border: '2px solid',
                      borderColor: confirmTypedValue === 'DELETE' ? '#ef4444' : '#e2e8f0',
                      fontSize: '13px', fontWeight: '700', outline: 'none', letterSpacing: '2px',
                      color: '#1e293b', boxSizing: 'border-box', transition: 'border-color 0.15s'
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && confirmTypedValue === 'DELETE') {
                        confirmModal.onConfirm();
                        setConfirmModal(null);
                      }
                    }}
                  />
                  {confirmTypedValue.length > 0 && confirmTypedValue !== 'DELETE' && (
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#ef4444' }}>
                      Must type exactly: DELETE
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                disabled={confirmModal.requireTyped && confirmTypedValue !== 'DELETE'}
                style={{
                  padding: '10px 22px', borderRadius: '10px', border: 'none',
                  background: confirmModal.type === 'delete'
                    ? (confirmModal.requireTyped && confirmTypedValue !== 'DELETE' ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)')
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontSize: '13px', fontWeight: '800', cursor: confirmModal.requireTyped && confirmTypedValue !== 'DELETE' ? 'not-allowed' : 'pointer',
                  boxShadow: confirmModal.requireTyped && confirmTypedValue !== 'DELETE' ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                {confirmModal.type === 'delete' ? '🗑 Confirm Delete' : '✓ Approve All'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .shorts-management-custom-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 8px 0;
          font-family: inherit;
        }

        /* Metrics Row */
        .custom-metrics-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }

        .metric-card {
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-title {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .icon-wrapper.purple { background: rgba(139, 92, 246, 0.08); color: #8b5cf6; }
        .icon-wrapper.orange { background: rgba(245, 158, 11, 0.08); color: #f59e0b; }
        .icon-wrapper.green { background: rgba(16, 185, 129, 0.08); color: #10b981; }
        .icon-wrapper.blue { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .icon-wrapper.red { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
        .icon-wrapper.teal { background: rgba(13, 148, 136, 0.08); color: #0d9488; }

        .card-value {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .card-subtext {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 550;
        }

        /* Filter Panel */
        .custom-filters-panel {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }

        .filters-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filters-row.flex-end {
          justify-content: space-between;
          align-items: flex-end;
        }

        .filter-group {
          flex: 1;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group.text-search {
          flex: 2;
          min-width: 220px;
        }

        .filter-group.max-200 {
          max-width: 220px;
        }

        .filter-group label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-input-wrap {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 12px;
        }

        .search-input-wrap input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 13px;
          outline: none;
          color: #334155;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .search-input-wrap input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .filter-group select {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 13px;
          background: #fff;
          outline: none;
          color: #334155;
          font-weight: 550;
          cursor: pointer;
        }

        .filter-group select:focus {
          border-color: #4f46e5;
        }

        .filter-actions-row {
          display: flex;
          gap: 12px;
        }

        .reset-filter-btn {
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 22px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
        }

        .reset-filter-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .apply-filter-btn {
          border: none;
          background: #4f46e5;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 26px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15);
        }

        .apply-filter-btn:hover {
          background: #4338ca;
        }

        /* Tabs Nav */
        .shorts-tab-navigation-bar {
          display: flex;
          border-bottom: 2px solid #e2e8f0;
          gap: 32px;
          margin-top: 10px;
        }

        .nav-tab-item {
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 750;
          color: #64748b;
          padding: 12px 6px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
        }

        .nav-tab-item:hover {
          color: #334155;
        }

        .nav-tab-item.active {
          color: #4f46e5;
        }

        .nav-tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #4f46e5;
        }

        /* Bulk actions */
        .shorts-bulk-actions-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 8px 0;
        }

        .custom-chk {
          width: 16px;
          height: 16px;
          accent-color: #4f46e5;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
        }

        .bulk-btn {
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .bulk-action-pill {
          border: none;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .bulk-action-pill.green { background: rgba(16, 185, 129, 0.08); color: #10b981; }
        .bulk-action-pill.orange { background: rgba(245, 158, 11, 0.08); color: #f59e0b; }
        .bulk-action-pill.red { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
        .bulk-action-pill.border { border: 1px solid #cbd5e1; background: #fff; color: #475569; }

        .export-table-btn {
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
        }

        .export-table-btn:hover {
          background: #f8fafc;
        }

        /* Custom Table Style */
        .table-panel-custom-shorts {
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          overflow-x: auto;
          overflow-y: visible;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
        }

        .custom-shorts-library-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
          text-align: left;
          table-layout: auto;
        }

        .custom-shorts-library-table th {
          background: #f8fafc;
          padding: 16px 20px;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #cbd5e1;
        }

        .custom-shorts-library-table td {
          padding: 20px 20px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #cbd5e1;
          vertical-align: middle;
        }

        .custom-shorts-library-table tr:last-child td {
          border-bottom: none;
        }

        /* Shorts Details Custom styling */
        .shorts-details-wrapper {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .shorts-thumb-holder {
          position: relative;
          width: 72px;
          height: 96px;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        .shorts-thumb-holder img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.9;
        }

        .duration-tag-overlay {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          font-size: 8px;
          font-weight: 850;
          padding: 2px 5px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .shorts-text-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .shorts-title-bold {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1.3;
        }

        .shorts-desc-gray {
          font-size: 11px;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 220px;
          line-height: 1.4;
        }

        .shorts-tag-row {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .tag-pill-custom {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .tag-pill-custom.blue { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .tag-pill-custom.grey { background: #f1f5f9; color: #475569; }

        /* Uploader custom styling */
        .uploader-meta-col {
          display: flex;
          flex-direction: column;
        }

        .uploader-circle-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #4f46e5;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          border: 1px solid #cbd5e1;
        }

        .uploader-name-span {
          font-size: 13px;
          font-weight: 750;
          color: #1e293b;
        }

        .uploader-role-badge-c {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 6px;
          width: fit-content;
          margin: 3px 0;
        }

        .uploader-role-badge-c.student { background: rgba(139, 92, 246, 0.08); color: #8b5cf6; }
        .uploader-role-badge-c.teacher { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }

        .uploader-id-span {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 550;
        }

        /* Subject & Class */
        .subject-class-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .subj-title {
          font-size: 13px;
          font-weight: 750;
          color: #1e293b;
        }

        .class-board-sub {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        /* Stats Grid */
        .stats-grid-cell {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          min-width: 140px;
        }

        .stat-label-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .stat-label-row svg {
          color: #94a3b8;
          font-size: 11px;
        }

        /* Status Badge */
        .status-custom-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
          padding: 4px 12px;
          border-radius: 20px;
          width: fit-content;
        }

        .status-custom-badge.approved { background: rgba(16, 185, 129, 0.08); color: #10b981; }
        .status-custom-badge.approved .status-dot { background: #10b981; }

        .status-custom-badge.pending { background: rgba(245, 158, 11, 0.08); color: #f59e0b; }
        .status-custom-badge.pending .status-dot { background: #f59e0b; }

        .status-custom-badge.rejected { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
        .status-custom-badge.rejected .status-dot { background: #ef4444; }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* Visibility */
        .visibility-cell-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .visibility-cell-row svg {
          font-size: 13px;
        }

        .visibility-cell-row svg.public { color: #10b981; }
        .visibility-cell-row svg.private { color: #94a3b8; }

        /* Uploaded On */
        .uploaded-date-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .date-main {
          font-size: 12px;
          font-weight: 650;
          color: #334155;
        }

        .time-sub {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Action buttons column — sticky right, never clip */
        .sticky-actions-th {
          position: sticky;
          right: 0;
          z-index: 3;
          background: #f8fafc;
          text-align: right;
          width: 120px;
          min-width: 120px;
          box-shadow: -4px 0 8px rgba(0,0,0,0.06);
          border-left: 1px solid #e2e8f0;
        }

        .sticky-actions-td {
          position: sticky;
          right: 0;
          z-index: 2;
          background: #fff;
          text-align: right;
          width: 120px;
          min-width: 120px;
          box-shadow: -4px 0 8px rgba(0,0,0,0.06);
          border-left: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .custom-shorts-library-table tr:hover .sticky-actions-td {
          background: #f8fafc;
        }

        /* Circular Action Buttons */
        .table-actions-button-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
          min-width: 100px;
        }

        .action-btn-circ {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          background: #fff;
          transition: all 0.15s ease;
        }

        .action-btn-circ.blue { color: #4f46e5; border-color: rgba(79, 70, 229, 0.2); }
        .action-btn-circ.blue:hover { background: rgba(79, 70, 229, 0.08); }

        .action-btn-circ.green { color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
        .action-btn-circ.green:hover { background: rgba(16, 185, 129, 0.08); }

        .action-btn-circ.orange { color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }
        .action-btn-circ.orange:hover { background: rgba(245, 158, 11, 0.08); }

        .action-btn-circ.delete { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .action-btn-circ.delete:hover { background: rgba(239, 68, 68, 0.08); }

        /* Modal Overlays & Premium Player Mockup Styles */
        .premium-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .phone-mockup-player-content {
          width: 340px;
          aspect-ratio: 9/19;
          border-radius: 40px;
          background: #1e293b;
          padding: 10px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 4px solid #475569;
        }

        .phone-screen-container {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 32px;
          overflow: hidden;
          background: #000;
          display: flex;
          flex-direction: column;
        }

        .phone-top-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 24px;
          background: #1e293b;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          z-index: 20;
        }

        .phone-video-header {
          position: absolute;
          top: 28px;
          left: 0;
          right: 0;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          z-index: 15;
        }

        .video-title-header {
          font-size: 11px;
          font-weight: 700;
          max-width: 80%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .phone-close-btn {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
        }

        .phone-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
        }

        .phone-video-details-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 16px 24px 16px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%);
          z-index: 15;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .uploader-flex {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .uploader-name-lbl {
          font-size: 13px;
          font-weight: 700;
        }

        .uploader-role-badge {
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .video-desc-txt {
          font-size: 11px;
          color: #e2e8f0;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-meta-pills {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .video-meta-pills span {
          font-size: 9px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
          border-radius: 8px;
        }
      `}</style>

    </div>
  );
};

export default ShortVideos;
