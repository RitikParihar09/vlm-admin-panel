import React, { useState, useEffect } from 'react';
import { 
  adminGetPendingVerifications, 
  adminSubmitVerifyDecision, 
  adminGetAgoraToken,
  adminConfirmInterview,
  safeAdminCall
} from '../api/adminAuthApi';
import ActionModal from '../components/ActionModal';
import { useAdmin } from '../context/AdminContext';
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
  FaIdCard,
  FaChevronRight,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';

const renderExperience = (exp) => {
  let totalYears = exp;
  if (exp && typeof exp === 'object') {
    totalYears = exp.totalYears !== undefined ? exp.totalYears : exp.years;
  }
  totalYears = parseFloat(totalYears);
  if (totalYears == null || isNaN(totalYears)) return "-";

  const years = Math.floor(totalYears);
  let months = Math.round((totalYears - years) * 12);

  if (months === 12) {
    return `${years + 1} years`;
  }

  if (years === 0) {
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  if (months === 0) {
    return `${years} ${years === 1 ? "year" : "years"}`;
  }

  return `${years} ${years === 1 ? "year" : "years"} ${months} ${months === 1 ? "month" : "months"}`;
};

const TeacherVerification = ({ preselectedTeacherId }) => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Master-Detail selected teacher and document states
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Form states for inline decisions
  const [decisionType, setDecisionType] = useState('approve'); // 'approve' | 'reject'
  const [selectedClasses, setSelectedClasses] = useState(['9', '10', '11', '12']);
  const [rejectionReason, setRejectionReason] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Access admin context to refresh counts
  const { refreshAll } = useAdmin();

  // Agora Call Modal
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callData, setCallData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);

  const [joinedCall, setJoinedCall] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);
  const agoraClientRef = React.useRef(null);
  const localTracksRef = React.useRef([]);

  const handleStartAgoraStream = async () => {
    if (!callData) return;
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        setRemoteUserJoined(true);
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-left', () => {
        setRemoteUserJoined(false);
      });

      await client.join(callData.appId, callData.channelName, callData.agoraToken, null);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);
      setJoinedCall(true);
    } catch (err) {
      console.error('Failed to join Agora call:', err);
      alert('Agora connection error: ' + err.message);
    }
  };

  const handleStopAgoraStream = async () => {
    localTracksRef.current.forEach(track => {
      track.stop();
      track.close();
    });
    localTracksRef.current = [];
    if (agoraClientRef.current) {
      await agoraClientRef.current.leave().catch(() => {});
    }
    agoraClientRef.current = null;
    setJoinedCall(false);
    setRemoteUserJoined(false);
  };

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

  const filteredQueue = queue.filter(item => {
    const fullName = `${item.firstName || ''} ${item.lastName || ''} ${item.name || ''}`.toLowerCase();
    const email = (item.email || '').toLowerCase();
    const teacherId = (item.vlmTeacherId || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery = !searchQuery || fullName.includes(query) || email.includes(query) || teacherId.includes(query);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending_interview' && ['pending_interview', 'interview_pending', 'interview_scheduled'].includes(item.applicationStatus)) ||
      (item.applicationStatus || 'pending_interview') === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Auto-select first item when filtered queue updates
  useEffect(() => {
    if (filteredQueue.length > 0) {
      if (preselectedTeacherId) {
        const found = filteredQueue.find(t => (t._id || t.id) === preselectedTeacherId);
        if (found) {
          handleSelectTeacher(found);
          return;
        }
      }
      const exists = selectedTeacher && filteredQueue.some(t => (t._id || t.id) === (selectedTeacher._id || selectedTeacher.id));
      if (!exists) {
        handleSelectTeacher(filteredQueue[0]);
      }
    } else {
      setSelectedTeacher(null);
    }
  }, [queue, searchQuery, statusFilter, preselectedTeacherId]);

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setActiveDocIndex(0);
    setDecisionType('approve');
    setSelectedClasses(teacher.classes && teacher.classes.length > 0 ? teacher.classes : ['9', '10', '11', '12']);
    setRejectionReason('');
    setDecisionNotes('');
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
        
        // Remove verified teacher from queue locally to prevent layout flash before refresh
        const updatedQueue = queue.filter(t => (t._id || t.id) !== (selectedTeacher._id || selectedTeacher.id));
        setQueue(updatedQueue);
        if (updatedQueue.length > 0) {
          handleSelectTeacher(updatedQueue[0]);
        } else {
          setSelectedTeacher(null);
        }

        fetchQueue();
        if (typeof refreshAll === 'function') {
          await refreshAll();
        }
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

  const activeDoc = selectedTeacher?.documents && selectedTeacher.documents[activeDocIndex];

  return (
    <div className="view-page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height) - 24px)', gap: '16px', paddingBottom: '16px' }}>
      
      {/* Main Content Workspace Split Pane */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Master Pending List */}
        <div className="glass-panel" style={{ width: '360px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          
          {/* List Search & Filter Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Candidates ({filteredQueue.length})</span>
              <button 
                className="glass-button secondary"
                onClick={fetchQueue}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', height: '28px', borderRadius: '6px' }}
              >
                <FaRedo size={10} className={loading ? 'spin' : ''} /> Refresh
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }} />
              <input
                type="text"
                className="glass-input"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', width: '100%', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
              />
            </div>
            <select
              className="glass-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
            >
              <option value="all">All Verification Statuses</option>
              <option value="pending_interview">Pending Interview</option>
              <option value="pending_documents">Pending Documents</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>

          {/* List Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                Loading verification queue...
              </div>
            ) : filteredQueue.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                No pending teachers found.
              </div>
            ) : (
              filteredQueue.map((tr) => {
                const fullName = tr.fullName || tr.name || `${tr.firstName || ''} ${tr.lastName || ''}`.trim() || 'Unknown Teacher';
                const isSelected = selectedTeacher && (selectedTeacher._id || selectedTeacher.id) === (tr._id || tr.id);
                return (
                  <div
                    key={tr._id || tr.id}
                    onClick={() => handleSelectTeacher(tr)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      margin: '4px 8px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', color: '#fff', fontSize: '13px', flexShrink: 0
                      }}>
                        {fullName.slice(0, 1).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-blue)', marginTop: '2px' }}>
                          {tr.vlmTeacherId || 'TCH-NEW'}
                        </div>
                      </div>
                    </div>
                    <FaChevronRight size={12} style={{ color: isSelected ? 'var(--accent-purple)' : 'var(--text-muted)', opacity: isSelected ? 1 : 0.4 }} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detail Panel Previewer */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {selectedTeacher ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '20px' }}>
              
              {/* Header profile section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', color: '#fff', fontSize: '20px'
                  }}>
                    {(selectedTeacher.fullName || selectedTeacher.firstName || 'T').slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FaEnvelope size={11} /> {selectedTeacher.email}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500', color: 'var(--accent-blue)' }}>
                        <FaIdCard size={11} /> ID: {selectedTeacher.vlmTeacherId || 'TCH-NEW'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTeacher.interviews && selectedTeacher.interviews.length > 0 ? (
                  (() => {
                    const interview = selectedTeacher.interviews[0];
                    const isPending = interview.status === 'pending';
                    return (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: isPending ? 'rgba(245, 158, 11, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                        border: isPending ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                          <div style={{ fontWeight: '600', color: isPending ? '#f59e0b' : 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCalendarAlt size={11} /> {isPending ? 'Interview Requested' : 'Scheduled Interview'}
                          </div>
                          <div style={{ marginTop: '2px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {new Date(interview.scheduledAt).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {isPending ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await adminConfirmInterview(interview._id);
                                if (res && res.success) {
                                  alert("Interview slot confirmed successfully! Notification sent to teacher.");
                                  fetchQueue();
                                } else {
                                  alert(res?.message || "Failed to confirm interview slot.");
                                }
                              } catch (err) {
                                alert("Error confirming interview: " + (err?.response?.data?.message || err.message));
                              }
                            }}
                            className="glass-button"
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '12px',
                              padding: '6px 12px',
                              borderRadius: '8px'
                            }}
                          >
                            Confirm Slot
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinAgoraCall(selectedTeacher)}
                            disabled={loadingToken}
                            className="glass-button"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '12px',
                              padding: '6px 12px',
                              borderRadius: '8px'
                            }}
                          >
                            <FaVideo size={10} style={{ color: '#fff' }} /> Join Call
                          </button>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--panel-border)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    Interview not scheduled
                  </div>
                )}
              </div>

              {/* Grid content containing Document Preview on Left, Metadata & Decision on Right */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1 }}>
                
                {/* Column 1: Document Inline Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaFileAlt color="var(--accent-blue)" /> Candidate Uploaded Documents
                  </div>
                  
                  {/* Document selector Tabs */}
                  {selectedTeacher.documents && selectedTeacher.documents.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedTeacher.documents.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveDocIndex(idx)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '550',
                              border: activeDocIndex === idx ? '1px solid var(--accent-blue)' : '1px solid var(--panel-border)',
                              background: activeDocIndex === idx ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                              color: activeDocIndex === idx ? 'var(--accent-blue)' : 'var(--text-secondary)',
                              transition: 'all 0.2s'
                            }}
                          >
                            {doc.type === 'additional' && doc.name && doc.name !== 'additional' ? doc.name : (docTypeLabels[doc.type] || doc.type || `Document ${idx + 1}`)}
                          </button>
                        ))}
                      </div>

                      {/* Preview screen */}
                      {activeDoc && (
                        <div style={{ flex: 1, minHeight: '380px', background: '#000', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>
                              Preview: {docTypeLabels[activeDoc.type] || activeDoc.type || 'Document'} ({activeDoc.name})
                            </span>
                            <a
                              href={activeDoc.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38bdf8', textDecoration: 'none' }}
                            >
                              Open Original <FaExternalLinkAlt size={9} />
                            </a>
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeDoc.url?.endsWith('.pdf') ? (
                              <iframe src={activeDoc.url} style={{ width: '100%', height: '100%', border: 'none' }} title="Document PDF Preview" />
                            ) : activeDoc.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video src={activeDoc.url} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : (
                              <img src={activeDoc.url} alt="Doc preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ flex: 1, minHeight: '380px', border: '1px dashed var(--panel-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No documents uploaded by this candidate.
                    </div>
                  )}
                </div>

                {/* Column 2: Teacher metadata, bank details, and verification form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Requested classes card */}
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--panel-border)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Requested Classes
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(selectedTeacher.classes || ['9', '10']).map(cls => (
                        <span key={cls} style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-purple)', border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                          Class {cls}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Onboarding Profile Info Card */}
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--panel-border)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaGraduationCap /> Education & Onboarding Details
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedTeacher.qualification ? (
                        <>
                          <div><strong>Highest Qualification:</strong> {selectedTeacher.qualification.highestQualification || 'N/A'}</div>
                          <div><strong>Institute:</strong> {selectedTeacher.qualification.instituteName || 'N/A'} (Passing Year: {selectedTeacher.qualification.passingYear || 'N/A'})</div>
                          {selectedTeacher.qualification.hasBEd && <div><strong>B.Ed Status:</strong> Certified</div>}
                          {selectedTeacher.qualification.teachingCertification && (
                            <div><strong>Certifications:</strong> {selectedTeacher.qualification.teachingCertification}</div>
                          )}
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>No qualification details provided</div>
                      )}
                      
                      <div style={{ borderTop: '1px solid var(--panel-border)', margin: '4px 0' }}></div>
                      
                      {selectedTeacher.experience ? (
                        <>
                          <div><strong>Teaching Experience:</strong> {selectedTeacher.experience.isFresher ? 'Fresher' : renderExperience(selectedTeacher.experience.totalYears)}</div>
                          {selectedTeacher.experience.teachingModes && (
                            <div><strong>Teaching Modes:</strong> {Array.isArray(selectedTeacher.experience.teachingModes) ? selectedTeacher.experience.teachingModes.join(', ') : selectedTeacher.experience.teachingModes}</div>
                          )}
                          {selectedTeacher.experience.summary && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', background: 'rgba(0,0,0,0.01)', padding: '6px', borderRadius: '4px' }}>
                              <em>"{selectedTeacher.experience.summary}"</em>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>No experience details provided</div>
                      )}
                    </div>
                  </div>

                  {/* Biography & Location Card */}
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--panel-border)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaUser /> Biography & Location Info
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedTeacher.bio && (
                        <div><strong>About Bio:</strong> {selectedTeacher.bio}</div>
                      )}
                      {selectedTeacher.languages && selectedTeacher.languages.length > 0 && (
                        <div><strong>Languages:</strong> {selectedTeacher.languages.join(', ')}</div>
                      )}
                      {selectedTeacher.boards && selectedTeacher.boards.length > 0 && (
                        <div><strong>Boards:</strong> {selectedTeacher.boards.join(', ')}</div>
                      )}
                      
                      <div style={{ borderTop: '1px solid var(--panel-border)', margin: '4px 0' }}></div>
                      
                      {selectedTeacher.address || selectedTeacher.city || selectedTeacher.state ? (
                        <div>
                          <strong>Address:</strong> {[selectedTeacher.address, selectedTeacher.city, selectedTeacher.state, selectedTeacher.pincode].filter(Boolean).join(', ')}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>No address details provided</div>
                      )}
                    </div>
                  </div>

                  {/* Bank Details Card */}
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--panel-border)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaUniversity /> Bank Details
                    </div>
                    {selectedTeacher.bankDetails ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><strong>Bank Name:</strong> {selectedTeacher.bankDetails.bankName || 'Bank'}</div>
                        <div><strong>Account No:</strong> {selectedTeacher.bankDetails.accountNumber}</div>
                        <div><strong>IFSC Code:</strong> {selectedTeacher.bankDetails.ifsc}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending Bank details entry</div>
                    )}
                  </div>

                  {/* Inline Decision Form Panel */}
                  <div style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--panel-border)', background: 'var(--bg-primary)' }}>
                    <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', marginBottom: '12px' }}>
                      <button
                        onClick={() => setDecisionType('approve')}
                        style={{
                          flex: 1, padding: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px',
                          background: decisionType === 'approve' ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                          color: decisionType === 'approve' ? 'var(--success-color)' : 'var(--text-secondary)',
                          border: decisionType === 'approve' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent'
                        }}
                      >
                        <FaCheckCircle /> Approve Access
                      </button>
                      <button
                        onClick={() => setDecisionType('reject')}
                        style={{
                          flex: 1, padding: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px',
                          background: decisionType === 'reject' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                          color: decisionType === 'reject' ? 'var(--error-color)' : 'var(--text-secondary)',
                          border: decisionType === 'reject' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent'
                        }}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>

                    {decisionType === 'approve' ? (
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                          Authorize Grade Access Levels:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
                          {availableClasses.map(cls => {
                            const isChecked = selectedClasses.includes(cls);
                            return (
                              <button
                                type="button"
                                key={cls}
                                onClick={() => handleClassToggle(cls)}
                                style={{
                                  padding: '6px 2px',
                                  borderRadius: '6px',
                                  border: isChecked ? '1px solid var(--accent-purple)' : '1px solid var(--panel-border)',
                                  background: isChecked ? 'rgba(124, 58, 237, 0.06)' : 'var(--bg-secondary)',
                                  color: isChecked ? 'var(--accent-purple)' : 'var(--text-secondary)',
                                  fontWeight: '600',
                                  fontSize: '11.5px',
                                  cursor: 'pointer',
                                  transition: 'all 0.1s'
                                }}
                              >
                                Class {cls}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>
                          Rejection Reason:
                        </label>
                        <textarea
                          className="glass-input"
                          rows="2"
                          placeholder="Why is this application rejected?..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>
                        Verification Notes (Internal):
                      </label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Identity verified. Credentials inspected."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                      />
                    </div>

                    <button
                      className="glass-button"
                      onClick={handleSubmitDecision}
                      disabled={submitting}
                      style={{
                        width: '100%',
                        background: decisionType === 'approve' ? 'linear-gradient(135deg, var(--accent-blue) 0%, rgba(59, 130, 246, 0.8) 100%)' : 'linear-gradient(135deg, var(--error-color) 0%, rgba(220, 38, 38, 0.8) 100%)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '13px',
                        padding: '10px',
                        justifyContent: 'center'
                      }}
                    >
                      {submitting ? 'Saving...' : decisionType === 'approve' ? 'Confirm Approval & Authorize' : 'Confirm Rejection'}
                    </button>
                  </div>

                </div>

              </div>
              
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
              <FaUserCheck size={48} />
              <div>No candidate selected. Select a teacher from the left queue to begin.</div>
            </div>
          )}
        </div>

      </div>

      {/* Agora Video Interview Call Modal */}
      <ActionModal
        isOpen={callModalOpen}
        onClose={() => {
          handleStopAgoraStream();
          setCallModalOpen(false);
        }}
        title="Live Agora Interview Session"
        size="fullscreen"
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0f19', padding: '20px', color: '#fff' }}>
          {callData && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              
              {/* Header Status Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: '#94a3b8' }}>Channel:</span> <code style={{ color: '#38bdf8', fontWeight: '600' }}>{callData.channelName}</code>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: joinedCall ? '#10b981' : '#f59e0b',
                    boxShadow: joinedCall ? '0 0 8px #10b981' : '0 0 8px #f59e0b'
                  }} />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: joinedCall ? '#10b981' : '#f59e0b' }}>
                    {joinedCall ? (remoteUserJoined ? 'Connected (Candidate Joined)' : 'Connected (Waiting for Candidate)') : 'Call Ready'}
                  </span>
                </div>
              </div>
 
              {/* Video Grid Layout */}
              {joinedCall ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: '400px', marginBottom: '20px' }}>
                  {/* Admin Video Stream */}
                  <div style={{ background: '#020617', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.8)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '500' }}>
                      Admin (You)
                    </div>
                  </div>
                  {/* Candidate Video Stream */}
                  <div style={{ background: '#020617', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <div ref={remoteVideoRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
                    {!remoteUserJoined && (
                      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div className="call-loader" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', animation: 'spin 1s linear infinite' }} />
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                          Waiting for teacher to connect...
                        </div>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.8)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', color: '#fff', zIndex: 2, border: '1px solid rgba(255,255,255,0.1)', fontWeight: '500' }}>
                      Candidate (Teacher)
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, minHeight: '400px', borderRadius: '16px', background: '#111827', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <FaVideo size={36} color="#10b981" />
                  </div>
                  <div style={{ color: '#fff', fontWeight: '700', fontSize: '20px' }}>Verification Interview Room Ready</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '420px', textAlign: 'center', lineHeight: '1.5' }}>
                    Click "Start Stream" to initialize the Agora RTC audio and video connection and begin the meeting.
                  </div>
                </div>
              )}
 
              {/* Bottom Control Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                  className="glass-button secondary" 
                  onClick={() => {
                    handleStopAgoraStream();
                    setCallModalOpen(false);
                  }} 
                  style={{ fontSize: '14px', padding: '10px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Close Room
                </button>
                {!joinedCall ? (
                  <button 
                    className="glass-button" 
                    onClick={handleStartAgoraStream}
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '14px', padding: '10px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                  >
                    Start Stream
                  </button>
                ) : (
                  <button 
                    className="glass-button" 
                    onClick={handleStopAgoraStream}
                    style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', color: '#fff', fontSize: '14px', padding: '10px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(239,68,68,0.2)' }}
                  >
                    Disconnect Call
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </ActionModal>
    </div>
  );
};

export default TeacherVerification;
