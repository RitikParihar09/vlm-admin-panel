import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell, FaPaperPlane, FaUsers, FaChartBar, FaTrash, FaRedo, FaFilter, FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, FaTimesCircle, FaBook, FaCreditCard, FaTrophy, FaStar, FaBolt, FaExclamationTriangle, FaBullhorn, FaHistory, FaEye, FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import {
  getNotificationTypes,
  getNotificationStats,
  getAdminNotifications,
  sendAdminNotification,
  previewNotificationCount,
  deleteBroadcast,
} from '../api/adminAuthApi.js';

// ── Type config ────────────────────────────────────────────────────────────────
const TYPE_META = {
  daily_practice_reminder:  { icon: <FaBook />,               color: '#6366f1', bg: 'rgba(99,102,241,0.1)',   label: 'Daily Practice'       },
  trial_expiry_alert:       { icon: <FaExclamationTriangle />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Trial Expiry'         },
  subscription_offer:       { icon: <FaStar />,               color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  label: 'Subscription Offer'   },
  scholarship_announcement: { icon: <FaTrophy />,             color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  label: 'Scholarship'          },
  leaderboard_rank_update:  { icon: <FaChartBar />,           color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   label: 'Leaderboard'          },
  auto_payment_reminder:    { icon: <FaCreditCard />,         color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Auto Payment'         },
  subscription_renewal:     { icon: <FaRedo />,               color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Renewal'              },
  mcq_reminder:             { icon: <FaBook />,               color: '#f97316', bg: 'rgba(249,115,22,0.1)',  label: 'MCQ Reminder'         },
  teacher_join_alert:       { icon: <FaChalkboardTeacher />,  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Teacher Join'         },
  spin_unlock_alert:        { icon: <FaBolt />,               color: '#eab308', bg: 'rgba(234,179,8,0.1)',   label: 'Spin Unlock'          },
  admin_announcement:       { icon: <FaBullhorn />,           color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  label: 'Announcement'         },
  custom:                   { icon: <FaBell />,               color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: 'Custom'               },
};

const CLASS_OPTIONS  = ['', '6', '7', '8', '9', '10', '11', '12'];
const BOARD_OPTIONS  = ['', 'CBSE', 'ICSE', 'State Board'];
const SUB_OPTIONS    = ['', 'trial', 'active', 'expired', 'free'];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="glass-panel" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: 18, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

// ── Type Badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const m = TYPE_META[type] || TYPE_META.custom;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: m.bg, color: m.color,
      fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 11 }}>{m.icon}</span>{m.label}
    </span>
  );
};

