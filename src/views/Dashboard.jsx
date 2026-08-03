import React from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaRupeeSign,
  FaVideo,
  FaRobot,
  FaChevronRight,
  FaClock,
  FaCheckCircle,
  FaPlusCircle,
  FaFolderPlus,
  FaBell,
  FaCreditCard,
  FaLifeRing,
  FaChartBar,
  FaCog
} from 'react-icons/fa';

const Dashboard = ({ setActiveView }) => {
  const {
    students = [],
    teachers = [],
    parents = [],
    liveClasses = [],
    doubts = [],
    dashboard,
    dashboardLiveStats,
    dashboardSystemHealth,
    dashboardRecentActivities,
    withdrawals = [],
    resources = []
  } = useAdmin();

  const handleViewClick = (viewId) => {
    if (typeof setActiveView === 'function') {
      setActiveView(viewId);
    }
  };

  const dynamicStudents = students.length;
  const dynamicTeachers = teachers.length;
  const dynamicParents = parents.length;

  const stats = [
    {
      title: 'Total Students',
      value: (dashboard?.totalStudents ?? dynamicStudents).toLocaleString(),
      sub: 'Registered Students',
      icon: <FaUserGraduate />,
      theme: 'purple',
      view: 'students'
    },
    {
      title: 'Total Teachers',
      value: (dashboard?.totalTeachers ?? dynamicTeachers).toLocaleString(),
      sub: 'Registered Teachers',
      icon: <FaChalkboardTeacher />,
      theme: 'green',
      view: 'teachers'
    },
    {
      title: 'Total Parents',
      value: (dashboard?.totalParents ?? dynamicParents).toLocaleString(),
      sub: 'Linked Parents',
      icon: <FaUsers />,
      theme: 'blue',
      view: 'parents'
    },
    {
      title: 'Total Revenue',
      value: dashboard?.totalRevenue !== undefined ? `₹ ${dashboard.totalRevenue.toLocaleString('en-IN')}` : '₹ 0',
      sub: 'All-time Earnings',
      icon: <FaRupeeSign />,
      theme: 'orange',
      view: 'subscription'
    },
    {
      title: 'Live Sessions',
      value: (dashboardLiveStats?.activeSessions ?? 0).toLocaleString(),
      change: (dashboardLiveStats?.activeSessions ?? 0) > 0 ? 'Live Now' : '',
      sub: 'Active sessions',
      icon: <FaVideo />,
      theme: 'magenta',
      view: 'liveclasses'
    },
    {
      title: 'Total Sessions',
      value: (dashboard?.totalSessions ?? 0).toLocaleString(),
      sub: 'Completed Doubts & Classes',
      icon: <FaRobot />,
      theme: 'dark-blue',
      view: 'aimanager'
    }
  ];

  const approvals = [
    { name: 'Teacher Applications', count: dashboard?.pendingTeachers ?? 0, view: 'teachers' },
    { name: 'Live Doubt Sessions', count: dashboard?.pendingDoubts ?? 0, view: 'doubts' },
    { name: 'Open Support Tickets', count: dashboard?.openTickets ?? 0, view: 'support' },
    { name: 'Pending Withdrawals', count: withdrawals.filter(w => w.status === 'pending').length, view: 'subscription' }
  ].filter(app => app.count > 0);

  const getGrowthData = (items) => {
    const dates = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 5);
      dates.push(d);
    }
    const sorted = [...items].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    return dates.map(date => {
      return sorted.filter(item => !item.createdAt || new Date(item.createdAt) <= date).length;
    });
  };

  const studentGrowth = getGrowthData(students);
  const teacherGrowth = getGrowthData(teachers);
  const parentGrowth = getGrowthData(parents);

  const maxVal = Math.max(
    ...studentGrowth,
    ...teacherGrowth,
    ...parentGrowth,
    10
  );

  const getY = (v) => 180 - (v / maxVal) * 140;

  const getPathD = (growthArray) => {
    return growthArray.map((val, idx) => {
      const x = 50 + idx * 75;
      const y = getY(val);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const studentPath = getPathD(studentGrowth);
  const teacherPath = getPathD(teacherGrowth);
  const parentPath = getPathD(parentGrowth);

  const yAxisTicks = [];
  for (let i = 0; i <= 5; i++) {
    yAxisTicks.push(Math.round((maxVal / 5) * i));
  }

  const xLabels = [];
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i * 5);
    xLabels.push(`${d.getDate()} ${monthNames[d.getMonth()]}`);
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const activities = [];
  if (dashboardRecentActivities) {
    const { recentDoubts = [], recentSessions = [], recentTickets = [] } = dashboardRecentActivities;
    
    recentDoubts.forEach(d => {
      activities.push({
        title: 'New Doubt Request',
        desc: `${d.studentId?.fullName || 'Student'} requested help in ${d.subject || 'Doubt'}`,
        time: new Date(d.createdAt),
        icon: '❓'
      });
    });

    recentSessions.forEach(s => {
      activities.push({
        title: 'Session Started',
        desc: `${s.studentId?.fullName || 'Student'} joined a session (${s.sessionType || 'Session'})`,
        time: new Date(s.createdAt),
        icon: '💻'
      });
    });

    recentTickets.forEach(t => {
      activities.push({
        title: 'Support Ticket',
        desc: `${t.userId?.name || 'User'} opened ticket: ${t.subject || t.description || 'Support request'}`,
        time: new Date(t.createdAt),
        icon: '🎫'
      });
    });

    activities.sort((a, b) => b.time - a.time);
  }


  const subjectCounts = {};
  teachers.forEach(t => {
    (t.subjects || []).forEach(sub => {
      const sName = sub.trim();
      if (sName) {
        subjectCounts[sName] = (subjectCounts[sName] || 0) + 1;
      }
    });
  });
  const totalSubjectsCount = Object.values(subjectCounts).reduce((a, b) => a + b, 0) || 1;
  const topSubjects = Object.keys(subjectCounts)
    .map(name => ({
      name,
      count: subjectCounts[name],
      percentage: ((subjectCounts[name] / totalSubjectsCount) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let currentOffset = 100;
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
  const donutSlices = topSubjects.map((sub, idx) => {
    const pct = parseFloat(sub.percentage);
    const strokeDashoffset = currentOffset;
    currentOffset -= pct;
    return {
      ...sub,
      color: colors[idx % colors.length],
      strokeDasharray: `${pct} ${100 - pct}`,
      strokeDashoffset
    };
  });

  const totalRewardPoints = students.reduce((acc, st) => acc + (st.rewardPoints || 0), 0);
  const totalAiCredits = students.reduce((acc, st) => acc + (st.wallet?.aiCredits ?? 0), 0);
  const totalWalletBalance = students.reduce((acc, st) => acc + (st.wallet?.balance ?? 0), 0);

  const quickAccessActions = [
    { label: 'Add Student', icon: <FaPlusCircle />, view: 'students', color: '#8b5cf6' },
    { label: 'Add Teacher', icon: <FaPlusCircle />, view: 'teachers', color: '#10b981' },
    { label: 'Create Live Class', icon: <FaVideo />, view: 'liveclasses', color: '#f59e0b' },
    { label: 'Create Test', icon: <FaFolderPlus />, view: 'mcqtasks', color: '#ef4444' },
    { label: 'Upload Content', icon: <FaFolderPlus />, view: 'studymaterial', color: '#3b82f6' },
    { label: 'Send Notification', icon: <FaBell />, view: 'communication', color: '#f97316' },
    { label: 'Manage Subscriptions', icon: <FaCreditCard />, view: 'subscription', color: '#d946ef' },
    { label: 'Support Tickets', icon: <FaLifeRing />, view: 'support', color: '#06b6d4' },
    { label: 'Reports', icon: <FaChartBar />, view: 'analytics', color: '#ec4899' },
    { label: 'System Settings', icon: <FaCog />, view: 'sysconfig', color: '#64748b' }
  ];

  return (
    <div className="dashboard-container-new">
      {/* Row 1: Statistics Cards */}
      <div className="stats-row-new">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`stat-card-new ${stat.theme}`}
            onClick={() => handleViewClick(stat.view)}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">{stat.title}</span>
              <div className="stat-card-icon">{stat.icon}</div>
            </div>
            <span className="stat-card-val">{stat.value}</span>
            <div className="stat-card-meta">
              <span className="stat-change">{stat.change}</span>
              <span className="stat-sub">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Charts and Live Data */}
      <div className="middle-row-new">
        {/* Platform Overview Line Chart */}
        <div className="glass-panel main-chart-card">
          <div className="card-header-new">
            <h3>Platform Overview</h3>
            <select className="chart-dropdown">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          
          <div className="chart-wrapper-new">
            {/* SVG Interactive Multi-Line Chart */}
            <svg viewBox="0 0 550 200" className="dashboard-svg-chart">
              {/* Horizontal grid lines */}
              {yAxisTicks.map((val, idx) => {
                const y = getY(val);
                return (
                  <g key={idx}>
                    <line x1="45" y1={y} x2="520" y2={y} stroke="#f1f5f9" strokeDasharray="3,3" />
                    <text x="35" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{val}</text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {xLabels.map((label, idx) => {
                const x = 50 + idx * 75;
                return (
                  <text key={idx} x={x} y="195" textAnchor="middle" fontSize="10" fill="#94a3b8">{label}</text>
                );
              })}

              {/* Purple Line (Students) */}
              <path 
                d={studentPath} 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              {/* Green Line (Teachers) */}
              <path 
                d={teacherPath} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              {/* Blue Line (Parents) */}
              <path 
                d={parentPath} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Nodes dots on hover */}
              <circle cx="500" cy={getY(studentGrowth[6])} r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="500" cy={getY(teacherGrowth[6])} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <circle cx="500" cy={getY(parentGrowth[6])} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
          
          <div className="chart-legends">
            <span className="legend-new"><span className="dot-new purple"></span> Students</span>
            <span className="legend-new"><span className="dot-new green"></span> Teachers</span>
            <span className="legend-new"><span className="dot-new blue"></span> Parents</span>
          </div>
        </div>

        {/* Live Activity Log */}
        <div className="glass-panel activity-card-new">
          <div className="card-header-new">
            <h3>Live Activity</h3>
            <button className="text-link-new" onClick={() => handleViewClick('security')}>View All</button>
          </div>
          <div className="activities-list-new">
            {activities.length > 0 ? (
              activities.slice(0, 10).map((act, idx) => (
                <div key={idx} className="activity-row-new">
                  <div className="act-icon-wrapper-new">{act.icon}</div>
                  <div className="act-info-new">
                    <h4 className="act-title-new">{act.title}</h4>
                    <span className="act-desc-new">{act.desc}</span>
                  </div>
                  <span className="act-time-new">
                    <FaClock style={{ marginRight: '4px', fontSize: '10px' }} />
                    {formatTimeAgo(act.time)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '12px' }}>
                No recent activity recorded
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel approvals-card-new">
          <div className="card-header-new">
            <h3>Pending Approvals</h3>
            <button className="text-link-new" onClick={() => handleViewClick('sysconfig')}>View All</button>
          </div>
          <div className="approvals-list-new">
            {approvals.length > 0 ? (
              approvals.map((app, idx) => (
                <div 
                  key={idx} 
                  className="approval-row-new"
                  onClick={() => handleViewClick(app.view)}
                >
                  <div className="app-left">
                    <span className="app-check-icon"><FaCheckCircle /></span>
                    <span className="app-name-new">{app.name}</span>
                  </div>
                  <div className="app-right">
                    <span className="app-badge-new">{app.count}</span>
                    <FaChevronRight className="chevron-link" />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '12px' }}>
                All caught up! No pending approvals
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Revenue, Subject Donut, AI Usage, and System Health */}
      <div className="third-row-new">
        {/* Revenue Overview */}
        <div className="glass-panel rev-chart-card">
          <div className="card-header-new">
            <h3>Revenue Overview</h3>
            <span className="rev-gray-text" style={{ fontSize: '11px', fontWeight: '500' }}>Platform earnings</span>
          </div>
          <div className="rev-overview-val">
            <span className="rev-bold-val">
              {dashboard?.totalRevenue !== undefined ? `₹ ${dashboard.totalRevenue.toLocaleString('en-IN')}` : '₹ 0'}
            </span>
            <span className="rev-pct-pos"><span className="rev-gray-text">Gross wallet deposits</span></span>
          </div>
          <div className="chart-wrapper-new rev">
            <svg viewBox="0 0 350 110" className="dashboard-svg-chart">
              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d946ef" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M 20 80 Q 75 40 120 70 T 220 50 T 330 30" 
                fill="none" 
                stroke="#d946ef" 
                strokeWidth="3"
              />
              <path 
                d="M 20 80 Q 75 40 120 70 T 220 50 T 330 30 L 330 110 L 20 110 Z" 
                fill="url(#purpleGlow)" 
                stroke="none"
              />
              <circle cx="330" cy="30" r="4.5" fill="#d946ef" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Top Subjects Donut Chart */}
        <div className="glass-panel subjects-chart-card">
          <div className="card-header-new">
            <h3>Top Subjects</h3>
            <span className="rev-gray-text" style={{ fontSize: '11px', fontWeight: '500' }}>By teacher count</span>
          </div>
          
          <div className="donut-grid-new">
            {/* SVG Donut Chart */}
            <div className="donut-relative-container">
              <svg width="120" height="120" viewBox="0 0 36 36" className="donut-svg-new">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                {donutSlices.map((slice, idx) => (
                  <circle 
                    key={idx} 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="transparent" 
                    stroke={slice.color} 
                    strokeWidth="3.2" 
                    strokeDasharray={slice.strokeDasharray} 
                    strokeDashoffset={slice.strokeDashoffset} 
                  />
                ))}
              </svg>
              <div className="donut-center-info">
                <span className="donut-tot-count">{teachers.length}</span>
                <span className="donut-tot-lbl">Teachers</span>
              </div>
            </div>

            <div className="donut-legend-col">
              {donutSlices.length > 0 ? (
                donutSlices.map((slice, idx) => (
                  <div key={idx} className="sub-legend-row">
                    <span className="legend-dot-sub" style={{ backgroundColor: slice.color }}></span>
                    {slice.name} ({slice.percentage}%)
                  </div>
                ))
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>No subjects defined</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Usage Overview -> Student Wallet & Credits */}
        <div className="glass-panel ai-overview-card">
          <div className="card-header-new">
            <h3>Credits & Rewards</h3>
            <span className="rev-gray-text" style={{ fontSize: '11px', fontWeight: '500' }}>Across all students</span>
          </div>
          <div className="ai-metrics-list">
            <div className="ai-metric-item">
              <span className="aim-lbl">Total AI Credits</span>
              <div className="aim-val-row">
                <span className="aim-val">{totalAiCredits.toLocaleString()}</span>
                <span className="aim-trend-pos" style={{ color: '#8b5cf6' }}>Remaining</span>
              </div>
            </div>
            <div className="ai-metric-item">
              <span className="aim-lbl">Reward Points</span>
              <div className="aim-val-row">
                <span className="aim-val">{totalRewardPoints.toLocaleString()}</span>
                <span className="aim-trend-pos" style={{ color: '#10b981' }}>Earned</span>
              </div>
            </div>
            <div className="ai-metric-item">
              <span className="aim-lbl">Total Wallet Balance</span>
              <div className="aim-val-row">
                <span className="aim-val">₹ {totalWalletBalance.toLocaleString('en-IN')}</span>
                <span className="aim-trend-pos" style={{ color: '#3b82f6' }}>INR</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel sys-health-card">
          <h3>System Health</h3>
          <div className="health-metrics-list">
            <div className="health-metric-row">
              <span className="hm-lbl">Server Status</span>
              <span className={`hm-badge-status online`} style={{ backgroundColor: dashboardSystemHealth ? '#d1fae5' : '#fee2e2', color: dashboardSystemHealth ? '#065f46' : '#991b1b' }}>
                {dashboardSystemHealth ? 'Operational' : 'Offline'}
              </span>
            </div>
            <div className="health-metric-row">
              <span className="hm-lbl">Database</span>
              <span className={`hm-badge-status online`} style={{ backgroundColor: dashboardSystemHealth ? '#d1fae5' : '#fee2e2', color: dashboardSystemHealth ? '#065f46' : '#991b1b' }}>
                {dashboardSystemHealth ? 'Operational' : 'Offline'}
              </span>
            </div>
            <div className="health-metric-row">
              <span className="hm-lbl">Active Sessions</span>
              <span className="hm-sessions-val">{(dashboardLiveStats?.activeSessions ?? 0).toLocaleString()} <span className="hm-sub-text">Live Now</span></span>
            </div>
            <div className="health-metric-row flex-col">
              <div className="hm-progress-header">
                <span className="hm-lbl">Heap Memory Usage</span>
                <span className="hm-lbl val">
                  {dashboardSystemHealth ? `${dashboardSystemHealth.memory?.heapUsedMB} MB / ${dashboardSystemHealth.memory?.heapTotalMB} MB` : '0 MB'}
                </span>
              </div>
              <div className="hm-progress-bar">
                <div 
                  className="hm-progress-fill" 
                  style={{ 
                    width: dashboardSystemHealth 
                      ? `${Math.min(100, Math.round((parseFloat(dashboardSystemHealth.memory?.heapUsedMB) / parseFloat(dashboardSystemHealth.memory?.heapTotalMB)) * 100))}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>
            <div className="health-metric-row">
              <span className="hm-lbl">Node Version</span>
              <span className="hm-sessions-val" style={{ fontSize: '11px', color: '#64748b' }}>{dashboardSystemHealth?.node ?? 'N/A'}</span>
            </div>
          </div>
          <div className="health-overall-status" style={{ backgroundColor: dashboardSystemHealth ? '#ecfdf5' : '#fef2f2', borderColor: dashboardSystemHealth ? '#d1fae5' : '#fee2e2', color: dashboardSystemHealth ? '#065f46' : '#991b1b' }}>
            <span className="green-checkmark">{dashboardSystemHealth ? '✔' : '✖'}</span> 
            {dashboardSystemHealth ? 'All Systems Operational' : 'Connection issues detected'}
          </div>
        </div>
      </div>

      {/* Row 4: Quick Access Action shortcuts */}
      <div className="glass-panel quick-access-panel-new">
        <h3>Quick Access</h3>
        <div className="quick-actions-row">
          {quickAccessActions.map((act, idx) => (
            <button 
              key={idx} 
              className="quick-action-btn-new"
              onClick={() => handleViewClick(act.view)}
            >
              <div className="qa-icon-wrapper-new" style={{ color: act.color, backgroundColor: `${act.color}15` }}>
                {act.icon}
              </div>
              <span className="qa-label-new">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-container-new {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        /* Stats Row */
        .stats-row-new {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 15px;
        }

        @media (max-width: 1400px) {
          .stats-row-new {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .stats-row-new {
            grid-template-columns: 1fr;
          }
        }

        .stat-card-new {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.015);
        }

        .stat-card-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
          border-color: #cbd5e1;
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .stat-card-title {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .stat-card-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        /* Color configurations for stat icons */
        .stat-card-new.purple .stat-card-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .stat-card-new.green .stat-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-card-new.blue .stat-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .stat-card-new.orange .stat-card-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stat-card-new.magenta .stat-card-icon { background: rgba(217, 70, 239, 0.1); color: #d946ef; }
        .stat-card-new.dark-blue .stat-card-icon { background: rgba(30, 41, 59, 0.06); color: #1e293b; }

        .stat-card-val {
          font-size: 22px;
          font-weight: 750;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .stat-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }

        .stat-change {
          font-weight: 700;
          color: #10b981;
        }
        .stat-card-new.magenta .stat-change {
          color: #d946ef;
        }

        .stat-sub {
          color: #94a3b8;
        }

        /* Middle Row layout */
        .middle-row-new {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .middle-row-new {
            grid-template-columns: 1fr;
          }
        }

        .main-chart-card, .activity-card-new, .approvals-card-new {
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .card-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-header-new h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .chart-dropdown {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          outline: none;
          cursor: pointer;
        }

        .chart-wrapper-new {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }

        .dashboard-svg-chart {
          width: 100%;
          max-height: 180px;
        }

        .chart-legends {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
          font-size: 11px;
          font-weight: 550;
        }

        .legend-new {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
        }

        .dot-new {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot-new.purple { background: #8b5cf6; }
        .dot-new.green { background: #10b981; }
        .dot-new.blue { background: #3b82f6; }

        .text-link-new {
          background: transparent;
          border: none;
          color: #3b82f6;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
        .text-link-new:hover {
          text-decoration: underline;
        }

        /* Activity Logs list styling */
        .activities-list-new {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          max-height: 190px;
        }

        .activity-row-new {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }
        .activity-row-new:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .act-icon-wrapper-new {
          width: 28px;
          height: 28px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .act-info-new {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .act-title-new {
          font-size: 12.5px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .act-desc-new {
          font-size: 11px;
          color: #64748b;
        }

        .act-time-new {
          font-size: 10px;
          color: #94a3b8;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }

        /* Pending Approvals */
        .approvals-list-new {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 190px;
        }

        .approval-row-new {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .approval-row-new:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .app-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .app-check-icon {
          color: #a855f7;
          display: flex;
          align-items: center;
          font-size: 12px;
        }

        .app-name-new {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .app-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .app-badge-new {
          background: #fee2e2;
          color: #ef4444;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .chevron-link {
          font-size: 10px;
          color: #94a3b8;
        }

        /* Third row layouts */
        .third-row-new {
          display: grid;
          grid-template-columns: 1.2fr 1.3fr 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .third-row-new {
            grid-template-columns: 1fr;
          }
        }

        .rev-chart-card, .subjects-chart-card, .ai-overview-card, .sys-health-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .rev-chart-card h3, .subjects-chart-card h3, .ai-overview-card h3, .sys-health-card h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .rev-overview-val {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }

        .rev-bold-val {
          font-size: 20px;
          font-weight: 750;
          color: #0f172a;
        }

        .rev-pct-pos {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          margin-top: 4px;
        }

        .rev-gray-text {
          color: #94a3b8;
          font-weight: 400;
        }

        .chart-wrapper-new.rev {
          margin-top: 15px;
        }

        /* Donut subject details */
        .donut-grid-new {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 12px;
        }

        .donut-relative-container {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .donut-center-info {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .donut-tot-count {
          font-size: 18px;
          font-weight: 750;
          color: #0f172a;
        }

        .donut-tot-lbl {
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
        }

        .donut-legend-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sub-legend-row {
          font-size: 11px;
          font-weight: 550;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot-sub {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-dot-sub.blue { background: #3b82f6; }
        .legend-dot-sub.purple { background: #8b5cf6; }
        .legend-dot-sub.cyan { background: #06b6d4; }
        .legend-dot-sub.green { background: #10b981; }
        .legend-dot-sub.orange { background: #f59e0b; }

        /* AI usage metrics list */
        .ai-metrics-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }

        .ai-metric-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .aim-lbl {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .aim-val-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .aim-val {
          font-size: 15px;
          font-weight: 750;
          color: #0f172a;
        }

        .aim-trend-pos {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
        }

        /* Health Metrics */
        .health-metrics-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
          flex-grow: 1;
        }

        .health-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 550;
          color: #475569;
        }

        .health-metric-row.flex-col {
          flex-direction: column;
          align-items: stretch;
          gap: 4px;
        }

        .hm-lbl {
          font-size: 11px;
          color: #64748b;
        }

        .hm-badge-status {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .hm-badge-status.online {
          background: #d1fae5;
          color: #065f46;
        }

        .hm-sessions-val {
          font-weight: 700;
          color: #0f172a;
        }
        .hm-sessions-val.green {
          color: #10b981;
        }
        .hm-sub-text {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
        }

        .hm-progress-header {
          display: flex;
          justify-content: space-between;
        }

        .hm-progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .hm-progress-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 3px;
        }

        .health-overall-status {
          margin-top: 14px;
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 8px;
          padding: 8px;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: #065f46;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .green-checkmark {
          font-size: 12px;
          color: #10b981;
        }

        /* Quick Access Action Grid */
        .quick-access-panel-new {
          padding: 20px;
        }

        .quick-access-panel-new h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 16px;
        }

        .quick-actions-row {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 12px;
        }

        @media (max-width: 1200px) {
          .quick-actions-row {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        @media (max-width: 600px) {
          .quick-actions-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .quick-action-btn-new {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          padding: 8px 4px;
          border-radius: 8px;
        }

        .quick-action-btn-new:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .qa-icon-wrapper-new {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s;
        }

        .quick-action-btn-new:hover .qa-icon-wrapper-new {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .qa-label-new {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
