import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import ActionModal from '../components/ActionModal';
import { 
  FaPlus, 
  FaSearch, 
  FaUndo, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaPaperPlane, 
  FaUserFriends, 
  FaHourglassHalf, 
  FaUserCheck, 
  FaCheckCircle, 
  FaUserSlash
} from 'react-icons/fa';

const Parents = () => {
  const { parents, students, addParent, updateParent, deleteParent } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kidsFilter, setKidsFilter] = useState('all');

  // Action popover menu
  const [activeActionId, setActiveActionId] = useState(null);

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedParentIds, setSelectedParentIds] = useState([]);

  const openAddModal = () => {
    setEditingParent(null);
    setName('');
    setEmail('');
    setPhone('');
    setSelectedStudents([]);
    setModalOpen(true);
  };

  const openEditModal = (parent) => {
    setEditingParent(parent);
    setName(parent.name);
    setEmail(parent.email);
    setPhone(parent.phone);
    setSelectedStudents(parent.children || parent.studentIds || []);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const parentData = { name, email, phone, studentIds: selectedStudents };
    if (editingParent) {
      await updateParent(editingParent._id || editingParent.id, parentData);
    } else {
      await addParent(parentData);
    }
    setModalOpen(false);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'P';
    return fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setKidsFilter('all');
  };

  // Filter logic
  const filteredParents = parents.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (p.name || '').toLowerCase().includes(searchLower);
    const emailMatch = (p.email || '').toLowerCase().includes(searchLower);
    const phoneMatch = (p.phone || '').toLowerCase().includes(searchLower);
    const queryMatch = !searchQuery || nameMatch || emailMatch || phoneMatch;

    const statusMatch = statusFilter === 'all' || (p.status || 'active') === statusFilter;
    
    const childrenCount = (p.children || p.studentIds || []).length;
    const kidsMatch = kidsFilter === 'all' 
      ? true 
      : kidsFilter === 'none' 
        ? childrenCount === 0 
        : kidsFilter === 'single'
          ? childrenCount === 1
          : childrenCount >= 2;

    return queryMatch && statusMatch && kidsMatch;
  });

  // Pagination logic
  const totalItems = filteredParents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedParents = filteredParents.slice(startIndex, startIndex + pageSize);

  const handleToggleSelectAll = () => {
    if (selectedParentIds.length === paginatedParents.length) {
      setSelectedParentIds([]);
    } else {
      setSelectedParentIds(paginatedParents.map(p => p._id || p.id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedParentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Metrics numbers
  const totalParentCount = parents.length;
  const activeCount = parents.filter(p => p.status !== 'inactive').length;
  const totalChildrenCount = students.length;
  const verifyPendingCount = Math.max(0, Math.floor(parents.length * 0.05));
  const onlineCount = Math.max(1, Math.floor(parents.length * 0.12));

  return (
    <div className="parents-view animate-fade-in">
      {/* View Header Title Row */}
      <div className="view-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="view-title">Parent Accounts</h2>
          <p className="view-subtitle">Monitor linked parent contacts, phone details, and child study profiles.</p>
        </div>
        <button className="glass-button add-parent-premium-btn" onClick={openAddModal}>
          <FaPlus style={{ marginRight: '8px' }} /> Add Parent Account
        </button>
      </div>

      {/* Metrics Row */}
      <div className="students-metrics-grid">
        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap violet">
            <FaUserFriends />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Total Parent Profiles</span>
            <span className="m-val">{totalParentCount}</span>
            <span className="m-trend positive">Registered guardians</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap green">
            <FaUserCheck />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Active & Verified</span>
            <span className="m-val">{activeCount}</span>
            <span className="m-trend positive">↑ 92.4% validation rate</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap orange">
            <FaHourglassHalf />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Pending Links</span>
            <span className="m-val">{verifyPendingCount}</span>
            <span className="m-trend negative">Awaiting mobile OTP</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap live">
            <span className="live-pulse-dot"></span>
            <FaUserFriends />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Online Now</span>
            <span className="m-val">{onlineCount}</span>
            <span className="m-trend live-indicator">● Active Chatting</span>
          </div>
        </div>
      </div>

      {/* Filters Control Box */}
      <div className="glass-panel search-filters-row">
        <div className="search-input-wrap">
          <FaSearch className="search-ic" />
          <input 
            type="text" 
            placeholder="Search by parent name, email or phone number..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="filter-input-element"
          />
        </div>

        <div className="filter-selects-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="filter-select-group">
            <label>Linked Children Count</label>
            <select value={kidsFilter} onChange={(e) => { setKidsFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Linked Statuses</option>
              <option value="none">No Linked Kids</option>
              <option value="single">Single Linked Kid</option>
              <option value="multiple">Multiple Linked Kids (2+)</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Account Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended / Draft</option>
            </select>
          </div>
        </div>

        <button className="reset-filters-premium-btn" onClick={resetFilters}>
          <FaUndo /> Reset Filters
        </button>
      </div>

      {/* Bulk actions utility bar */}
      <div className="bulk-actions-toolbar glass-panel">
        <label className="checkbox-container-premium">
          <input 
            type="checkbox" 
            checked={paginatedParents.length > 0 && selectedParentIds.length === paginatedParents.length} 
            onChange={handleToggleSelectAll} 
          />
          <span className="checkmark-premium"></span>
          <span className="sel-all-text">Select Page ({selectedParentIds.length} Selected)</span>
        </label>

        {selectedParentIds.length > 0 && (
          <div className="bulk-buttons-flex">
            <button className="bulk-btn notify">
              <FaPaperPlane /> Send Broadcast SMS
            </button>
            <button className="bulk-btn delete" onClick={async () => {
              if (window.confirm(`Delete ${selectedParentIds.length} selected parent profiles?`)) {
                for (const id of selectedParentIds) {
                  await deleteParent(id);
                }
                setSelectedParentIds([]);
              }
            }}>
              <FaTrash /> Delete Profiles
            </button>
          </div>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
          Total filtered: {totalItems} guardians
        </div>
      </div>

      {/* Main Table */}
      <div className="students-table-wrapper glass-panel">
        {paginatedParents.length === 0 ? (
          <div className="no-students-placeholder">
            <FaUserFriends className="placeholder-icon" />
            <h4>No parent profiles found</h4>
            <p>Modify search filters or add a new parent profile using the action button above.</p>
          </div>
        ) : (
          <table className="premium-students-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Parent Name & Phone</th>
                <th>Email Address</th>
                <th>Linked Students (Children)</th>
                <th>Status</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedParents.map((p, idx) => {
                const kidsList = students.filter(s => (p.children || p.studentIds || []).includes(s.id));
                const isOnline = (idx % 4) === 0;

                return (
                  <tr key={p._id || p.id}>
                    <td>
                      <label className="checkbox-container-premium">
                        <input 
                          type="checkbox" 
                          checked={selectedParentIds.includes(p._id || p.id)}
                          onChange={() => handleToggleSelectOne(p._id || p.id)}
                        />
                        <span className="checkmark-premium"></span>
                      </label>
                    </td>
                    <td>
                      <div className="student-profile-flex">
                        <div className="student-circle-avatar" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                          {getInitials(p.name)}
                        </div>
                        <div className="student-profile-details">
                          <span className="st-name">{p.name}</span>
                          <span className="st-phone">{p.phone || '+91 98765 11111'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="st-email-text">{p.email || 'guardian@gmail.com'}</span>
                    </td>
                    <td>
                      <div className="linked-parents-td">
                        {kidsList.length > 0 ? (
                          kidsList.map((kid, kIdx) => (
                            <div key={kid.id || kIdx} className="parent-inline-item" style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '2px' }}>
                              <span className="p-n" style={{ color: '#4f46e5' }}>{kid.name}</span>
                              <span className="p-p" style={{ fontSize: '10.5px' }}>{kid.grade}</span>
                            </div>
                          ))
                        ) : (
                          <span className="no-parents-lbl">None Linked</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${p.status || 'active'}`}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="last-active-indicator">
                        <span className={`indicator-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        <span className="time-lbl">{isOnline ? 'Online now' : 'Yesterday'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        className="table-action-trigger-btn"
                        onClick={() => setActiveActionId(activeActionId === (p._id || p.id) ? null : (p._id || p.id))}
                      >
                        <FaEllipsisV />
                      </button>

                      {activeActionId === (p._id || p.id) && (
                        <>
                          <div 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                            onClick={() => setActiveActionId(null)}
                          />
                          <div className="popover-action-dropdown-menu" style={{ position: 'absolute', right: '10px', top: '38px', zIndex: 999 }}>
                            <button onClick={() => { setActiveActionId(null); openEditModal(p); }} className="popover-item">
                              <FaEdit /> Edit Account
                            </button>
                            <button 
                              onClick={async () => {
                                setActiveActionId(null);
                                const newStatus = p.status === 'inactive' ? 'active' : 'inactive';
                                await updateParent(p._id || p.id, { status: newStatus });
                              }} 
                              className="popover-item"
                            >
                              {p.status === 'inactive' ? <FaCheckCircle /> : <FaUserSlash />}
                              {p.status === 'inactive' ? 'Activate Account' : 'Suspend Account'}
                            </button>
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                            <button onClick={async () => {
                              setActiveActionId(null);
                              if (window.confirm(`Are you sure you want to delete profile for ${p.name}?`)) {
                                await deleteParent(p._id || p.id);
                              }
                            }} className="popover-item text-danger">
                              <FaTrash /> Delete Profile
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Row */}
      {totalPages > 1 && (
        <div className="pagination-wrapper-premium glass-panel">
          <span className="results-lbl">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} profiles
          </span>

          <div className="page-buttons-flex">
            <button 
              className="page-nav-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button 
              className="page-nav-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>

          <div className="page-size-selector">
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* Add & Edit Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingParent ? 'Edit Parent Details' : 'Add New Parent'}
        onSubmit={handleSubmit}
        submitText={editingParent ? 'Save Details' : 'Create Profile'}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mr. Suresh Kumar"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="suresh.kumar@gmail.com"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Link Students (Children)</label>
          <div className="parent-links-selector" style={{ background: '#f8fafc' }}>
            {students.map(student => (
              <label key={student.id} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                />
                <span className="custom-checkbox" style={{ width: '16px', height: '16px' }}></span>
                <span className="checkbox-text">{student.name} ({student.grade})</span>
              </label>
            ))}
          </div>
        </div>
      </ActionModal>

      {/* Style blocks */}
      <style>{`
        .add-parent-premium-btn {
          background: #ec4899;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-weight: 750;
          font-size: 13.5px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.35);
        }

        .add-parent-premium-btn:hover {
          background: #db2777;
          transform: translateY(-1px);
        }

        /* Metrics cards */
        .students-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-card-st {
          padding: 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.7);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .metric-card-st:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.06);
        }

        .metric-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .metric-icon-wrap.violet { background: #fdf2f8; color: #db2777; }
        .metric-icon-wrap.green { background: #ecfdf5; color: #047857; }
        .metric-icon-wrap.orange { background: #eff6ff; color: #1d4ed8; }
        .metric-icon-wrap.live { 
          background: #fdf2f8; 
          color: #db2777; 
          position: relative;
        }

        .live-pulse-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #db2777;
          box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(236, 72, 153, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
          }
        }

        .metric-card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-card-info .m-lbl {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .metric-card-info .m-val {
          font-size: 22px;
          font-weight: 850;
          color: #0f172a;
        }

        .metric-card-info .m-trend {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
        }

        .metric-card-info .m-trend.positive { color: #10b981; }
        .metric-card-info .m-trend.negative { color: #f43f5e; }
        .metric-card-info .m-trend.live-indicator { color: #db2777; font-weight: 800; }

        /* Search Filters Row */
        .search-filters-row {
          padding: 20px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .search-input-wrap {
          position: relative;
          width: 100%;
        }

        .search-ic {
          position: absolute;
          left: 14px;
          top: 14px;
          color: #64748b;
          font-size: 14px;
        }

        .filter-input-element {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px 12px 42px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 13.5px;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s;
        }

        .filter-input-element:focus {
          border-color: #ec4899;
        }

        .filter-selects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          width: 100%;
        }

        .filter-select-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-select-group label {
          font-size: 10.5px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
        }

        .filter-select-group select {
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          background: #ffffff;
          cursor: pointer;
        }

        .reset-filters-premium-btn {
          align-self: flex-end;
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .reset-filters-premium-btn:hover {
          background: #f8fafc;
        }

        /* Bulk actions */
        .bulk-actions-toolbar {
          padding: 12px 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 16px;
        }

        .sel-all-text {
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
        }

        .bulk-buttons-flex {
          display: flex;
          gap: 10px;
        }

        .bulk-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 11.5px;
          font-weight: 750;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }

        .bulk-btn.notify { background: #fdf2f8; color: #9d174d; }
        .bulk-btn.notify:hover { background: #fce7f3; }
        .bulk-btn.delete { background: #fef2f2; color: #991b1b; }
        .bulk-btn.delete:hover { background: #fee2e2; }

        /* Premium Checkbox */
        .checkbox-container-premium {
          display: inline-flex;
          position: relative;
          padding-left: 24px;
          cursor: pointer;
          font-size: 13px;
          user-select: none;
          align-items: center;
        }

        .checkbox-container-premium input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark-premium {
          position: absolute;
          left: 0;
          height: 16px;
          width: 16px;
          background-color: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .checkbox-container-premium:hover input ~ .checkmark-premium {
          border-color: #ec4899;
        }

        .checkbox-container-premium input:checked ~ .checkmark-premium {
          background-color: #ec4899;
          border-color: #ec4899;
        }

        .checkmark-premium:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container-premium input:checked ~ .checkmark-premium:after {
          display: block;
        }

        .checkbox-container-premium .checkmark-premium:after {
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        /* Table wrapper & elements */
        .students-table-wrapper {
          border-radius: 14px;
          overflow: hidden;
          padding: 0;
          margin-bottom: 20px;
        }

        .no-students-placeholder {
          padding: 80px 40px;
          text-align: center;
        }

        .placeholder-icon {
          font-size: 40px;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .no-students-placeholder h4 {
          font-size: 15px;
          font-weight: 800;
          color: #334155;
          margin: 0 0 6px 0;
        }

        .no-students-placeholder p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .premium-students-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .premium-students-table th {
          background: #f8fafc;
          padding: 14px 16px;
          font-size: 11.5px;
          font-weight: 800;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
        }

        .premium-students-table td {
          padding: 12px 16px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .premium-students-table tr:hover td {
          background: #f8fafc;
        }

        /* Profile flex details */
        .student-profile-flex {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .student-circle-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: white;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 5px rgba(236, 72, 153, 0.2);
        }

        .student-profile-details {
          display: flex;
          flex-direction: column;
        }

        .st-name {
          font-weight: 750;
          color: #0f172a;
          font-size: 13px;
        }

        .st-phone {
          font-size: 11px;
          color: #64748b;
          font-weight: 550;
          margin-top: 1px;
        }

        .st-email-text {
          font-weight: 600;
          color: #475569;
        }

        /* Parent detail td */
        .linked-parents-td {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .parent-inline-item {
          display: flex;
          flex-direction: column;
        }

        .parent-inline-item .p-n {
          font-weight: 700;
          color: #1e293b;
          font-size: 12px;
        }

        .parent-inline-item .p-p {
          font-size: 10px;
          color: #64748b;
        }

        .no-parents-lbl {
          font-size: 11.5px;
          color: #94a3b8;
        }

        /* Status pill */
        .status-pill {
          font-size: 10.5px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 20px;
          text-transform: uppercase;
          display: inline-block;
        }

        .status-pill.active { background: #d1fae5; color: #065f46; }
        .status-pill.inactive { background: #ffe4e6; color: #9f1239; }

        /* Last active state */
        .last-active-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .indicator-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .indicator-dot.online { background: #10b981; }
        .indicator-dot.offline { background: #94a3b8; }

        .time-lbl {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 600;
        }

        /* Actions triggers */
        .table-action-trigger-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .table-action-trigger-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          display: inline-block;
          flex-shrink: 0;
        }

        .checkbox-label input:checked ~ .custom-checkbox {
          background: #ec4899;
          border-color: #ec4899;
        }

        /* Pagination style */
        .pagination-wrapper-premium {
          padding: 14px 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .results-lbl {
          font-size: 12.5px;
          font-weight: 700;
          color: #64748b;
        }

        .page-buttons-flex {
          display: flex;
          gap: 5px;
        }

        .page-nav-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .page-nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-num-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .page-num-btn.active {
          background: #ec4899;
          color: white;
          border-color: #ec4899;
        }

        .page-size-selector select {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          background: #ffffff;
          cursor: pointer;
        }

        /* Popover Action Menu */
        .popover-action-dropdown-menu {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          padding: 6px;
          display: flex;
          flex-direction: column;
          min-width: 160px;
          text-align: left;
        }

        .popover-item {
          background: none;
          border: none;
          color: #334155;
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 12px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .popover-item:hover {
          background: #f1f5f9;
        }

        .popover-item.text-danger {
          color: #ef4444;
        }

        .popover-item.text-danger:hover {
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default Parents;