// ── Read Rate Ring ────────────────────────────────────────────────────────────
const RateRing = ({ pct = 0, color = '#6366f1', size = 64 }) => {
  const r = 22; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 28 28)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Communication = () => {
  const [tab, setTab]                 = useState('compose');
  const [types, setTypes]             = useState([]);
  const [stats, setStats]             = useState(null);
  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [showAdvanced, setShowAdv]    = useState(false);
  const [sending, setSending]         = useState(false);
  const [sendResult, setSendResult]   = useState(null); // {ok, msg}
  const [prevCount, setPrevCount]     = useState(null);
  const [prevLoading, setPrevLoading] = useState(false);
  const sendResultTimer               = useRef(null);

  const [form, setForm] = useState({
    type: 'admin_announcement',
    title: '', message: '',
    audience: 'all',
    deepLink: '', imageUrl: '',
    filters: { class: '', board: '', subscriptionStatus: '', state: '' },
  });

  const patchForm  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const patchFilter = (k, v) => setForm(f => ({ ...f, filters: { ...f.filters, [k]: v } }));

  // ── Loaders ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    getNotificationTypes().then(r => setTypes(r.data || [])).catch(() => {});
    loadStats();
  }, []);

  const loadStats = async () => {
    try { const r = await getNotificationStats(); setStats(r.data); } catch {}
  };

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try { const r = await getAdminNotifications({ limit: 60 }); setHistory(r.data || []); }
    catch { setHistory([]); } finally { setHistLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
    if (tab === 'stats')   loadStats();
  }, [tab]);

  // ── Preview count ────────────────────────────────────────────────────────────
  const refreshPreview = useCallback(async () => {
    setPrevLoading(true);
    try {
      const r = await previewNotificationCount({ audience: form.audience, filters: form.filters });
      setPrevCount(r.count);
    } catch { setPrevCount(null); } finally { setPrevLoading(false); }
  }, [form.audience, form.filters.class, form.filters.board, form.filters.subscriptionStatus, form.filters.state]);

  useEffect(() => { refreshPreview(); }, [refreshPreview]);

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true); setSendResult(null);
    try {
      const r = await sendAdminNotification({ ...form, filters: form.audience === 'students' ? form.filters : {} });
      setSendResult({ ok: true, msg: r.message });
      patchForm('title', ''); patchForm('message', '');
      loadStats();
    } catch (err) {
      setSendResult({ ok: false, msg: err?.response?.data?.message || 'Failed to send notification' });
    } finally {
      setSending(false);
      clearTimeout(sendResultTimer.current);
      sendResultTimer.current = setTimeout(() => setSendResult(null), 6000);
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this broadcast and all its notifications?')) return;
    try { await deleteBroadcast(id); loadHistory(); } catch {}
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const selectedType = TYPE_META[form.type] || TYPE_META.custom;

  return (
    <div className="view-container" style={{ maxWidth: 1160, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
              <FaBell />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Notification Center</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>
                Firebase FCM — push + in-app notifications to students, teachers & parents
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.25)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            FCM Live
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Sent"      value={stats?.totalSent?.toLocaleString()}  icon={<FaPaperPlane />} color="#6366f1" />
        <StatCard label="Total Read"      value={stats?.totalRead?.toLocaleString()}  icon={<FaEye />}        color="#10b981" />
        <StatCard label="Read Rate"       value={`${stats?.readRate ?? 0}%`}           icon={<FaChartBar />}   color="#f59e0b" />
        <StatCard label="Push Delivered"  value={stats?.totalFcm?.toLocaleString()}   icon={<FaBell />}       color="#3b82f6" />
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: 0, background: '#f1f5f9', borderRadius: 12, padding: 5, width: 'fit-content', marginBottom: 24, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
        {[
          ['compose', <FaPaperPlane />, 'Compose'],
          ['history', <FaHistory />,    'History'],
          ['stats',   <FaChartBar />,   'Analytics'],
        ].map(([v, icon, label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 22px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.84rem', fontFamily: 'var(--font-family)',
            background: tab === v ? '#ffffff' : 'transparent',
            color: tab === v ? '#6366f1' : 'var(--text-secondary)',
            boxShadow: tab === v ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 12 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* ──────────────────── COMPOSE TAB ──────────────────── */}
      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

          {/* Left: Form Card */}
          <div className="glass-panel" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--panel-border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: selectedType.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedType.color, fontSize: 15 }}>
                {selectedType.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Compose Notification</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>Choose type → write content → pick audience → send</p>
              </div>
            </div>

            <form onSubmit={handleSend}>

              {/* Type chips */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Notification Type
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {types.length > 0 ? types.map(t => {
                    const m = TYPE_META[t.value] || TYPE_META.custom;
                    const sel = form.type === t.value;
                    return (
                      <button key={t.value} type="button" onClick={() => patchForm('type', t.value)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 13px', borderRadius: 20,
                        border: `1.5px solid ${sel ? m.color : 'var(--panel-border)'}`,
                        background: sel ? m.bg : 'transparent',
                        color: sel ? m.color : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '0.77rem', fontWeight: 600,
                        fontFamily: 'var(--font-family)',
                        transition: 'all 0.15s',
                      }}>
                        <span style={{ fontSize: 11 }}>{m.icon}</span>
                        {t.icon} {m.label}
                      </button>
                    );
                  }) : (
                    Object.entries(TYPE_META).slice(0, 10).map(([key, m]) => {
                      const sel = form.type === key;
                      return (
                        <button key={key} type="button" onClick={() => patchForm('type', key)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 13px', borderRadius: 20,
                          border: `1.5px solid ${sel ? m.color : 'var(--panel-border)'}`,
                          background: sel ? m.bg : 'transparent',
                          color: sel ? m.color : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '0.77rem', fontWeight: 600,
                          fontFamily: 'var(--font-family)', transition: 'all 0.15s',
                        }}>
                          <span style={{ fontSize: 11 }}>{m.icon}</span>{m.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label>Title *</label>
                <input className="glass-input" value={form.title} onChange={e => patchForm('title', e.target.value)}
                  placeholder="e.g. Your trial ends tomorrow — upgrade now!" required
                  style={{ width: '100%', fontSize: '0.9rem' }} />
              </div>

              {/* Message */}
              <div className="form-group">
                <label>Message *</label>
                <textarea className="glass-input" value={form.message} onChange={e => patchForm('message', e.target.value)}
                  placeholder="Write a clear, engaging message for your users…" required rows={4}
                  style={{ width: '100%', resize: 'vertical', minHeight: 100, fontSize: '0.9rem', lineHeight: 1.5 }} />
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>
                  {form.message.length} chars
                </div>
              </div>

              {/* Audience */}
              <div className="form-group">
                <label>Target Audience</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { v: 'all',      icon: <FaUsers />,           label: 'All Users',      sub: 'Everyone' },
                    { v: 'students', icon: <FaUserGraduate />,    label: 'Students',       sub: 'Learners only' },
                    { v: 'teachers', icon: <FaChalkboardTeacher />, label: 'Teachers',     sub: 'Educators only' },
                  ].map(({ v, icon, label, sub }) => {
                    const sel = form.audience === v;
                    return (
                      <button key={v} type="button" onClick={() => patchForm('audience', v)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                        padding: '14px 10px', borderRadius: 12,
                        border: `2px solid ${sel ? '#6366f1' : 'var(--panel-border)'}`,
                        background: sel ? 'rgba(99,102,241,0.06)' : '#ffffff',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: sel ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                      }}>
                        <span style={{ fontSize: 18, color: sel ? '#6366f1' : '#94a3b8' }}>{icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: sel ? '#6366f1' : 'var(--text-primary)' }}>{label}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Filters */}
              {form.audience === 'students' && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                    <FaFilter style={{ color: '#94a3b8', fontSize: 12 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Filters</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(optional — leave blank for all students)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Class</label>
                      <select className="glass-input" value={form.filters.class} onChange={e => patchFilter('class', e.target.value)} style={{ width: '100%' }}>
                        {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c || 'All Classes'}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Board</label>
                      <select className="glass-input" value={form.filters.board} onChange={e => patchFilter('board', e.target.value)} style={{ width: '100%' }}>
                        {BOARD_OPTIONS.map(b => <option key={b} value={b}>{b || 'All Boards'}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Subscription</label>
                      <select className="glass-input" value={form.filters.subscriptionStatus} onChange={e => patchFilter('subscriptionStatus', e.target.value)} style={{ width: '100%' }}>
                        {SUB_OPTIONS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced toggle */}
              <button type="button" onClick={() => setShowAdv(!showAdvanced)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                cursor: 'pointer', color: '#6366f1', fontSize: '0.8rem', fontWeight: 600,
                fontFamily: 'var(--font-family)', padding: 0, marginBottom: 16,
              }}>
                {showAdvanced ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                Advanced Options
              </button>

              {showAdvanced && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid var(--panel-border)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Deep Link (URL Path)</label>
                    <input className="glass-input" value={form.deepLink} onChange={e => patchForm('deepLink', e.target.value)}
                      placeholder="/leaderboard" style={{ width: '100%' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Image URL (thumbnail)</label>
                    <input className="glass-input" value={form.imageUrl} onChange={e => patchForm('imageUrl', e.target.value)}
                      placeholder="https://…/image.png" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Send result banner */}
              {sendResult && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                  background: sendResult.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${sendResult.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  color: sendResult.ok ? '#059669' : '#dc2626',
                  fontSize: '0.84rem', fontWeight: 600,
                }}>
                  {sendResult.ok ? <FaCheckCircle /> : <FaTimesCircle />}
                  {sendResult.msg}
                </div>
              )}

              {/* Submit button */}
              <button type="submit" disabled={sending || !form.title.trim() || !form.message.trim()} className="glass-button" style={{
                width: '100%', justifyContent: 'center',
                background: sending || !form.title.trim() || !form.message.trim()
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                cursor: sending || !form.title.trim() || !form.message.trim() ? 'not-allowed' : 'pointer',
                color: '#fff', fontSize: '0.92rem', padding: '13px 24px',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}>
                <FaPaperPlane />
                {sending ? 'Sending…' : `Send to ${prevCount != null ? prevCount.toLocaleString() + ' users' : 'recipients'}`}
              </button>
            </form>
          </div>

          {/* Right: Preview + Recipient Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Recipient counter */}
            <div className="glass-panel" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Estimated Recipients
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
                {prevLoading ? '…' : prevCount != null ? prevCount.toLocaleString() : '—'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 14 }}>
                {form.audience === 'all' ? 'All active users' : form.audience === 'students' ? 'Matching students' : 'All teachers'}
              </div>
              <button onClick={refreshPreview} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#6366f1', fontSize: '0.78rem', fontWeight: 600,
                padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'var(--font-family)',
              }}>
                <FaRedo style={{ fontSize: 11 }} /> Refresh
              </button>
            </div>

            {/* Push notification preview */}
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', padding: 22, boxShadow: '0 10px 30px rgba(30,27,75,0.3)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
                Push Notification Preview
              </div>

              {/* Phone frame */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                {/* Status bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, opacity: 0.5 }}>
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>9:41</span>
                  <span style={{ fontSize: 10, color: '#fff' }}>●●●</span>
                </div>

                {/* Notification card */}
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: selectedType.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13,
                    }}>{selectedType.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>VLM Academy</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>now</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                    {form.title || 'Your notification title here'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>
                    {form.message || 'Your notification message will appear here. Keep it concise and engaging!'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div style={{ background: 'rgba(99,102,241,0.05)', borderRadius: 14, padding: 16, border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <FaInfoCircle style={{ color: '#6366f1', fontSize: 13 }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366f1' }}>Notification Tips</span>
              </div>
              {[
                'Keep titles under 50 characters for best display',
                'Use emojis to increase open rates by up to 25%',
                'Schedule at 7–9 PM for highest engagement',
                'Student filters narrow FCM delivery precisely',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 10, borderLeft: '2px solid rgba(99,102,241,0.3)', lineHeight: 1.5 }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── HISTORY TAB ──────────────────── */}
      {tab === 'history' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Broadcast History</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: 3 }}>All admin-sent notification campaigns</p>
            </div>
            <button onClick={loadHistory} className="glass-button secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              <FaRedo style={{ fontSize: 12 }} /> Refresh
            </button>
          </div>

          {histLoading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FaRedo style={{ fontSize: 28, marginBottom: 12, opacity: 0.3, display: 'block', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '0.88rem' }}>Loading broadcast history…</div>
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: '70px 24px', textAlign: 'center' }}>
              <FaBell style={{ fontSize: 44, color: '#e2e8f0', marginBottom: 14, display: 'block', margin: '0 auto 14px' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No notifications sent yet</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Go to Compose tab to send your first notification</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Recipients</th>
                    <th>Read / Total</th>
                    <th>FCM Push</th>
                    <th>Sent At</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => (
                    <tr key={row._id}>
                      <td><TypeBadge type={row.type} /></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.title}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.95rem' }}>
                          {row.totalRecipients?.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <RateRing pct={row.totalRecipients > 0 ? Math.round((row.readCount / row.totalRecipients) * 100) : 0} size={44} color="#10b981" />
                          <div>
                            <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.82rem' }}>{row.readCount}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>of {row.totalRecipients}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-student" style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' }}>
                          {row.fcmSent?.toLocaleString() ?? 0}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {row.sentAt ? new Date(row.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {row.sentAt ? new Date(row.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(row._id)} style={{
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          color: '#dc2626', borderRadius: 8, padding: '6px 10px',
                          cursor: 'pointer', fontSize: 13,
                        }}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────── ANALYTICS TAB ──────────────────── */}
      {tab === 'stats' && (
        <div>
          {stats ? (
            <>
              {/* Summary cards */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                <StatCard label="Total Sent"     value={stats.totalSent?.toLocaleString()}  icon={<FaPaperPlane />} color="#6366f1" />
                <StatCard label="Total Read"     value={stats.totalRead?.toLocaleString()}  icon={<FaEye />}        color="#10b981" />
                <StatCard label="Read Rate"      value={`${stats.readRate ?? 0}%`}           icon={<FaChartBar />}   color="#f59e0b" />
                <StatCard label="Push Delivered" value={stats.totalFcm?.toLocaleString()}   icon={<FaBell />}       color="#3b82f6" />
              </div>

              {/* By type breakdown */}
              {stats.byType?.length > 0 && (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--panel-border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Performance by Type</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>Notification volume breakdown across all campaigns</p>
                  </div>
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {stats.byType.map(item => {
                      const m = TYPE_META[item._id] || TYPE_META.custom;
                      const pct = stats.totalSent ? Math.round((item.count / stats.totalSent) * 100) : 0;
                      return (
                        <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 190, flexShrink: 0 }}><TypeBadge type={item._id} /></div>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', width: pct + '%', background: m.color,
                                borderRadius: 6, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                                boxShadow: `0 0 8px ${m.color}60`,
                              }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100, justifyContent: 'flex-end' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.count?.toLocaleString()}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 7px', borderRadius: 10 }}>{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FaChartBar style={{ fontSize: 44, opacity: 0.2, display: 'block', margin: '0 auto 16px' }} />
              <div style={{ fontWeight: 600 }}>Loading analytics…</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Communication;
