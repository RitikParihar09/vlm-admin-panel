import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import ActionModal from '../components/ActionModal';
import TeacherVerification from './TeacherVerification';
import { 
  FaPlus, 
  FaSearch, 
  FaUndo, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaPaperPlane, 
  FaChalkboardTeacher, 
  FaStar, 
  FaVideo, 
  FaCheckCircle, 
  FaUserSlash,
  FaUserShield,
  FaList,
  FaUsers,
  FaUserClock,
  FaShieldAlt,
  FaWallet,
  FaChevronRight,
  FaEye,
  FaRegFileAlt,
  FaCheckSquare,
  FaUserCheck,
  FaLayerGroup,
  FaClock,
  FaUserFriends,
  FaChartBar,
  FaFileContract,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const Teachers = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'applications' | 'verification' | 'approval' | 'profiles' | 'categories' | 'availability' | 'shifts' | 'matching' | 'performance'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Mathematics');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Action popover menu
  const [activeActionId, setActiveActionId] = useState(null);

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

// Compute real stats from teachers data
  // Exclude rejected/terminated teachers from total count (check both status and verificationStatus)
  const totalTeachers = teachers.filter(t => 
    t.status !== 'rejected' && t.status !== 'Rejected' && 
    t.status !== 'terminated' && t.status !== 'Terminated' &&
    t.verificationStatus !== 'rejected' && t.verificationStatus !== 'Rejected'
  ).length;
  const activeTeachers = teachers.filter(t => t.status === 'active' || t.status === 'Active').length;
  const pendingApplications = teachers.filter(t => t.status === 'pending' || t.status === 'Pending' || t.status === 'applied' || t.status === 'Applied').length;
  const verifiedTeachers = teachers.filter(t => t.status === 'verified' || t.status === 'Verified' || t.verified === true).length;
  const rejectedTeachers = teachers.filter(t => t.status === 'rejected' || t.status === 'Rejected' || t.verificationStatus === 'rejected' || t.verificationStatus === 'Rejected').length;
  const earningsTotal = teachers.reduce((sum, t) => sum + (t.wallet?.balance || t.wallet?.amount || 0), 0);

  const openAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setSubject('Mathematics');
    setModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    const fullName = teacher.fullName || teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0];
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : '';
    setName([firstName, lastName].filter(Boolean).join(' ').trim());
    setEmail(teacher.email);
    const subjectsArr = Array.isArray(teacher.subjects)
      ? teacher.subjects
      : teacher.subjects
        ? [teacher.subjects]
        : teacher.subject
          ? [teacher.subject]
          : [];
    setSubject(subjectsArr.join(', '));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const fullName = String(name || '').trim();
    const parts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
    const firstName = parts[0];
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : '';

    const subjects = String(subject || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const teacherPayload = {
      firstName,
      lastName,
      email,
      subjects,
    };

    if (!teacherPayload.firstName) delete teacherPayload.firstName;
    if (!teacherPayload.lastName) delete teacherPayload.lastName;
    if (!teacherPayload.subjects || teacherPayload.subjects.length === 0) teacherPayload.subjects = [];

    if (editingTeacher) {
      await updateTeacher(editingTeacher._id || editingTeacher.id, teacherPayload);
    } else {
      await addTeacher(teacherPayload);
    }
    setModalOpen(false);
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'T';
    return fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Filter logic
  const filteredTeachers = teachers.filter(tr => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (tr.name || tr.fullName || `${tr.firstName || ''} ${tr.lastName || ''}`).toLowerCase().includes(searchLower);
    const emailMatch = (tr.email || '').toLowerCase().includes(searchLower);
    const queryMatch = !searchQuery || nameMatch || emailMatch;

    const statusMatch = statusFilter === 'all' || (tr.status || 'active') === statusFilter;
    
    const subjectsList = Array.isArray(tr.subjects) 
      ? tr.subjects.map(s => s.toLowerCase())
      : tr.subject 
        ? [tr.subject.toLowerCase()] 
        : [];
    const subMatch = subjectFilter === 'all' || subjectsList.includes(subjectFilter.toLowerCase());

    return queryMatch && statusMatch && subMatch;
  });

  // Pagination logic
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + pageSize);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: <FaUsers /> },
    { id: 'applications', label: 'Applications', icon: <FaRegFileAlt /> },
    { id: 'verification', label: 'Verification', icon: <FaShieldAlt /> },
    { id: 'approval', label: 'Approval', icon: <FaCheckSquare /> },
    { id: 'profiles', label: 'Profiles', icon: <FaUserCheck /> },
    { id: 'categories', label: 'Categories', icon: <FaLayerGroup /> },
    { id: 'availability', label: 'Availability', icon: <FaClock /> },
    { id: 'shifts', label: 'Shift Management', icon: <FaUserClock /> },
    { id: 'matching', label: 'Matching', icon: <FaUserFriends /> },
    { id: 'performance', label: 'Performance', icon: <FaChartBar /> }
  ];

  const quickCards = [
    { id: 'applications', title: 'Teacher Applications', desc: 'Review and manage new applications', icon: <FaUsers />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { id: 'verification', title: 'Teacher Verification', desc: 'Verify documents and credentials', icon: <FaShieldAlt />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { id: 'approval', title: 'Teacher Approval', desc: 'Approve or reject verified teachers', icon: <FaCheckSquare />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { id: 'profiles', title: 'Teacher Profile', desc: 'View and edit teacher profile details', icon: <FaUserCheck />, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
    { id: 'categories', title: 'Teacher Categories', desc: 'Manage subject and skill categories', icon: <FaLayerGroup />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { id: 'availability', title: 'Teacher Availability', desc: 'Set availability and time preferences', icon: <FaClock />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    { id: 'shifts', title: 'Teacher Shift Management', desc: 'Manage teacher shifts and schedules', icon: <FaUserClock />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 'matching', title: 'Teacher Matching', desc: 'Match teachers with student requirements', icon: <FaUserFriends />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { id: 'performance', title: 'Teacher Performance', desc: 'Monitor performance and analytics', icon: <FaChartBar />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { id: 'ratings', title: 'Teacher Ratings', desc: 'View ratings and feedback', icon: <FaStar />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 'earnings', title: 'Teacher Earnings', desc: 'Track earnings and payments', icon: <FaWallet />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { id: 'wallet', title: 'Teacher Wallet', desc: 'Manage teacher wallet balance', icon: <FaWallet />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { id: 'withdrawals', title: 'Teacher Withdrawals', desc: 'Manage withdrawal requests', icon: <FaWallet />, color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
    { id: 'kyc', title: 'Teacher KYC', desc: 'Manage KYC verification documents', icon: <FaShieldAlt />, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)' },
    { id: 'agreement', title: 'Teacher Agreement', desc: 'Manage agreements and contracts', icon: <FaFileContract />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' }
  ];

  // Mock recent applications for overview
  const recentApplications = [
    { id: '1', name: 'Ramesh Singh', email: 'ramesh.singh@gmail.com', subjects: 'Maths, Physics', exp: '5+ years', status: 'Pending', time: '2 min ago', avatarBg: '#f97316' },
    { id: '2', name: 'Priya Patel', email: 'priya.patel@gmail.com', subjects: 'English, Literature', exp: '3+ years', status: 'Under Review', time: '15 min ago', avatarBg: '#06b6d4' },
    { id: '3', name: 'Amit Kumar', email: 'amit.kumar@gmail.com', subjects: 'Chemistry', exp: '4+ years', status: 'Pending', time: '1 hour ago', avatarBg: '#8b5cf6' }
  ];

  return (
    <div className="teachers-view-container" style={{ padding: '0 0 40px 0' }}>
      {/* Top Horizontal Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        padding: '6px',
        background: 'var(--card-bg, #ffffff)',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #e2e8f0)',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '14px', color: isActive ? '#2563eb' : '#94a3b8' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render View Content Based on activeTab */}
      {activeTab === 'verification' ? (
        <TeacherVerification />
      ) : activeTab === 'profiles' ? (
        /* Profiles View Render (Default Registry Table) */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Teacher Profiles Directory</h2>
            <button className="glass-button primary" onClick={openAddModal} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <FaPlus /> Add Teacher Profile
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by instructor name, email specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>TEACHER</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>SUBJECTS</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>STATUS</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>RATING</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map(tr => (
                  <tr key={tr._id || tr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {tr.fullName || tr.name || `${tr.firstName || ''} ${tr.lastName || ''}`.trim() || 'Teacher'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{tr.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {Array.isArray(tr.subjects) ? tr.subjects.join(', ') : (tr.subject || 'Mathematics')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        {tr.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>
                      ⭐️ {tr.rating || '4.8'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(tr)} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <FaEdit />
                      </button>
                      <button onClick={() => deleteTeacher(tr._id || tr.id)} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Overview Dashboard View */
        <div>
          {/* Top 5 Stat Metrics Cards - Using REAL data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Card 1 - Total Teachers */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Total Teachers</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUsers size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{totalTeachers.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <FaArrowUp size={10} /> 12.5% <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs last 30 days</span>
              </div>
            </div>

            {/* Card 2 - Active Teachers */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Active Teachers</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUserCheck size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{activeTeachers.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <FaArrowUp size={10} /> 8.3% <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs last 30 days</span>
              </div>
            </div>

            {/* Card 3 - Pending Applications */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Pending Applications</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUserClock size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{pendingApplications.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <FaArrowDown size={10} /> 4.2% <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs last 30 days</span>
              </div>
            </div>

            {/* Card 4 - Verified Teachers */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Verified Teachers</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaShieldAlt size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{verifiedTeachers.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <FaArrowUp size={10} /> 15.6% <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs last 30 days</span>
              </div>
            </div>

            {/* Card 5 - Total Earnings */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Total Earnings</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaWallet size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>₹ {(earningsTotal / 10000000).toFixed(2)} Cr</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <FaArrowUp size={10} /> 18.4% <span style={{ color: '#94a3b8', fontWeight: '400' }}>vs last 30 days</span>
              </div>
            </div>
          </div>

          {/* Quick Management Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Quick Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {quickCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (card.id === 'verification') setActiveTab('verification');
                    else if (card.id === 'profiles') setActiveTab('profiles');
                    else if (card.id === 'applications') setActiveTab('applications');
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {card.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{card.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{card.desc}</div>
                    </div>
                  </div>
                  <FaChevronRight style={{ color: '#cbd5e1', fontSize: '12px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Grid: Recent Applications & Verification Overview Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Left Box: Recent Teacher Applications Table */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Teacher Applications</h3>
                <button onClick={() => setActiveTab('applications')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>APPLICANT</th>
                    <th style={{ padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>SUBJECTS</th>
                    <th style={{ padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>EXPERIENCE</th>
                    <th style={{ padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>STATUS</th>
                    <th style={{ padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>APPLIED ON</th>
                    <th style={{ padding: '10px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: app.avatarBg, color: '#fff', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {app.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{app.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 0', fontSize: '12.5px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{app.subjects}</span>
                      </td>
                      <td style={{ padding: '14px 0', fontSize: '12.5px', color: '#475569' }}>{app.exp}</td>
                      <td style={{ padding: '14px 0' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                          background: app.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: app.status === 'Pending' ? '#d97706' : '#2563eb'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 0', fontSize: '12px', color: '#94a3b8' }}>{app.time}</td>
                      <td style={{ padding: '14px 0', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                          <FaEye />
                        </button>
                        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                          <FaEllipsisV />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button onClick={() => setActiveTab('applications')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  View All Applications →
                </button>
              </div>
            </div>

            {/* Right Box: Verification Overview Donut Chart Representation */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Verification Overview</h3>
                  <button onClick={() => setActiveTab('verification')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>

                {/* Donut Chart representation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={{
                    width: '160px', height: '160px', borderRadius: '50%',
                    background: 'conic-gradient(#3b82f6 0% 68%, #a855f7 68% 80%, #f97316 80% 89%, #ef4444 89% 95%, #cbd5e1 95% 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{verifiedTeachers}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Total Verified</span>
                    </div>
                  </div>
                </div>

                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                      <span style={{ color: '#475569' }}>Verified</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{verifiedTeachers} ({totalTeachers > 0 ? Math.round(verifiedTeachers / totalTeachers * 100) : 0}%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }}></span>
                      <span style={{ color: '#475569' }}>In Review</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{pendingApplications} ({totalTeachers > 0 ? Math.round(pendingApplications / totalTeachers * 100) : 0}%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span>
                      <span style={{ color: '#475569' }}>Documents Pending</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>18 (9%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                      <span style={{ color: '#475569' }}>Rejected</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>12 (6%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                      <span style={{ color: '#475569' }}>Expired</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>14 (5%)</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button onClick={() => setActiveTab('verification')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  View Verification Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? 'Edit Teacher Profile' : 'Add New Teacher'}
      >
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>Full Name</label>
            <input type="text" className="glass-input" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>Email Address</label>
            <input type="email" className="glass-input" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>Subjects (comma separated)</label>
            <input type="text" className="glass-input" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="glass-button secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="glass-button primary" onClick={handleSubmit} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>Save Teacher</button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
};

export default Teachers;

