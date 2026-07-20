import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCrown, 
  FaChevronRight,
  FaSearch,
  FaCheck,
  FaTimes,
  FaRegCheckCircle
} from 'react-icons/fa';

const SubscriptionBilling = ({ activeView, setActiveView }) => {
  const { plans, createPlan, updatePlan, deletePlan, students, getTrials } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [trials, setTrials] = useState([]);
  const [trialsLoading, setTrialsLoading] = useState(false);
  const [trialFilter, setTrialFilter] = useState('all');

  const viewIdToTab = {
    'subscription': 'Subscription Plans',
    'sub-plans': 'Subscription Plans',
    'sub-trials': 'Trial Management',
    'sub-upgrades': 'Plan Upgrade',
    'sub-list': 'Subscriptions',
    'sub-renewals': 'Renewals',
    'sub-expiring': 'Expiring Soon',
    'sub-billing': 'Billing History',
    'sub-gst': 'GST Invoices'
  };

  const activeTab = viewIdToTab[activeView] || 'Subscription Plans';

  const setActiveTab = (tab) => {
    const tabToViewId = {
      'Subscription Plans': 'sub-plans',
      'Trial Management': 'sub-trials',
      'Plan Upgrade': 'sub-upgrades',
      'Subscriptions': 'sub-list',
      'Renewals': 'sub-renewals',
      'Expiring Soon': 'sub-expiring',
      'Billing History': 'sub-billing',
      'GST Invoices': 'sub-gst'
    };
    if (setActiveView) {
      setActiveView(tabToViewId[tab] || 'subscription');
    }
  };
  
  React.useEffect(() => {
    if (activeTab === 'Trial Management' && getTrials) {
      const loadTrials = async () => {
        setTrialsLoading(true);
        const data = await getTrials(trialFilter);
        if (Array.isArray(data)) {
          setTrials(data);
        } else {
          setTrials([]);
        }
        setTrialsLoading(false);
      };
      loadTrials();
    }
  }, [activeTab, trialFilter, getTrials]);
  
  // Right side panel state
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form fields state
  const [name, setName] = useState('');
  const [className, setClassName] = useState('10');
  const [classFrom, setClassFrom] = useState('1');
  const [classTo, setClassTo] = useState('8');
  const [duration, setDuration] = useState('monthly');
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [aiCredits, setAiCredits] = useState('');
  const [humanChatCredits, setHumanChatCredits] = useState('');
  const [audioMinutes, setAudioMinutes] = useState('');
  const [videoMinutes, setVideoMinutes] = useState('');
  const [liveClassesPerMonth, setLiveClassesPerMonth] = useState('');
  const [doubtsPerDay, setDoubtsPerDay] = useState('');
  const [subjects, setSubjects] = useState('');
  const [trialDays, setTrialDays] = useState(3);
  const [trialPrice, setTrialPrice] = useState(1);
  const [callRate, setCallRate] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const openAddMode = () => {
    setEditingPlan(null);
    setName('Plan 1 (Class 1 - 8)');
    setClassName('1-8');
    setClassFrom('1');
    setClassTo('8');
    setDuration('monthly');
    setMrp('999');
    setPrice('599');
    setAiCredits('500');
    setHumanChatCredits('50');
    setAudioMinutes('300');
    setVideoMinutes('150');
    setLiveClassesPerMonth('12');
    setDoubtsPerDay('10');
    setSubjects('Maths, Science');
    setTrialDays(3);
    setTrialPrice(1);
    setCallRate(4);
    setIsActive(true);
    setSortOrder(plans.length + 1);
    setIsEditing(true);
  };

  const openEditMode = (plan) => {
    setEditingPlan(plan);
    setName(plan.name || '');
    setClassName(plan.class || '1-8');
    const parts = (plan.class || '1-8').split('-');
    setClassFrom(parts[0] || '1');
    setClassTo(parts[1] || '8');
    setDuration(plan.duration || 'monthly');
    setMrp(plan.mrp || '');
    setPrice(plan.price || '');
    setAiCredits(plan.benefits?.aiCredits || '');
    setHumanChatCredits(plan.benefits?.humanChatCredits || '');
    setAudioMinutes(plan.benefits?.audioMinutes || '');
    setVideoMinutes(plan.benefits?.videoMinutes || '');
    setLiveClassesPerMonth(plan.benefits?.liveClassesPerMonth || '');
    setDoubtsPerDay(plan.benefits?.doubtsPerDay || '');
    setSubjects(Array.isArray(plan.benefits?.subjects) ? plan.benefits.subjects.join(', ') : '');
    setTrialDays(plan.trialDays !== undefined ? plan.trialDays : 3);
    setTrialPrice(plan.trialPrice !== undefined ? plan.trialPrice : 1);
    setCallRate(plan.callRate !== undefined ? plan.callRate : 4);
    setIsActive(plan.isActive !== undefined ? plan.isActive : true);
    setSortOrder(plan.sortOrder || 0);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!name) return alert('Plan name is required');
    const payload = {
      name,
      class: `${classFrom}-${classTo}`,
      duration,
      mrp: Number(mrp) || 0,
      price: Number(price) || 0,
      benefits: {
        aiCredits: Number(aiCredits) || 0,
        humanChatCredits: Number(humanChatCredits) || 0,
        audioMinutes: Number(audioMinutes) || 0,
        videoMinutes: Number(videoMinutes) || 0,
        liveClassesPerMonth: Number(liveClassesPerMonth) || 0,
        doubtsPerDay: Number(doubtsPerDay) || 0,
        subjects: subjects ? subjects.split(',').map(s => s.trim()).filter(Boolean) : []
      },
      trialDays: Number(trialDays) || 0,
      trialPrice: Number(trialPrice) || 0,
      callRate: Number(callRate) || 4,
      isActive,
      sortOrder: Number(sortOrder) || 0
    };

    let success = false;
    if (editingPlan) {
      success = await updatePlan(editingPlan._id, payload);
    } else {
      success = await createPlan(payload);
    }
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePlan(id);
    }
  };

  // Helper metrics calculation
  const totalSubscribers = students.filter(s => s.subscription?.status === 'active').length;
  const trialSubscribers = students.filter(s => s.subscription?.status === 'trial').length;
  const expiredSubscribers = students.filter(s => s.subscription?.status === 'expired').length;

  const expiringIn7DaysCount = students.filter(s => {
    if (s.subscription?.status !== 'active' || !s.subscription?.expiresAt) return false;
    const remaining = new Date(s.subscription.expiresAt).getTime() - Date.now();
    return remaining > 0 && remaining <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalLiveRevenue = students.reduce((acc, st) => {
    if (st.subscription?.status === 'active') {
      const plan = plans.find(p => p._id === (st.subscription?.planId?._id || st.subscription?.planId));
      if (plan && plan.price) {
        return acc + plan.price;
      }
    }
    return acc;
  }, 0);

  const filteredPlans = plans.filter(p => {
    if (!searchQuery) return true;
    return p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.class?.includes(searchQuery);
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Determine active list for table/grid depending on selected sub-tab
  const renderMainTabContent = () => {
    switch (activeTab) {
      case 'Subscription Plans':
      default:
        return (
          <>
            {/* Top Cards Grid */}
            <div className="plans-cards-grid">
              {sortedPlans.slice(0, 3).map((plan, index) => {
                const activeSubsCount = students.filter(s => s.subscription?.planId === plan._id || s.subscription?.planId?._id === plan._id).length;
                return (
                  <div key={plan._id} className="premium-plan-card">
                    <div className="plan-card-header">
                      <span className={`plan-header-badge color-${index % 3}`}>
                        Class {plan.class}
                      </span>
                    </div>
                    <div className="plan-card-pricing">
                      <span className="price-primary">₹ {plan.price}</span>
                      <span className="price-secondary">/ {plan.duration}</span>
                      <p className="price-description">For Class {plan.class} Students</p>
                    </div>

                    <div className="plan-card-features-list">
                      <div className="feature-item"><FaCheck className="check-icon" /> Live Doubt Support</div>
                      <div className="feature-item"><FaCheck className="check-icon" /> AI Tutor Access ({plan.benefits?.aiCredits || 0} Credits)</div>
                      <div className="feature-item"><FaCheck className="check-icon" /> Study Material ({plan.benefits?.subjects?.join(', ') || 'All'})</div>
                      <div className="feature-item"><FaCheck className="check-icon" /> MCQ & Daily Tasks</div>
                      <div className="feature-item"><FaCheck className="check-icon" /> Performance Analytics</div>
                    </div>

                    <div className="plan-card-footer-stats">
                      <div>
                        <span className="stat-label">Active Subs</span>
                        <span className="stat-value">{activeSubsCount}</span>
                      </div>
                      <div>
                        <span className="stat-label">Est. Revenue</span>
                        <span className="stat-value">₹ {(activeSubsCount * plan.price).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="plan-card-action-row">
                      <label className="active-switch-label">
                        <input 
                          type="checkbox" 
                          checked={plan.isActive}
                          onChange={async (e) => {
                            await updatePlan(plan._id, { isActive: e.target.checked });
                          }}
                        />
                        <span className="switch-slider"></span>
                        <span className="status-text">{plan.isActive ? 'Active' : 'Inactive'}</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="dots-more-btn" onClick={() => openEditMode(plan)}>Edit</button>
                        <button className="dots-more-btn delete-btn-card" onClick={() => handleDelete(plan._id, plan.name)} style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );

      case 'Subscriptions':
      case 'Expiring Soon':
        const targetStatus = activeTab === 'Subscriptions' ? 'active' : 'active';
        const listStudents = students.filter(s => {
          if (activeTab === 'Expiring Soon') {
            if (s.subscription?.status !== 'active' || !s.subscription?.expiresAt) return false;
            const remaining = new Date(s.subscription.expiresAt).getTime() - Date.now();
            return remaining > 0 && remaining < 7 * 24 * 60 * 60 * 1000;
          }
          return s.subscription?.status === targetStatus;
        });

        return (
          <div className="glass-panel table-panel-billing">
            <h3 className="section-panel-title">{activeTab} Details</h3>
            <table className="billing-portal-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Class</th>
                  <th>Plan Tier</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No students found in this category.
                    </td>
                  </tr>
                ) : (
                  listStudents.map((st) => {
                    const matchedPlan = plans.find(p => p._id === (st.subscription?.planId?._id || st.subscription?.planId));
                    return (
                      <tr key={st._id}>
                        <td className="bold-text">{st.name}</td>
                        <td>{st.vlmStudentId || 'N/A'}</td>
                        <td>{st.grade}</td>
                        <td className="accent-text">{matchedPlan ? matchedPlan.name : 'Custom Plan'}</td>
                        <td>{st.subscription?.expiresAt ? new Date(st.subscription.expiresAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`status-pill-billing ${st.subscription?.status || 'free'}`}>
                            {st.subscription?.status || 'free'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        );

      case 'Trial Management':
        return (
          <div className="glass-panel table-panel-billing">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="section-panel-title" style={{ margin: 0 }}>Trial Users</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Filter:</span>
                <select 
                  value={trialFilter} 
                  onChange={(e) => setTrialFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#334155',
                    background: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Trial Signups</option>
                  <option value="trial">Active Trials Only</option>
                  <option value="expired">Expired Trials Only</option>
                </select>
              </div>
            </div>
            
            <div className="table-responsive-billing">
              <table className="billing-portal-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Class</th>
                    <th>Trial Plan</th>
                    <th>Ends At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trialsLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading trial user database...
                      </td>
                    </tr>
                  ) : trials.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No trial signups found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    trials.map((tr) => (
                      <tr key={tr.studentId}>
                        <td className="bold-text">{tr.fullName}</td>
                        <td>{tr.email}</td>
                        <td>{tr.mobile}</td>
                        <td>Class {tr.class || 'N/A'}</td>
                        <td className="accent-text">{tr.plan?.name || 'Standard Trial'} (₹{tr.plan?.trialPrice || 1})</td>
                        <td>{tr.trialEndsAt ? new Date(tr.trialEndsAt).toLocaleString() : 'N/A'}</td>
                        <td>
                          <span className={`status-pill-billing ${tr.isExpired ? 'inactive' : 'active'}`}>
                            {tr.isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Plan Upgrade':
      case 'Renewals':
      case 'Billing History':
      case 'GST Invoices':
      case 'Payment History':
      case 'Refunds':
      case 'Coupons':
        return (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.08)', padding: '24px', borderRadius: '50%', marginBottom: '20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{activeTab} Portal</h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '380px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
              This tab is currently under development to integrate real-time gateway webhooks. Watermarks indicate features currently in preview mode.
            </p>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(79, 70, 229, 0.08)', padding: '6px 16px', borderRadius: '20px' }}>
              Coming Soon
            </span>
          </div>
        );
    }
  };

  const tabs = [
    'Subscription Plans',
    'Trial Management',
    'Plan Upgrade',
    'Subscriptions',
    'Renewals',
    'Expiring Soon',
    'Billing History',
    'GST Invoices',
    'Payment History',
    'Refunds',
    'Coupons'
  ];

  const underDevTabs = [
    'Plan Upgrade',
    'Renewals',
    'Billing History',
    'GST Invoices',
    'Payment History',
    'Refunds',
    'Coupons'
  ];

  return (
    <div className="subscription-billing-view">
      {underDevTabs.includes(activeTab) && (
        <div className="under-dev-watermark">
          Under Dev
        </div>
      )}
      {/* Actions & Search Bar */}
      <div className="billing-top-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="search-bar-align" style={{ margin: 0 }}>
          <FaSearch className="align-search-icon" />
          <input 
            type="text" 
            placeholder="Search plans..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-header"
          />
        </div>
        {activeTab === 'Subscription Plans' && (
          <button className="add-plan-primary-action-btn" onClick={openAddMode}>
            <FaPlus style={{ marginRight: '8px' }} /> Add New Plan
          </button>
        )}
      </div>

      {/* 6 metrics cards grid */}
      <div className="billing-metrics-container">
        <div className="metric-box-sub">
          <div className="box-header-wrap">
            <span className="box-title">Total Revenue</span>
          </div>
          <span className="box-value">₹ {totalLiveRevenue.toLocaleString()}</span>
        </div>

        <div className="metric-box-sub">
          <div className="box-header-wrap">
            <span className="box-title">Active Subscriptions</span>
          </div>
          <span className="box-value">{totalSubscribers}</span>
        </div>

        <div className="metric-box-sub">
          <div className="box-header-wrap">
            <span className="box-title">Trial Users</span>
          </div>
          <span className="box-value">{trialSubscribers}</span>
        </div>

        <div className="metric-box-sub">
          <div className="box-header-wrap">
            <span className="box-title">Expiring in 7 Days</span>
          </div>
          <span className="box-value">{expiringIn7DaysCount}</span>
        </div>

        <div className="metric-box-sub">
          <div className="box-header-wrap">
            <span className="box-title">Expired Subscriptions</span>
          </div>
          <span className="box-value">{expiredSubscribers}</span>
        </div>

        <div className="metric-box-sub">
          <div className="box-header-wrap">
            <span className="box-title">Refunds (This Month)</span>
          </div>
          <span className="box-value">₹ 0</span>
        </div>
      </div>

      {/* Layout Content */}
      <div className="subscription-portal-layout">
        <div className="main-portal-content" style={{ width: '100%' }}>
          {renderMainTabContent()}
        </div>
      </div>

      {/* Centered Popup Edit Modal */}
      {isEditing && (
        <div className="premium-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="premium-modal-content animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <h3>{editingPlan ? 'Edit Plan Details' : 'Configure New Plan'}</h3>
              <button className="close-panel-btn" onClick={() => setIsEditing(false)}><FaTimes /></button>
            </div>
            
            <div className="side-panel-body">
              <div className="form-group-side">
                <label>Plan Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Plan Name" 
                  className="side-input"
                />
              </div>

              <div className="form-group-side">
                <label>Description</label>
                <input 
                  type="text" 
                  placeholder="Short description for target users" 
                  className="side-input"
                />
              </div>

              <div className="form-inline-row">
                <div className="form-group-side" style={{ flex: 1 }}>
                  <label>Original Price (MRP)</label>
                  <input 
                    type="number" 
                    value={mrp} 
                    onChange={(e) => setMrp(e.target.value)} 
                    placeholder="999" 
                    className="side-input"
                  />
                </div>
                <div className="form-group-side" style={{ flex: 1 }}>
                  <label>Selling Price (INR)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="599" 
                    className="side-input"
                  />
                </div>
              </div>

              <div className="form-inline-row" style={{ marginTop: '14px' }}>
                <div className="form-group-side" style={{ flex: 1 }}>
                  <label>Duration</label>
                  <select 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    className="side-input"
                  >
                    <option value="monthly">1 Month</option>
                    <option value="quarterly">3 Months</option>
                    <option value="yearly">1 Year</option>
                  </select>
                </div>
                <div className="form-group-side" style={{ flex: 1 }}>
                  <label>Target Classes</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max="12" 
                      value={classFrom} 
                      onChange={(e) => setClassFrom(e.target.value)} 
                      placeholder="1" 
                      className="side-input" 
                      style={{ textAlign: 'center' }} 
                    />
                    <span style={{ color: '#64748b' }}>to</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="12" 
                      value={classTo} 
                      onChange={(e) => setClassTo(e.target.value)} 
                      placeholder="8" 
                      className="side-input" 
                      style={{ textAlign: 'center' }} 
                    />
                  </div>
                </div>
              </div>

              <div className="form-inline-row" style={{ marginTop: '14px' }}>
                <div className="form-group-side" style={{ flex: 1 }}>
                  <label>Trial Period (Days)</label>
                  <input 
                    type="number" 
                    value={trialDays} 
                    onChange={(e) => setTrialDays(e.target.value)} 
                    placeholder="3" 
                    className="side-input"
                  />
                </div>
                <div className="form-group-side" style={{ flex: 1 }}>
                  <label>Trial Price (INR)</label>
                  <input 
                    type="number" 
                    value={trialPrice} 
                    onChange={(e) => setTrialPrice(e.target.value)} 
                    placeholder="1" 
                    className="side-input"
                  />
                </div>
              </div>

              {/* Allowances list details */}
              <div className="features-list-header">
                <span>Plan Features</span>
              </div>
              <div className="features-inputs-container">
                <div className="feat-inline-field">
                  <span>AI Credits:</span>
                  <input type="number" value={aiCredits} onChange={(e) => setAiCredits(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Tutor Chats:</span>
                  <input type="number" value={humanChatCredits} onChange={(e) => setHumanChatCredits(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Doubt Limit/day:</span>
                  <input type="number" value={doubtsPerDay} onChange={(e) => setDoubtsPerDay(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Live Classes:</span>
                  <input type="number" value={liveClassesPerMonth} onChange={(e) => setLiveClassesPerMonth(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Audio Call Mins:</span>
                  <input type="number" value={audioMinutes} onChange={(e) => setAudioMinutes(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Video Call Mins:</span>
                  <input type="number" value={videoMinutes} onChange={(e) => setVideoMinutes(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Call Rate (₹/min):</span>
                  <input type="number" value={callRate} onChange={(e) => setCallRate(e.target.value)} className="side-input mini" />
                </div>
                <div className="feat-inline-field">
                  <span>Subjects:</span>
                  <input type="text" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Maths, Science" className="side-input mini text-input" />
                </div>
              </div>

              {/* Status and priority */}
              <div className="form-inline-row" style={{ marginTop: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label className="checkbox-container-premium">
                    <input 
                      type="checkbox" 
                      checked={isActive} 
                      onChange={(e) => setIsActive(e.target.checked)} 
                    />
                    <span className="checkmark-premium"></span>
                    <span className="checkbox-text">Active</span>
                  </label>
                </div>
                <div className="form-group-side" style={{ width: '120px' }}>
                  <label>Priority Rank</label>
                  <input 
                    type="number" 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)} 
                    className="side-input"
                  />
                </div>
              </div>

              <div className="side-panel-footer">
                <button className="cancel-side-panel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="save-side-panel-btn" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .subscription-billing-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #1e293b;
        }

        /* Subheader alignment */
        .sub-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .view-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .view-subtitle {
          font-size: 13px;
          color: #64748b;
        }

        .search-bar-align {
          position: relative;
          width: 300px;
        }

        .align-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
        }

        .search-input-header {
          width: 100%;
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          padding: 10px 16px 10px 40px;
          font-size: 13px;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input-header:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        /* Tabs list */
        .billing-tabs-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 2px;
        }

        .tabs-list-wrapper {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tabs-list-wrapper::-webkit-scrollbar {
          display: none;
        }

        .nav-tab-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .nav-tab-btn:hover {
          color: #0f172a;
          background: rgba(0, 0, 0, 0.03);
        }

        .nav-tab-btn.active {
          color: #4f46e5;
          background: rgba(79, 70, 229, 0.08);
        }

        .add-plan-primary-action-btn {
          background: #4f46e5;
          border: none;
          color: #fff;
          font-weight: 750;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .add-plan-primary-action-btn:hover {
          background: #4338ca;
          transform: translateY(-1px);
        }

        /* 6 metrics card design */
        .billing-metrics-container {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .billing-metrics-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .billing-metrics-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .metric-box-sub {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .box-title {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .box-value {
          font-size: 20px;
          font-weight: 750;
          color: #0f172a;
        }

        .box-trend {
          font-size: 11px;
          font-weight: 600;
        }

        .box-trend.positive {
          color: #10b981;
        }

        .box-trend.negative {
          color: #ef4444;
        }

        .trend-desc {
          color: #64748b;
          font-weight: 400;
        }

        /* Plan Cards Grid */
        .plans-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) {
          .plans-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .premium-plan-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .plan-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plan-header-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .plan-header-badge.color-0 {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .plan-header-badge.color-1 {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .plan-header-badge.color-2 {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .plan-card-pricing {
          margin-top: 4px;
        }

        .price-primary {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
        }

        .price-secondary {
          font-size: 13px;
          color: #64748b;
          margin-left: 4px;
        }

        .price-description {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .plan-card-features-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 10px 0;
        }

        .feature-item {
          font-size: 12px;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .check-icon {
          color: #10b981;
          font-size: 11px;
        }

        .plan-card-footer-stats {
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 12px;
        }

        .stat-label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }

        .stat-value {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .plan-card-action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 10px;
        }

        .active-switch-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .active-switch-label input {
          display: none;
        }

        .switch-slider {
          width: 32px;
          height: 18px;
          background: #cbd5e1;
          border-radius: 10px;
          position: relative;
          transition: all 0.2s ease;
        }

        .switch-slider::before {
          content: '';
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          left: 2px;
          top: 2px;
          transition: all 0.2s ease;
        }

        .active-switch-label input:checked + .switch-slider {
          background: #10b981;
        }

        .active-switch-label input:checked + .switch-slider::before {
          left: 16px;
        }

        .status-text {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .dots-more-btn {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dots-more-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* Split screen layout */
        .subscription-portal-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .main-portal-content {
          flex: 1;
          min-width: 0;
        }

        .table-panel-billing {
          padding: 20px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .section-panel-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
        }

        /* Table CSS */
        .billing-portal-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .billing-portal-table th {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .billing-portal-table td {
          font-size: 13px;
          color: #334155;
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .billing-portal-table tr:hover td {
          background: #f8fafc;
        }

        .bold-text {
          font-weight: 600;
          color: #0f172a;
        }

        .accent-text {
          font-weight: 600;
          color: #4f46e5;
        }

        .status-pill-billing {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .status-pill-billing.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-pill-billing.trial {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .status-pill-billing.expired, .status-pill-billing.inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action-tbl-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s ease;
          margin-left: 4px;
        }

        .action-tbl-btn.edit {
          color: #64748b;
        }

        .action-tbl-btn.edit:hover {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .action-tbl-btn.delete {
          color: #ef4444;
        }

        .action-tbl-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* Centered Popup Modal styling */
        .premium-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .premium-modal-content {
          width: 460px;
          max-width: 95%;
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
        }

        .side-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .side-panel-header h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .close-panel-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 14px;
        }

        .close-panel-btn:hover {
          color: #ef4444;
        }

        .form-group-side {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .form-group-side label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .side-input {
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 12px;
          color: #0f172a;
          font-size: 13px;
          outline: none;
          width: 100%;
        }

        .side-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .form-inline-row {
          display: flex;
          gap: 12px;
        }

        .features-list-header {
          font-size: 11px;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-bottom: 10px;
        }

        .features-inputs-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .feat-inline-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #475569;
        }

        .side-input.mini {
          width: 80px;
          padding: 6px 8px;
          text-align: right;
        }

        .side-input.mini.text-input {
          width: 160px;
          text-align: left;
        }

        .side-panel-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          margin-top: 20px;
        }

        .cancel-side-panel-btn {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cancel-side-panel-btn:hover {
          background: #f8fafc;
        }

        .save-side-panel-btn {
          background: #4f46e5;
          border: none;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-side-panel-btn:hover {
          background: #4338ca;
        }

        .animate-zoom-in {
          animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Side Watermark styling */
        .under-dev-watermark {
          position: fixed;
          right: -55px;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 2px;
          padding: 8px 24px;
          border-radius: 8px 8px 0 0;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
          z-index: 9999;
          text-transform: uppercase;
          pointer-events: none;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionBilling;
