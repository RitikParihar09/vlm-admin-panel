import React, { useState, useEffect } from 'react';
import { 
  adminGetPendingVerifications, 
  adminSubmitVerifyDecision, 
  adminGetAgoraToken 
} from '../api/adminAuthApi';
import ActionModal from '../components/ActionModal';
import { 
  FaUserCheck, 
  FaSearch, 
  FaVideo, 
  FaFileAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExternalLinkAlt,
  FaRedo,
  FaGraduationCap,
  FaUniversity,
  FaIdCard
} from 'react-icons/fa';

const TeacherVerification = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selected teacher details modal
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeDocUrl, setActiveDocUrl] = useState('');
  const [activeDocTitle, setActiveDocTitle] = useState('');

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('approve'); // 'approve' | 'reject'
  const [selectedClasses, setSelectedClasses] = useState(['9', '10', '11', '12']);
  const [rejectionReason, setRejectionReason] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Agora Call Modal
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callData, setCallData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);

  const availableClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await adminGetPendingVerifications();
      if (res && res.success && Array.isArray(res.data)) {
        setQueue(res.data);
      } else if (Array.isArray(res)) {
        setQueue(res);
      } else {
        setQueue([]);
      }
    } catch (err) {
      console.error('Failed to load pending verifications:', err);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openDocViewer = (url, title) => {
    setActiveDocUrl(url);
    setActiveDocTitle(title);
    setDocModalOpen(true);
  };

  const openDecisionModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setDecisionType(type);
    setSelectedClasses(teacher.classes && teacher.classes.length > 0 ? teacher.classes : ['9', '10', '11', '12']);
    setRejectionReason('');
    setDecisionNotes('');
    setDecisionModalOpen(true);
  };

  const handleClassToggle = (cls) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmitDecision = async () => {
    if (!selectedTeacher) return;
    
    setSubmitting(true);
    try {
      const interview = selectedTeacher.interviews && selectedTeacher.interviews.length > 0
        ? selectedTeacher.interviews[0]
        : null;

      const payload = {
        teacherId: selectedTeacher._id || selectedTeacher.id,
        decision: decisionType,
        approvedClasses: decisionType === 'approve' ? selectedClasses : [],
        rejectionReason: decisionType === 'reject' ? rejectionReason : '',
        interviewId: interview ? interview._id : undefined,
        notes: decisionNotes
      };

      const res = await adminSubmitVerifyDecision(payload);
      if (res && res.success) {
        alert(res.message || `Teacher application ${decisionType}d successfully.`);
        setDecisionModalOpen(false);
        fetchQueue();
      } else {
        alert(res?.message || 'Failed to submit verification decision.');
      }
    } catch (err) {
      console.error('Error submitting verification decision:', err);
      alert('An error occurred while saving decision: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinAgoraCall = async (teacher) => {
    setSelectedTeacher(teacher);
    const interview = teacher.interviews && teacher.interviews.length > 0 ? teacher.interviews[0] : null;
    
    if (!interview || !interview._id) {
      alert('No scheduled interview session found for this teacher.');
      return;
    }

    setLoadingToken(true);
    try {
      const res = await adminGetAgoraToken(interview._id);
      if (res && res.success && res.data) {
        setCallData(res.data);
        setCallModalOpen(true);
      } else {
        alert(res?.message || 'Unable to generate Agora token.');
      }
    } catch (err) {
      console.error('Agora Token Error:', err);
      alert('Failed to get Agora call token: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoadingToken(false);
    }
  };

  const filteredQueue = queue.filter(item => {
    const fullName = `${item.firstName || ''} ${item.lastName || ''} ${item.name || ''}`.toLowerCase();
    const email = (item.email || '').toLowerCase();
    const teacherId = (item.vlmTeacherId || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery = !searchQuery || fullName.includes(query) || email.includes(query) || teacherId.includes(query);
    const matchesStatus = statusFilter === 'all' || (item.applicationStatus || 'pending_interview') === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="view-page-container">
      {/* Header Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <FaUserCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: 'var(--text-main, #f8fafc)' }}>
                  Teacher Verification Portal
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>
                  Review submitted documents, conduct live Agora video interviews, and grant grade tier authorizations.
                </p>
              </div>
            </div>
          </div>

          <button 
            className="glass-button size-md secondary"
            onClick={fetchQueue}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaRedo className={loading ? 'spin' : ''} /> Refresh Queue
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="glass-input"
              placeholder="Search by name, email or VLM Teacher ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <select
            className="glass-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending_interview">Pending Interview</option>
            <option value="pending_documents">Pending Documents</option>
            <option value="under_review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12.5px', fontWeight: '600' }}>TEACHER</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12.5px', fontWeight: '600' }}>REQUESTED CLASSES</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12.5px', fontWeight: '600' }}>DOCUMENTS</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12.5px', fontWeight: '600' }}>INTERVIEW SESSION</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12.5px', fontWeight: '600' }}>BANK DETAILS</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12.5px', fontWeight: '600', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading pending verification requests...
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No pending teacher verification applications found.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((tr) => {
                  const fullName = tr.fullName || tr.name || `${tr.firstName || ''} ${tr.lastName || ''}`.trim() || 'Unknown Teacher';
                  const interview = tr.interviews && tr.interviews.length > 0 ? tr.interviews[0] : null;

                  return (
                    <tr 
                      key={tr._id || tr.id}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}
                    >
                      {/* Teacher Profile */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '700', color: '#fff', fontSize: '15px'
                          }}>
                            {fullName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '14px' }}>{fullName}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{tr.email}</div>
                            <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px', fontWeight: '500' }}>
                              ID: {tr.vlmTeacherId || 'TCH-NEW'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Requested Classes */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(tr.classes || ['9', '10']).map(cls => (
                            <span key={cls} style={{
                              padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                              background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                              Class {cls}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Documents */}
                      <td style={{ padding: '16px 20px' }}>
                        {tr.documents && tr.documents.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {tr.documents.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => openDocViewer(doc.url, doc.name || doc.type)}
                                className="glass-button size-xs"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', fontSize: '11.5px' }}
                              >
                                <FaFileAlt color="#38bdf8" />
                                {doc.name || doc.type}
                                <FaExternalLinkAlt size={9} style={{ opacity: 0.7 }} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>No docs uploaded</span>
                        )}
                      </td>

                      {/* Interview Session */}
                      <td style={{ padding: '16px 20px' }}>
                        {interview ? (
                          <div>
                            <div style={{ fontSize: '12.5px', color: '#e2e8f0', fontWeight: '500' }}>
                              {new Date(interview.scheduledAt).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </div>
                            <div style={{ fontSize: '11px', color: interview.status === 'scheduled' ? '#eab308' : '#22c55e', marginTop: '2px' }}>
                              Status: {interview.status}
                            </div>
                            <button
                              onClick={() => handleJoinAgoraCall(tr)}
                              disabled={loadingToken}
                              className="glass-button size-xs primary"
                              style={{ marginTop: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                            >
                              <FaVideo size={10} /> Join Agora Call
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Not Scheduled</span>
                        )}
                      </td>

                      {/* Bank Details */}
                      <td style={{ padding: '16px 20px' }}>
                        {tr.bankDetails ? (
                          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                            <div style={{ fontWeight: '500' }}>{tr.bankDetails.bankName || 'Bank'}</div>
                            <div style={{ color: '#94a3b8', fontSize: '11px' }}>A/C: {tr.bankDetails.accountNumber}</div>
                            <div style={{ color: '#94a3b8', fontSize: '11px' }}>IFSC: {tr.bankDetails.ifsc}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Pending Bank Details</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openDecisionModal(tr, 'approve')}
                            className="glass-button size-sm"
                            style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(tr, 'reject')}
                            className="glass-button size-sm"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <ActionModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title={`Inspect Document: ${activeDocTitle}`}
      >
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Document Preview URL:</span>
            <a 
              href={activeDocUrl} 
              target="_blank" 
              rel="noreferrer"
              className="glass-button size-xs primary"
              style={{ textDecoration: 'none' }}
            >
              Open Original <FaExternalLinkAlt size={10} />
            </a>
          </div>

          <div style={{ width: '100%', height: '450px', borderRadius: '8px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeDocUrl?.endsWith('.pdf') ? (
              <iframe src={activeDocUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document PDF" />
            ) : activeDocUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={activeDocUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : (
              <img src={activeDocUrl} alt="Doc preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </div>
        </div>
      </ActionModal>

      {/* Decision Modal (Approve / Reject) */}
      <ActionModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title={decisionType === 'approve' ? 'Approve Teacher & Assign Grade Tiers' : 'Reject Teacher Application'}
      >
        <div style={{ padding: '16px' }}>
          {selectedTeacher && (
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', color: '#f8fafc' }}>
                {selectedTeacher.firstName} {selectedTeacher.lastName} ({selectedTeacher.vlmTeacherId})
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{selectedTeacher.email}</div>
            </div>
          )}

          {decisionType === 'approve' ? (
            <>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px' }}>
                Select Authorized Grade Levels / Classes:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {availableClasses.map(cls => {
                  const isChecked = selectedClasses.includes(cls);
                  return (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => handleClassToggle(cls)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: isChecked ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isChecked ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.02)',
                        color: isChecked ? '#a5b4fc' : '#94a3b8',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Class {cls}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13.5px', fontWeight: '600', marginBottom: '6px' }}>
                Rejection Reason:
              </label>
              <textarea
                className="glass-input"
                rows="3"
                placeholder="Specify reason for application rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13.5px', fontWeight: '600', marginBottom: '6px' }}>
              Internal Verification Notes:
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Verified degree certificate and interviewed via Agora call."
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="glass-button secondary" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </button>
            <button 
              className={`glass-button ${decisionType === 'approve' ? 'primary' : 'danger'}`}
              onClick={handleSubmitDecision}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : decisionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </ActionModal>

      {/* Agora Video Interview Call Modal */}
      <ActionModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title="Live Agora Interview Session"
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          {callData && (
            <div>
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#34d399', fontSize: '16px' }}>Agora RTC Interview Credentials Generated</h3>
                <div style={{ fontSize: '13px', color: '#cbd5e1', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Channel Name:</strong> <code>{callData.channelName}</code></div>
                  <div><strong>Agora App ID:</strong> <code>{callData.appId}</code></div>
                  <div><strong>Admin User ID:</strong> <code>{callData.uid}</code></div>
                </div>
              </div>

              <div style={{ height: '300px', borderRadius: '12px', background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <FaVideo size={48} color="#10b981" />
                <div style={{ color: '#f8fafc', fontWeight: '600' }}>Live Call Session Ready</div>
                <div style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '380px' }}>
                  Agora RTC connection configured for 1-on-1 interview with candidate.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                <button className="glass-button secondary" onClick={() => setCallModalOpen(false)}>
                  Close Portal
                </button>
                <button 
                  className="glass-button primary" 
                  onClick={() => {
                    alert(`Joined channel ${callData.channelName}. Use your Agora Web SDK caller or external web client to start streaming.`);
                  }}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                >
                  Start Stream
                </button>
              </div>
            </div>
          )}
        </div>
      </ActionModal>
    </div>
  );
};

export default TeacherVerification;
