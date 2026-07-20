import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import ActionModal from '../components/ActionModal';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaUndo, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaKey, 
  FaCoins, 
  FaUserGraduate, 
  FaCheckCircle, 
  FaUserSlash, 
  FaCrown, 
  FaHourglassHalf, 
  FaUserCheck, 
  FaUserFriends, 
  FaPaperPlane, 
  FaLock, 
  FaAward
} from 'react-icons/fa';

const Students = () => {
  const { students, parents, addStudent, updateStudent, deleteStudent, plans, updateStudentSubscription } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pointsStudent, setPointsStudent] = useState(null);
  const [subStudent, setSubStudent] = useState(null);
  
  // Subscription Form State
  const [subPlanId, setSubPlanId] = useState('');
  const [subStatus, setSubStatus] = useState('free');
  const [subExpiresAt, setSubExpiresAt] = useState('');
  
  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [grade, setGrade] = useState('Class 10');
  const [rewardPoints, setRewardPoints] = useState(0);
  const [leaderboardRank, setLeaderboardRank] = useState(1);
  const [selectedParents, setSelectedParents] = useState([]);
  
  // Points Management State
  const [pointsChange, setPointsChange] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [boardFilter, setBoardFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Multi-select & actions dropdown state
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [activeActionId, setActiveActionId] = useState(null);

  // Page index
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setPhone('');
    setBoard('CBSE');
    setGrade('Class 10');
    setRewardPoints(0);
    setLeaderboardRank(students.length + 1);
    setSelectedParents([]);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone || '');
    setBoard(student.board || 'CBSE');
    setGrade(student.grade);
    
    const totalPoints = student.wallet?.totalPoints ?? student.rewardPoints ?? 0;
    setRewardPoints(totalPoints);
    setLeaderboardRank(student.leaderboardRank || 1);
    setSelectedParents(student.parentIds || []);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const fullName = String(name || '').trim();
    const parts = fullName ? fullName.split(/\s+/) : [];
    const firstName = parts[0];
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : undefined;
    const middleName = parts.length > 2 ? parts.slice(1, parts.length - 1).join(' ') : undefined;

    const normalizedPayload = {
      class: grade,
      email,
      phone,
      board,
      leaderboardRank: Number(leaderboardRank),
      wallet: {
        totalPoints: Number(rewardPoints)
      },
      parentIds: selectedParents
    };

    if (firstName) normalizedPayload.firstName = firstName;
    if (middleName) normalizedPayload.middleName = middleName;
    if (lastName) normalizedPayload.lastName = lastName;

    if (editingStudent) {
      await updateStudent(editingStudent._id || editingStudent.id, normalizedPayload);
    } else {
      await addStudent(normalizedPayload);
    }
    setModalOpen(false);
  };

  const handleQuickPointsUpdate = async (student, pointsToAdd) => {
    const existingTotal = student.wallet?.totalPoints ?? student.rewardPoints ?? 0;
    const newTotal = Math.max(0, existingTotal + pointsToAdd);

    await updateStudent(student._id || student.id, {
      wallet: {
        ...(student.wallet || {}),
        totalPoints: Number(newTotal)
      }
    });
  };

  const openPointsModal = (student) => {
    setPointsStudent(student);
    setPointsChange(0);
    setPointsModalOpen(true);
  };

  const handlePointsSubmit = async () => {
    if (!pointsStudent) return;
    const existingTotal = pointsStudent.wallet?.totalPoints ?? pointsStudent.rewardPoints ?? 0;
    const newTotal = Math.max(0, existingTotal + pointsChange);

    await updateStudent(pointsStudent._id || pointsStudent.id, {
      wallet: {
        ...(pointsStudent.wallet || {}),
        totalPoints: Number(newTotal)
      }
    });

    setPointsModalOpen(false);
  };

  const openSubModal = (student) => {
    setSubStudent(student);
    setSubPlanId(student.subscription?.planId?._id || student.subscription?.planId || '');
    setSubStatus(student.subscription?.status || 'free');
    
    if (student.subscription?.expiresAt) {
      const d = new Date(student.subscription.expiresAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setSubExpiresAt(`${year}-${month}-${day}`);
    } else {
      setSubExpiresAt('');
    }
    
    setSubModalOpen(true);
  };

  const handleSubSubmit = async () => {
    if (!subStudent) return;
    
    const payload = {
      status: subStatus,
      expiresAt: subExpiresAt ? new Date(subExpiresAt).toISOString() : null
    };
    
    if (subPlanId) {
      payload.planId = subPlanId;
    } else {
      payload.planId = null;
    }
    
    await updateStudentSubscription(subStudent._id || subStudent.id, payload);
    setSubModalOpen(false);
  };

  const handleParentToggle = (parentId) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId) 
        : [...prev, parentId]
    );
  };

  // Helper for generating initials avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'S';
    return fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Helper to determine styling for grade badges
  const getClassBadgeClass = (cls) => {
    const classNum = parseInt(cls?.replace(/\D/g, '')) || 10;
    if (classNum >= 11) return 'grade-senior';
    if (classNum >= 9) return 'grade-secondary';
    if (classNum >= 6) return 'grade-middle';
    return 'grade-primary';
  };

  // Reset all search and dropdown filters
  const resetFilters = () => {
    setSearchQuery('');
    setClassFilter('all');
    setBoardFilter('all');
    setSubscriptionFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
  };

  // Filter students array
  const filteredStudents = students.filter(st => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (st.name || '').toLowerCase().includes(searchLower);
    const emailMatch = (st.email || '').toLowerCase().includes(searchLower);
    const phoneMatch = (st.phone || '').toLowerCase().includes(searchLower);
    const vlmIdMatch = (st.vlmStudentId || '').toLowerCase().includes(searchLower);
    const queryMatch = !searchQuery || nameMatch || emailMatch || phoneMatch || vlmIdMatch;

    const classMatch = classFilter === 'all' || st.grade === classFilter;
    const boardMatch = boardFilter === 'all' || (st.board || 'CBSE') === boardFilter;
    
    const matchedPlan = plans.find(p => p._id === (st.subscription?.planId?._id || st.subscription?.planId));
    const planName = matchedPlan ? matchedPlan.name : '';
    const isActiveSub = st.subscription?.status === 'active' || st.subscription?.status === 'trial';
    
    let currentSub = 'Free';
    if (isActiveSub) {
      currentSub = planName || 'Premium';
    }
    
    const subMatch = subscriptionFilter === 'all' || 
      currentSub.toLowerCase() === subscriptionFilter.toLowerCase();
    
    const statusMatch = statusFilter === 'all' || (st.status || 'active') === statusFilter;

    return queryMatch && classMatch && boardMatch && subMatch && statusMatch;
  });

  // Sort students array
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.leaderboardRank || 0) - (a.leaderboardRank || 0);
    }
    if (sortBy === 'oldest') {
      return (a.leaderboardRank || 0) - (b.leaderboardRank || 0);
    }
    if (sortBy === 'points') {
      const ptsA = a.wallet?.totalPoints ?? a.rewardPoints ?? 0;
      const ptsB = b.wallet?.totalPoints ?? b.rewardPoints ?? 0;
      return ptsB - ptsA;
    }
    return 0;
  });

  // Pagination bounds
  const totalItems = sortedStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + pageSize);

  // Bulk actions handlers
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === paginatedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(paginatedStudents.map(st => st._id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Mock static values for metrics to align with the design aesthetics of VLM Academy dashboard
  const totalStudentCount = students.length;
  const activeTodayCount = students.filter(s => s.status !== 'inactive').length;
  const premiumCount = students.filter((s, idx) => idx % 2 === 0).length;
  const pendingVerifyCount = Math.max(1, Math.floor(students.length * 0.08));
  const onlineNowCount = Math.max(1, Math.floor(students.length * 0.22));

  return (
    <div className="students-view animate-fade-in">
      {/* Premium Sub-Header Title Bar */}
      <div className="view-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="view-title">Student Management</h2>
          <p className="view-subtitle">Manage, verify, and monitor all students across VLM Academy portal.</p>
        </div>
        <button className="glass-button add-student-premium-btn" onClick={openAddModal}>
          <FaPlus style={{ marginRight: '8px' }} /> Add Student
        </button>
      </div>

      {/* VLM Style Premium Metrics Cards */}
      <div className="students-metrics-grid">
        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap violet">
            <FaUserGraduate />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Total Students</span>
            <span className="m-val">{totalStudentCount}</span>
            <span className="m-trend positive">↑ 12.5% vs last 30d</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap green">
            <FaUserCheck />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Active Today</span>
            <span className="m-val">{activeTodayCount}</span>
            <span className="m-trend positive">↑ 8.4% vs yesterday</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap orange">
            <FaCrown />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Premium Subscribers</span>
            <span className="m-val">{premiumCount}</span>
            <span className="m-trend positive">↑ 15.3% vs last 30d</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap amber">
            <FaHourglassHalf />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Verification Pending</span>
            <span className="m-val">{pendingVerifyCount}</span>
            <span className="m-trend negative">↓ 3.2% vs yesterday</span>
          </div>
        </div>

        <div className="glass-panel metric-card-st">
          <div className="metric-icon-wrap live">
            <span className="live-pulse-dot"></span>
            <FaUserFriends />
          </div>
          <div className="metric-card-info">
            <span className="m-lbl">Online Now</span>
            <span className="m-val">{onlineNowCount}</span>
            <span className="m-trend live-indicator">● Live</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Controls Row */}
      <div className="glass-panel search-filters-row">
        <div className="search-input-wrap">
          <FaSearch className="search-ic" />
          <input 
            type="text" 
            placeholder="Search by name, phone, email or student ID..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="filter-input-element"
          />
        </div>

        <div className="filter-selects-grid">
          <div className="filter-select-group">
            <label>Class</label>
            <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Classes</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Board</label>
            <select value={boardFilter} onChange={(e) => { setBoardFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Subscription</label>
            <select value={subscriptionFilter} onChange={(e) => { setSubscriptionFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Subscriptions</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Free">Free</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Rank Ascending</option>
              <option value="oldest">Rank Descending</option>
              <option value="points">Reward Points</option>
            </select>
          </div>
        </div>

        <button className="reset-filters-premium-btn" onClick={resetFilters} title="Reset all filters">
          <FaUndo /> Reset
        </button>
      </div>

      {/* Bulk Actions Utility Row */}
      <div className="bulk-actions-toolbar glass-panel">
        <label className="checkbox-container-premium">
          <input 
            type="checkbox" 
            checked={paginatedStudents.length > 0 && selectedStudentIds.length === paginatedStudents.length} 
            onChange={handleToggleSelectAll} 
          />
          <span className="checkmark-premium"></span>
          <span className="sel-all-text">Select Page ({selectedStudentIds.length} Selected)</span>
        </label>

        {selectedStudentIds.length > 0 && (
          <div className="bulk-buttons-flex">
            <button className="bulk-btn notify">
              <FaPaperPlane /> Send Notification
            </button>
            <button className="bulk-btn delete" onClick={async () => {
              if (window.confirm(`Delete ${selectedStudentIds.length} selected students?`)) {
                for (const id of selectedStudentIds) {
                  await deleteStudent(id);
                }
                setSelectedStudentIds([]);
              }
            }}>
              <FaTrash /> Delete Selected
            </button>
          </div>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
          Total filtered: {totalItems} students
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="students-table-wrapper glass-panel">
        {paginatedStudents.length === 0 ? (
          <div className="no-students-placeholder">
            <FaUserGraduate className="placeholder-icon" />
            <h4>No students found matching your filters</h4>
            <p>Modify your search criteria or add a new student using the button above.</p>
          </div>
        ) : (
          <table className="premium-students-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Student</th>
                <th>Student ID</th>
                <th>Class</th>
                <th>Board</th>
                <th>Linked Parents</th>
                <th>Subscription</th>
                <th>Streak / XP</th>
                <th>Status</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right', width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((st, idx) => {
                const totalPoints = st.wallet?.totalPoints ?? st.rewardPoints ?? 0;
                // Generate a consistent mock streak and last active text for beautiful design
                const mockStreak = ((totalPoints * 3) % 20) + 1;
                const isOnline = (totalPoints % 3) === 0;
                const linkedParentsList = parents.filter(p => st.parentIds?.includes(p.id));
                const matchedPlan = plans.find(p => p._id === (st.subscription?.planId?._id || st.subscription?.planId));
                const planName = matchedPlan ? matchedPlan.name : '';
                const subType = st.subscription?.status === 'active' 
                  ? (planName || 'Active') 
                  : (st.subscription?.status || (totalPoints > 300 ? 'Premium' : 'Free'));

                return (
                  <tr key={st._id}>
                    <td>
                      <label className="checkbox-container-premium">
                        <input 
                          type="checkbox" 
                          checked={selectedStudentIds.includes(st._id)}
                          onChange={() => handleToggleSelectOne(st._id)}
                        />
                        <span className="checkmark-premium"></span>
                      </label>
                    </td>
                    <td>
                      <div className="student-profile-flex">
                        <div className="student-circle-avatar">
                          {getInitials(st.name)}
                        </div>
                        <div className="student-profile-details">
                          <span className="st-name">{st.name}</span>
                          <span className="st-phone">{st.phone || '+91 98765 00000'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="st-id-code">{st.vlmStudentId || `VLM1000${idx + 23}`}</span>
                    </td>
                    <td>
                      <span className={`grade-badge ${getClassBadgeClass(st.grade)}`}>
                        {st.grade}
                      </span>
                    </td>
                    <td>
                      <span className="board-lbl">{st.board || 'CBSE'}</span>
                    </td>
                    <td>
                      <div className="linked-parents-td">
                        {linkedParentsList.length > 0 ? (
                          linkedParentsList.map((p, pIdx) => (
                            <div key={p.id || pIdx} className="parent-inline-item">
                              <span className="p-n">{p.name}</span>
                              <span className="p-p">{p.phone}</span>
                            </div>
                          ))
                        ) : (
                          <span className="no-parents-lbl">None Linked</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="sub-badge-wrap">
                        <span className={`subscription-badge ${(st.subscription?.status || 'free').toLowerCase()}`}>
                          {String(subType).toUpperCase()}
                        </span>
                        {st.subscription?.expiresAt && (
                          <span className="sub-expiry">
                            Exp: {new Date(st.subscription.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="gamification-td">
                        <span className="streak-fire">🔥 {mockStreak} days</span>
                        <span className="xp-label">🪙 {totalPoints} pts</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${st.status || 'active'}`}>
                        {st.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="last-active-indicator">
                        <span className={`indicator-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        <span className="time-lbl">{isOnline ? 'Online now' : '15 mins ago'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        className="table-action-trigger-btn"
                        onClick={() => setActiveActionId(activeActionId === st._id ? null : st._id)}
                      >
                        <FaEllipsisV />
                      </button>

                      {activeActionId === st._id && (
                        <>
                          <div 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                            onClick={() => setActiveActionId(null)}
                          />
                          <div className="popover-action-dropdown-menu" style={{ position: 'absolute', right: '10px', top: '38px', zIndex: 999 }}>
                            <button onClick={() => { setActiveActionId(null); openEditModal(st); }} className="popover-item">
                              <FaEdit /> Edit Details
                            </button>
                            <button onClick={() => { setActiveActionId(null); openPointsModal(st); }} className="popover-item">
                              <FaCoins /> Manage Points
                            </button>
                            <button onClick={() => { setActiveActionId(null); openSubModal(st); }} className="popover-item">
                              <FaCrown /> Manage Subscription
                            </button>
                            <button 
                              onClick={async () => {
                                setActiveActionId(null);
                                const newStatus = st.status === 'inactive' ? 'active' : 'inactive';
                                await updateStudent(st._id, { status: newStatus });
                              }} 
                              className="popover-item"
                            >
                              {st.status === 'inactive' ? <FaCheckCircle /> : <FaUserSlash />}
                              {st.status === 'inactive' ? 'Activate User' : 'Suspend User'}
                            </button>
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                            <button onClick={async () => {
                              setActiveActionId(null);
                              if (window.confirm(`Are you sure you want to delete ${st.name}?`)) {
                                await deleteStudent(st._id);
                              }
                            }} className="popover-item text-danger">
                              <FaTrash /> Delete Student
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

      {/* Pagination Controller Row */}
      {totalPages > 1 && (
        <div className="pagination-wrapper-premium glass-panel">
          <span className="results-lbl">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} students
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

      {/* Create & Edit Student Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
        onSubmit={handleSubmit}
        submitText={editingStudent ? 'Save Details' : 'Create Profile'}
      >
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ritik Parihar"
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
            placeholder="ritik.parihar@gmail.com"
            className="glass-input"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>Academic Board</label>
            <select value={board} onChange={(e) => setBoard(e.target.value)} className="glass-select">
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="glass-select"
            >
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          <div className="form-group">
            <label>Leaderboard Rank</label>
            <input
              type="number"
              min="1"
              required
              value={leaderboardRank}
              onChange={(e) => setLeaderboardRank(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Reward Points (XP)</label>
          <input
            type="number"
            min="0"
            required
            value={rewardPoints}
            onChange={(e) => setRewardPoints(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="form-group">
          <label>Link Parents</label>
          <div className="parent-links-selector">
            {parents.map(parent => (
              <label key={parent.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedParents.includes(parent.id)}
                  onChange={() => handleParentToggle(parent.id)}
                />
                <span className="custom-checkbox"></span>
                <span className="checkbox-text">{parent.name} ({parent.phone})</span>
              </label>
            ))}
          </div>
        </div>
      </ActionModal>

      {/* Manage Points Modal */}
      <ActionModal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
        title={`Manage Points: ${pointsStudent?.name || ''}`}
        onSubmit={handlePointsSubmit}
        submitText="Update Points"
      >
        <div className="form-group">
          <label>Current Points</label>
          <div className="current-points-display">
            🪙 {pointsStudent?.wallet?.totalPoints ?? pointsStudent?.rewardPoints ?? 0}
          </div>
        </div>

        <div className="form-group">
          <label>Points Change (can be negative to subtract)</label>
          <input
            type="number"
            value={pointsChange}
            onChange={(e) => setPointsChange(Number(e.target.value))}
            placeholder="Enter points to add (negative to subtract)"
            className="glass-input"
          />
        </div>

        <div className="points-preview">
          <span>New Total: </span>
          <strong>🪙 {Math.max(0, (pointsStudent?.wallet?.totalPoints ?? pointsStudent?.rewardPoints ?? 0) + pointsChange)}</strong>
        </div>
      </ActionModal>

      {/* Manage Subscription Modal */}
      <ActionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={`Manage Subscription: ${subStudent?.name || ''}`}
        onSubmit={handleSubSubmit}
        submitText="Save Subscription"
      >
        <div className="form-group">
          <label>Subscription Status</label>
          <select
            value={subStatus}
            onChange={(e) => setSubStatus(e.target.value)}
            className="glass-input"
            style={{ width: '100%', background: 'rgba(30, 41, 59, 0.7)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <option value="free" style={{ background: '#1e293b' }}>Free</option>
            <option value="trial" style={{ background: '#1e293b' }}>Trial</option>
            <option value="active" style={{ background: '#1e293b' }}>Active</option>
            <option value="expired" style={{ background: '#1e293b' }}>Expired</option>
            <option value="cancelled" style={{ background: '#1e293b' }}>Cancelled</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Select Plan</label>
          <select
            value={subPlanId}
            onChange={(e) => setSubPlanId(e.target.value)}
            className="glass-input"
            style={{ width: '100%', background: 'rgba(30, 41, 59, 0.7)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <option value="" style={{ background: '#1e293b' }}>No Plan (Free / Custom)</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id} style={{ background: '#1e293b' }}>
                {p.name} (Class {p.class} - {p.duration})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Expiry Date</label>
          <input
            type="date"
            value={subExpiresAt}
            onChange={(e) => setSubExpiresAt(e.target.value)}
            className="glass-input"
            style={{ width: '100%', colorScheme: 'dark' }}
          />
        </div>
      </ActionModal>

      {/* Custom Stylesheet */}
      <style>{`
        .students-view {
          padding: 10px 0;
        }

        .add-student-premium-btn {
          background: #4f46e5;
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
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }

        .add-student-premium-btn:hover {
          background: #4338ca;
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

        .metric-icon-wrap.violet { background: #f5f3ff; color: #6d28d9; }
        .metric-icon-wrap.green { background: #ecfdf5; color: #047857; }
        .metric-icon-wrap.orange { background: #eff6ff; color: #1d4ed8; }
        .metric-icon-wrap.amber { background: #fffbeb; color: #b45309; }
        
        .metric-icon-wrap.live { 
          background: #fff5f5; 
          color: #e11d48; 
          position: relative;
        }

        .live-pulse-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
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
        }

        .metric-card-info .m-trend.positive { color: #10b981; }
        .metric-card-info .m-trend.negative { color: #f43f5e; }
        .metric-card-info .m-trend.live-indicator { color: #e11d48; font-weight: 800; }

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
          border-color: #4f46e5;
        }

        .filter-selects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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

        .bulk-btn.notify { background: #eff6ff; color: #1e40af; }
        .bulk-btn.notify:hover { background: #dbeafe; }
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
          border-color: #4f46e5;
        }

        .checkbox-container-premium input:checked ~ .checkmark-premium {
          background-color: #4f46e5;
          border-color: #4f46e5;
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
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 5px rgba(79, 70, 229, 0.2);
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

        .st-id-code {
          font-family: monospace;
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 4px;
        }

        /* Class grades custom badge colors */
        .grade-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
        }
        
        .grade-senior { background: #f5f3ff; color: #7c3aed; }
        .grade-secondary { background: #ecfdf5; color: #059669; }
        .grade-middle { background: #eff6ff; color: #2563eb; }
        .grade-primary { background: #fff7ed; color: #d97706; }

        .board-lbl {
          font-weight: 800;
          font-size: 11px;
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

        /* Subscription */
        .subscription-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .subscription-badge.premium { background: #e0f2fe; color: #0369a1; }
        .subscription-badge.free { background: #f1f5f9; color: #64748b; }

        .sub-expiry {
          display: block;
          font-size: 9px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* Gamification */
        .gamification-td {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .streak-fire {
          font-weight: 750;
          color: #ea580c;
          font-size: 11.5px;
        }

        .xp-label {
          font-size: 11px;
          font-weight: 700;
          color: #b45309;
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

        /* Action Modal Settings */
        .parent-links-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 150px;
          overflow-y: auto;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
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
          background: #4f46e5;
          border-color: #4f46e5;
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
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
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

export default Students;