import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { exportToExcelCSV, getPaginationRange } from '../utils/exportUtils';
import ActionModal from '../components/ActionModal';
import {
  adminRescheduleInterview,
  adminSubmitVerifyDecision,
  adminGetAgoraToken,
  adminConfirmInterview,
  safeAdminCall
} from '../api/adminAuthApi';
import TeacherVerification from './TeacherVerification';
import {
  FaPlus,
  FaSearch,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaUsers,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaClock,
  FaVideo,
  FaFilter,
  FaList,
  FaThLarge,
  FaCopy,
  FaTimes,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
  FaUserCheck,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaRedo,
  FaCheckSquare,
  FaChevronRight,
  FaFileAlt,
  FaIdCard,
  FaUniversity,
  FaUserClock,
  FaAward,
  FaUser,
  FaArrowUp,
  FaArrowDown,
  FaRegFileAlt,
  FaLayerGroup,
  FaUserFriends,
  FaChartBar,
  FaWallet,
  FaFileExcel
} from 'react-icons/fa';

// Universal Perfectly Centered Icon Box Helper Component
const IconBox = ({ icon, bg, color, size = 44, iconSize = 20, radius = '12px' }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: radius,
    background: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    margin: 0,
    padding: 0
  }}>
    <span style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${iconSize}px`,
      height: `${iconSize}px`,
      fontSize: `${iconSize}px`,
      lineHeight: 1
    }}>
      {icon}
    </span>
  </div>
);

const docTypeLabels = {
  resume: 'Resume / CV',
  aadhaar: 'Aadhaar Card',
  qualificationCert: 'Qualification Certificate',
  experienceProof: 'Experience Proof',
  additional: 'Additional Document'
};

const Teachers = ({ defaultTab = 'overview' }) => {
  const [pageSearchVal, setPageSearchVal] = useState('');
  const { teachers, addTeacher, updateTeacher, deleteTeacher, refreshAll } = useAdmin();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'overview', 'all', 'verification', 'interviews', 'approved', 'rejected'

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Master-Detail selected teacher
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Keep selected teacher synced with the latest data from the master list
  useEffect(() => {
    if (selectedTeacher && teachers) {
      const updated = teachers.find(t => t._id === selectedTeacher._id || t.id === selectedTeacher.id);
      if (updated) {
        setSelectedTeacher(updated);
      }
    }
  }, [teachers, selectedTeacher?._id, selectedTeacher?.id]);

  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview', 'documents', 'interview', 'activity'
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form State for Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Mathematics');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [preselectedTeacherId, setPreselectedTeacherId] = useState(null);

  // Rescheduling modal states
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleInterviewId, setRescheduleInterviewId] = useState(null);
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [reschedulingLoading, setReschedulingLoading] = useState(false);

  // Verification Decision Modal / Inline Decision State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('approve'); // 'approve' | 'reject'
  const [selectedClasses, setSelectedClasses] = useState(['9', '10', '11', '12']);
  const [rejectionReason, setRejectionReason] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Agora Call Modal State
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callData, setCallData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [joinedCall, setJoinedCall] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const agoraClientRef = useRef(null);
  const localTracksRef = useRef([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notificationText, setNotificationText] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null); // { label, url, file }

  const handleSendNotification = (tr) => {
    if (!notificationText.trim()) {
      alert('Please enter a notification message.');
      return;
    }
    alert(`Notification sent to ${tr.name || tr.fullName || 'teacher'}: "${notificationText}"`);
    setNotificationText('');
  };

  // Helper colors for avatars
  const avatarColors = [
    { bg: '#e0e7ff', text: '#4338ca' }, // Purple/Indigo (GK)
    { bg: '#ffedd5', text: '#c2410c' }, // Amber/Orange (PR)
    { bg: '#dbeafe', text: '#1e40af' }, // Blue (AS)
    { bg: '#e0f2fe', text: '#0369a1' }, // Cyan (SN)
    { bg: '#fce7f3', text: '#be185d' }, // Pink (RS)
    { bg: '#fef3c7', text: '#b45309' }, // Yellow (MP)
    { bg: '#dcfce7', text: '#15803d' }, // Green (DV)
    { bg: '#fae8ff', text: '#86198f' }  // Fuchsia (KB)
  ];

  const getAvatarStyle = (index) => {
    return avatarColors[index % avatarColors.length];
  };

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'T';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'T';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Safe data renderers to prevent React object children crash
  const renderQualification = (q) => {
    if (!q) return '-';
    if (typeof q === 'string') return q;
    if (typeof q === 'object') {
      const highest = q.highestQualification || q.degree || q.qualification;
      const inst = q.instituteName || q.university || q.college;
      const year = q.passingYear;
      const parts = [highest, inst, year ? `(${year})` : null].filter(Boolean);
      return parts.length > 0 ? parts.join(' - ') : '-';
    }
    return String(q);
  };

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

  const renderLocation = (t) => {
    if (!t) return '-';
    // If it's the nested location object or address string
    if (typeof t === 'string') return t;
    
    // Check if nested location object exists
    if (t.location && typeof t.location === 'object') {
      const loc = t.location;
      const parts = [loc.address, loc.city, loc.state, loc.pincode || loc.pin, loc.country].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    
    // Check direct properties on the teacher object
    const partsDirect = [t.address, t.city, t.state, t.pincode || t.pin, t.country].filter(Boolean);
    if (partsDirect.length > 0) return partsDirect.join(', ');

    if (t.location && typeof t.location === 'string') return t.location;
    return '-';
  };

  const renderAbout = (t) => {
    if (!t) return '-';
    const val = t.bio || t.about || t.description || t.experience?.summary;
    if (!val) return '-';
    if (typeof val === 'string') return val.trim() || '-';
    if (typeof val === 'object') return val.text || val.summary || JSON.stringify(val);
    return String(val);
  };

  const getDocList = (t) => {
    if (!t) return [];

    // Extract array-based document fields from DB response
    const docArrays = [
      t.uploadedDocuments,
      t.documents,
      t.kycDocuments,
      t.verificationDocuments,
      t.docs,
      t.files
    ].find(arr => Array.isArray(arr) && arr.length > 0) || [];

    let combinedDocs = [];

    // 1. Add elements from document arrays
    if (Array.isArray(docArrays)) {
      docArrays.forEach((d) => {
        if (!d) return;
        const typeKey = d.type || d.docType || d.category || 'document';
        const url = d.url || d.fileUrl || d.link || d.path || '';
        const name = d.name || d.fileName || d.title || (url ? url.split('/').pop() : 'Document');
        const status = d.status || d.verificationStatus || 'approved';
        if (url) {
          combinedDocs.push({
            type: typeKey,
            name,
            url,
            status,
            verified: status === 'approved' || status === 'verified' || t.verified === true
          });
        }
      });
    }

    // 2. Add object-map fields if t.rawDocuments or t.documents is a non-array object
    const docObj = (t.rawDocuments && typeof t.rawDocuments === 'object' && !Array.isArray(t.rawDocuments))
      ? t.rawDocuments
      : (t.documents && typeof t.documents === 'object' && !Array.isArray(t.documents))
        ? t.documents
        : null;

    if (docObj) {
      Object.entries(docObj).forEach(([key, val]) => {
        if (!val) return;
        let url = '';
        let name = docTypeLabels[key] || key;
        let status = 'approved';
        if (typeof val === 'string') {
          url = val;
        } else if (typeof val === 'object') {
          url = val.url || val.fileUrl || val.link || '';
          name = val.name || val.fileName || docTypeLabels[key] || key;
          status = val.status || 'approved';
        }
        if (url && !combinedDocs.some(d => d.url === url || (key !== 'additional' && d.type === key))) {
          combinedDocs.push({
            type: key,
            name,
            url,
            status,
            verified: status === 'approved' || status === 'verified' || t.verified === true
          });
        }
      });
    }

    // 3. Helper to extract individual doc objects or URL strings on teacher object
    const checkAndPushField = (typeKey, val, defaultLabel) => {
      if (!val) return;
      let url = '';
      let name = defaultLabel;
      let status = 'approved';

      if (typeof val === 'string') {
        url = val;
        name = val.split('/').pop() || defaultLabel;
      } else if (typeof val === 'object') {
        url = val.url || val.fileUrl || val.link || '';
        name = val.name || val.fileName || val.title || (url ? url.split('/').pop() : defaultLabel);
        status = val.status || val.verificationStatus || 'approved';
      }

      if (url) {
        const alreadyExists = combinedDocs.some(d => (d.url && d.url === url) || (typeKey !== 'additional' && d.type === typeKey));
        if (!alreadyExists) {
          combinedDocs.push({
            type: typeKey,
            name,
            url,
            status,
            verified: status === 'approved' || status === 'verified' || t.verified === true
          });
        }
      }
    };

    checkAndPushField('resume', t.resume || t.resumeUrl || t.resumeFile || t.experience?.resumeUrl, 'Resume / CV');
    checkAndPushField('aadhaar', t.aadhar || t.aadhaar || t.aadharUrl || t.aadhaarUrl || t.aadharCard || t.aadhaarCard || t.documents?.aadhaar || t.documents?.aadhar, 'Aadhaar Card');
    checkAndPushField('qualificationCert', t.qualificationCert || t.qualificationCertUrl || t.degreeCert || t.degreeUrl || t.documents?.qualificationCert || t.qualification?.certificateUrl, 'Qualification Certificate');
    checkAndPushField('experienceProof', t.experienceProof || t.experienceProofUrl || t.experienceCert || t.experienceUrl || t.documents?.experienceProof, 'Experience Proof');
    checkAndPushField('idProof', t.idProof || t.idCard || t.idCardUrl, 'ID Proof Card');
    checkAndPushField('panCard', t.panCard || t.panCardUrl || t.panNumber, 'PAN Card');
    checkAndPushField('bankPassbook', t.bankPassbook || t.bankPassbookUrl || t.cancelledCheque || t.cancelledChequeUrl, 'Bank Passbook / Cheque');
    checkAndPushField('additional', t.additionalDoc || t.additionalDocUrl || t.additionalDocument || t.documents?.additionalDoc, 'Additional Document');

    return combinedDocs.map((d, i) => {
      const docType = d.type || d.docType || d.category || '';
      const rawUrl = d.url || d.fileUrl || d.link || d.path || '';
      const rawName = d.fileName || d.name || d.title || (rawUrl ? rawUrl.split('/').pop() : `document_${i + 1}`);

      return {
        label: docTypeLabels[docType] || docType || d.label || d.title || `Document ${i + 1}`,
        file: rawName,
        url: rawUrl,
        verified: d.status === 'approved' || d.status === 'verified' || d.verified === true || t.verified === true
      };
    });
  };

  // Stats calculation
  const totalTeachersCount = teachers.length;
  const pendingCount = teachers.filter(t =>
    !t.verified && ['submitted', 'pending_interview', 'under_review', 'interview_pending', 'pending'].includes(t.status || t.verificationStatus)
  ).length;
  const interviewsCount = teachers.filter(t =>
    t.interview && t.interview.scheduledAt && !t.verified && t.status !== 'rejected'
  ).length;
  const approvedCount = teachers.filter(t => t.verified === true || t.status === 'approved' || t.status === 'verified').length;
  const rejectedCount = teachers.filter(t => t.status === 'rejected').length;

  // Filter teachers based on main tab, search query, status, subject, language
  const filteredTeachers = teachers.filter(t => {
    const fullName = (t.name || t.fullName || `${t.firstName || ''} ${t.lastName || ''}`).toLowerCase();
    const email = (t.email || '').toLowerCase();
    const vlmId = String(t.vlmTeacherId || t._id || t.id || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery = !searchQuery || fullName.includes(query) || email.includes(query) || vlmId.includes(query);

    // Filter by Top Tab
    let matchesTab = true;
    if (activeTab === 'verification') {
      matchesTab = !t.verified && ['submitted', 'pending_interview', 'under_review', 'interview_pending', 'pending'].includes(t.status || t.verificationStatus);
    } else if (activeTab === 'interviews') {
      matchesTab = !!(t.interview && t.interview.scheduledAt && !t.verified && t.status !== 'rejected');
    } else if (activeTab === 'approved') {
      matchesTab = t.verified === true || t.status === 'approved' || t.status === 'verified';
    } else if (activeTab === 'rejected') {
      matchesTab = t.status === 'rejected';
    }

    // Secondary filters
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') matchesStatus = t.verified === true || t.status === 'verified';
      else if (statusFilter === 'pending') matchesStatus = !t.verified && ['submitted', 'pending_interview', 'under_review', 'pending'].includes(t.status);
      else if (statusFilter === 'rejected') matchesStatus = t.status === 'rejected';
    }

    let matchesSubject = true;
    if (subjectFilter !== 'all') {
      const subList = Array.isArray(t.subjects) ? t.subjects.map(s => String(s).toLowerCase()) : [String(t.subject || '').toLowerCase()];
      matchesSubject = subList.some(s => s.includes(subjectFilter.toLowerCase()));
    }

    let matchesLanguage = true;
    if (languageFilter !== 'all') {
      const langList = Array.isArray(t.languages) ? t.languages.map(l => String(l).toLowerCase()) : ['english', 'hindi'];
      matchesLanguage = langList.some(l => l.includes(languageFilter.toLowerCase()));
    }

    return matchesQuery && matchesTab && matchesStatus && matchesSubject && matchesLanguage;
  });

  // Select teacher and open side drawer
  const handleSelectTeacher = (tr) => {
    if (!tr) return;
    setSelectedTeacher(tr);
    setDrawerTab('overview');
    setShowFullAbout(false);
  };

  // Copy ID helper
  const handleCopyId = (idStr) => {
    if (!idStr) return;
    navigator.clipboard.writeText(String(idStr));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Pagination bounds
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + pageSize);

  // Handle Reschedule submit
  const handleRescheduleSubmit = async () => {
    if (!rescheduleInterviewId || !newScheduledAt) {
      alert('Please select a valid date and time.');
      return;
    }
    setReschedulingLoading(true);
    try {
      const res = await adminRescheduleInterview({
        interviewId: rescheduleInterviewId,
        newScheduledAt,
        reason: rescheduleReason
      });
      if (res && res.success) {
        alert('Interview rescheduled successfully!');
        setRescheduleModalOpen(false);
        await refreshAll();
      } else {
        alert(res?.message || 'Failed to reschedule interview.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reschedule: ' + (err?.response?.data?.message || err.message));
    } finally {
      setReschedulingLoading(false);
    }
  };

  // Handle Verification Decision Submit (Approve / Reject)
  const handleSubmitDecision = async (t, decision) => {
    if (!t) return;
    const teacherId = t._id || t.id;
    const interview = t.interview || (t.interviews && t.interviews[0]);

    setSubmittingDecision(true);
    try {
      const payload = {
        teacherId,
        decision,
        approvedClasses: decision === 'approve' ? selectedClasses : [],
        rejectionReason: decision === 'reject' ? (rejectionReason || 'Documents did not meet criteria.') : '',
        interviewId: interview ? interview._id : undefined,
        notes: decisionNotes
      };

      const res = await adminSubmitVerifyDecision(payload);
      if (res && res.success) {
        alert(res.message || `Teacher ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setDecisionModalOpen(false);
        if (selectedTeacher && (selectedTeacher._id === teacherId || selectedTeacher.id === teacherId)) {
          setSelectedTeacher(prev => ({ ...prev, status: decision === 'approve' ? 'approved' : 'rejected', verified: decision === 'approve' }));
        }
        await refreshAll();
      } else {
        alert(res?.message || 'Failed to update verification decision.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting decision: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Handle Agora Call
  const handleJoinAgoraCall = async (tr) => {
    if (!tr) return;
    const interview = tr.interview || (tr.interviews && tr.interviews[0]);
    const targetInterviewId = interview?.slotId || interview?._id || tr._id || tr.id;
    if (!targetInterviewId) {
      alert('No active scheduled interview session found for this teacher.');
      return;
    }

    setLoadingToken(true);
    try {
      const res = await adminGetAgoraToken(targetInterviewId);
      if (res && res.success && res.data) {
        const queryParams = new URLSearchParams({
          view: 'live-interview',
          channelName: res.data.channelName,
          token: res.data.agoraToken || res.data.token || '',
          appId: res.data.appId,
          teacherName: tr.name || tr.fullName || 'Teacher Candidate',
          interviewId: targetInterviewId,
          teacherId: tr._id || tr.id
        }).toString();
        window.open(`/?${queryParams}`, '_blank');
      } else {
        alert(res?.message || 'Unable to generate Agora video call token.');
      }
    } catch (err) {
      console.error('Agora Token Error:', err);
      alert('Failed to get video call token: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoadingToken(false);
    }
  };

  const handleConfirmInterview = async () => {
    const interview = selectedTeacher.interview || (selectedTeacher.interviews && selectedTeacher.interviews[0]);
    const targetInterviewId = interview?.slotId || interview?._id || selectedTeacher._id || selectedTeacher.id;
    if (!targetInterviewId) {
      alert('No active scheduled interview session found.');
      return;
    }
    try {
      const res = await adminConfirmInterview(targetInterviewId);
      if (res && res.success) {
        alert('Interview slot confirmed successfully! Notification has been dispatched to the teacher.');
        await refreshAll();
      } else {
        alert(res?.message || 'Failed to confirm interview schedule.');
      }
    } catch (e) {
      alert('Error confirming interview: ' + e.message);
    }
  };

  const isJoinButtonEnabled = (tr) => {
    const target = tr || selectedTeacher;
    if (!target?.interview?.scheduledAt) return true; // fallback if no time is set
    const scheduledTime = new Date(target.interview.scheduledAt).getTime();
    const currentTime = Date.now();
    const fifteenMins = 15 * 60 * 1000;
    return currentTime >= (scheduledTime - fifteenMins);
  };

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
      console.error('Failed to join Agora video call:', err);
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
      await agoraClientRef.current.leave().catch(() => { });
    }
    agoraClientRef.current = null;
    setJoinedCall(false);
    setRemoteUserJoined(false);
    setCallModalOpen(false);
  };

  // Modal open for Add/Edit
  const openAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setSubject('Mathematics');
    setModalOpen(true);
  };

  const openEditModal = (tr) => {
    if (!tr) return;
    setEditingTeacher(tr);
    setName(tr.name || tr.fullName || '');
    setEmail(tr.email || '');
    setSubject(Array.isArray(tr.subjects) ? tr.subjects.join(', ') : (tr.subject || 'Mathematics'));
    setModalOpen(true);
  };

  const handleAddEditSubmit = async () => {
    const fullName = String(name || '').trim();
    const parts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
    const firstName = parts[0] || 'Teacher';
    const lastName = parts.length >= 2 ? parts[parts.length - 1] : '';

    const subjectsArr = String(subject || '').split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      firstName,
      lastName,
      email,
      subjects: subjectsArr
    };

    if (editingTeacher) {
      await updateTeacher(editingTeacher._id || editingTeacher.id, payload);
    } else {
      await addTeacher(payload);
    }
    setModalOpen(false);
  };

  // Conic-gradient pie chart percentages calculation for Overview Dashboard
  const totalGrad = totalTeachersCount || 1;
  const pctVerified = Math.round(approvedCount / totalGrad * 100);
  const pctInReview = Math.round(pendingCount / totalGrad * 100);
  const pctInterviews = Math.round(interviewsCount / totalGrad * 100);
  const pctRejected = Math.round(rejectedCount / totalGrad * 100);

  const gradVerified = pctVerified;
  const gradInReview = gradVerified + pctInReview;
  const gradInterviews = gradInReview + pctInterviews;
  const gradRejected = gradInterviews + pctRejected;

  const conicGradient = `conic-gradient(
    #3b82f6 0% ${gradVerified}%, 
    #a855f7 ${gradVerified}% ${gradInReview}%, 
    #f97316 ${gradInReview}% ${gradInterviews}%, 
    #ef4444 ${gradInterviews}% ${gradRejected}%, 
    #cbd5e1 ${gradRejected}% 100%
  )`;

  // Quick Cards for Overview Dashboard
  const quickCards = [
    { id: 'verification', title: 'Teacher Verification', desc: 'Verify documents and credentials', icon: <FaShieldAlt />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { id: 'interviews', title: 'Teacher Interviews', desc: 'Schedule & conduct live video interviews', icon: <FaCalendarAlt />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { id: 'all', title: 'Teacher Directory', desc: 'View and manage teacher profiles', icon: <FaUserCheck />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
  ];

  // Applications list for Overview Dashboard
  const recentApplicationsList = teachers
    .filter(t => !t.verified && t.status !== 'rejected')
    .slice(0, 5);

  const handleExportExcel = () => {
    const headers = [
      { label: 'Teacher ID', key: 'vlmTeacherId' },
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', key: 'phone' },
      { label: 'Subject(s)', key: (tr) => Array.isArray(tr.subjects) ? tr.subjects.join(', ') : (tr.subject || 'N/A') },
      { label: 'Experience (Years)', key: 'experience.years' },
      { label: 'Experience (Details)', key: 'experience.details' },
      { label: 'Qualification (Degree)', key: 'qualification.degree' },
      { label: 'Qualification (Institute)', key: 'qualification.institute' },
      { label: 'Address', key: 'address' },
      { label: 'City', key: 'city' },
      { label: 'State', key: 'state' },
      { label: 'Pincode', key: 'pincode' },
      { label: 'Rating', key: 'rating' },
      { label: 'Status/Verification', key: 'status' },
      { label: 'Verified', key: (tr) => tr.verified ? 'Yes' : 'No' },
      { label: 'Interview Status', key: (tr) => tr.interview?.status || 'N/A' },
      { label: 'Interview Date', key: (tr) => tr.interview?.scheduledAt ? new Date(tr.interview.scheduledAt).toLocaleString() : 'N/A' },
      { label: 'Joined On', key: (tr) => tr.createdAt ? new Date(tr.createdAt).toLocaleDateString() : 'N/A' }
    ];

    exportToExcelCSV(filteredTeachers, headers, 'vlm_teachers');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>

      {/* 1. TOP HEADER & METRIC CARD SUITE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Teachers</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Manage and monitor all onboarded teachers across verification, interviews, and class assignments.
          </p>
        </div>

        {/* Top Tab Controls & Add Teacher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportExcel}
            className="glass-button secondary"
            style={{
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaFileExcel size={13} style={{ color: '#107c41' }} /> Export Excel
          </button>
          <button
            onClick={openAddModal}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'transform 0.15s ease'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FaPlus size={13} /> Add New Teacher
          </button>
        </div>
      </div>

      {/* TOP STATUS TABS NAV BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--panel-border, #e2e8f0)',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview', count: totalTeachersCount, icon: <FaUsers /> },
          { id: 'all', label: 'All Teachers', count: totalTeachersCount, icon: <FaList /> },
          { id: 'verification', label: 'Verification', count: pendingCount, icon: <FaShieldAlt /> },
          { id: 'interviews', label: 'Interviews', count: interviewsCount, icon: <FaCalendarAlt /> },
          { id: 'approved', label: 'Approved', count: approvedCount, icon: <FaCheckCircle /> },
          { id: 'rejected', label: 'Rejected', count: rejectedCount, icon: <FaTimesCircle /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                background: 'transparent',
                color: isActive ? '#4f46e5' : 'var(--text-secondary, #64748b)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '13.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', width: '15px', height: '15px', color: isActive ? '#4f46e5' : '#94a3b8' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: isActive ? 'rgba(79, 70, 229, 0.1)' : '#f1f5f9',
                color: isActive ? '#4f46e5' : '#64748b',
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. OVERVIEW DASHBOARD VIEW (WHEN ACTIVE TAB IS 'OVERVIEW') */}
      {activeTab === 'overview' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* STAT CARDS BAR (5 SUMMARY CARDS) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Teachers</span>
                <IconBox icon={<FaUsers />} bg="rgba(139, 92, 246, 0.1)" color="#8b5cf6" size={38} iconSize={18} radius="10px" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{totalTeachersCount}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>+12% vs last month</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Pending Verification</span>
                <IconBox icon={<FaClock />} bg="rgba(245, 158, 11, 0.1)" color="#f59e0b" size={38} iconSize={18} radius="10px" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{pendingCount}</div>
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px', fontWeight: '600' }}>Awaiting review</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Scheduled Interviews</span>
                <IconBox icon={<FaCalendarAlt />} bg="rgba(59, 130, 246, 0.1)" color="#3b82f6" size={38} iconSize={18} radius="10px" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{interviewsCount}</div>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>Upcoming sessions</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Approved Teachers</span>
                <IconBox icon={<FaCheckCircle />} bg="rgba(16, 185, 129, 0.1)" color="#10b981" size={38} iconSize={18} radius="10px" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{approvedCount}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>Ready to teach</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Rejected Teachers</span>
                <IconBox icon={<FaTimesCircle />} bg="rgba(239, 68, 68, 0.1)" color="#ef4444" size={38} iconSize={18} radius="10px" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{rejectedCount}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: '600' }}>Not approved</div>
            </div>
          </div>

          {/* QUICK ACCESS MODULE CARDS (PERFECTLY CENTERED ICONS) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {quickCards.map(card => (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '1px solid var(--panel-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <IconBox icon={card.icon} bg={card.bg} color={card.color} size={48} iconSize={22} radius="12px" />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{card.title}</h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>{card.desc}</p>
                </div>

                <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaChevronRight size={12} color="#cbd5e1" />
                </div>
              </div>
            ))}
          </div>

          {/* 2-COLUMN MAIN CONTENT: RECENT APPLICATIONS & DONUT CHART */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

            {/* LEFT BOX: RECENT APPLICATIONS TABLE */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Pending Applications</h3>
                <button
                  onClick={() => setActiveTab('verification')}
                  style={{ border: 'none', background: 'transparent', color: '#4f46e5', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  View All ({pendingCount}) →
                </button>
              </div>

              {recentApplicationsList.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No pending teacher applications at the moment.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', verticalAlign: 'middle' }}>APPLICANT</th>
                      <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', verticalAlign: 'middle' }}>SUBJECTS</th>
                      <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>STATUS</th>
                      <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplicationsList.map((app, i) => {
                      const appName = app.name || app.fullName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Candidate';
                      const subjectsStr = Array.isArray(app.subjects) ? app.subjects.join(', ') : (app.subject || 'Maths');
                      return (
                        <tr
                          key={app._id || app.id || i}
                          onClick={() => {
                            handleSelectTeacher(app);
                            setActiveTab('all');
                          }}
                          style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s ease' }}
                        >
                          <td style={{ padding: '14px', verticalAlign: 'middle', minWidth: '170px' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13.5px' }}>{appName}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>{app.email}</div>
                          </td>
                          <td
                            style={{
                              padding: '14px',
                              verticalAlign: 'middle',
                              fontSize: '13px',
                              color: '#475569',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={subjectsStr}
                          >
                            {subjectsStr}
                          </td>
                          <td style={{ padding: '14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: '#d97706',
                              whiteSpace: 'nowrap'
                            }}>
                              <FaClock size={12} style={{ display: 'block' }} />
                              Pending Review
                            </span>
                          </td>
                          <td style={{ padding: '14px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTeacher(app);
                                setActiveTab('all');
                              }}
                              style={{
                                border: 'none',
                                background: '#e0e7ff',
                                color: '#4338ca',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* RIGHT BOX: VERIFICATION OVERVIEW DONUT CHART */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Verification Status</h3>
                  <button onClick={() => setActiveTab('verification')} style={{ border: 'none', background: 'transparent', color: '#4f46e5', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>

                {/* ABSOLUTE CENTERED DONUT CHART */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
                  <div style={{
                    position: 'relative',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: conicGradient,
                    margin: '0 auto',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '104px',
                      height: '104px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{approvedCount}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '3px' }}>Approved</span>
                    </div>
                  </div>
                </div>

                {/* LEGEND LIST WITH CLEAN BADGES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                      <span style={{ color: '#475569', fontSize: '12.5px', fontWeight: '500' }}>Approved / Verified</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{approvedCount}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '600' }}>
                        {pctVerified}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
                      <span style={{ color: '#475569', fontSize: '12.5px', fontWeight: '500' }}>Pending Verification</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{pendingCount}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '600' }}>
                        {pctInReview}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                      <span style={{ color: '#475569', fontSize: '12.5px', fontWeight: '500' }}>Scheduled Interviews</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{interviewsCount}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '600' }}>
                        {pctInterviews}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ color: '#475569', fontSize: '12.5px', fontWeight: '500' }}>Rejected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>{rejectedCount}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '600' }}>
                        {pctRejected}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* 3. REDESIGNED LIST TABLE & DETAIL DRAWER FOR ALL / VERIFICATION / INTERVIEWS / APPROVED / REJECTED */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* FILTER BAR */}
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Search Input */}
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
                <input
                  type="text"
                  placeholder="Search teachers by name, email, or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border, #cbd5e1)',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#94a3b8', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 5px', background: '#f8fafc' }}>
                  ⌘K
                </span>
              </div>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--panel-border, #cbd5e1)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  background: '#ffffff',
                  cursor: 'pointer',
                  minWidth: '130px'
                }}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Subject Dropdown */}
              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--panel-border, #cbd5e1)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  background: '#ffffff',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
              >
                <option value="all">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="english">English</option>
                <option value="computer">Computer & Coding</option>
              </select>

              {/* Language Dropdown */}
              <select
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--panel-border, #cbd5e1)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  background: '#ffffff',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
              >
                <option value="all">All Languages</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="hinglish">Hinglish</option>
              </select>

              {/* Filter button */}
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                <FaFilter size={12} /> Filter
              </button>

              {/* View mode toggle */}
              <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden', marginLeft: 'auto' }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    background: viewMode === 'table' ? '#e0e7ff' : '#ffffff',
                    color: viewMode === 'table' ? '#4338ca' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <FaList size={14} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    background: viewMode === 'grid' ? '#e0e7ff' : '#ffffff',
                    color: viewMode === 'grid' ? '#4338ca' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <FaThLarge size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN MASTER-DETAIL WORKSPACE */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative' }}>

            {/* LEFT WORKSPACE: TEACHER TABLE VIEW */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="glass-panel" style={{ borderRadius: '14px', border: '1px solid var(--panel-border)', overflow: 'hidden' }}>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'middle' }}>TEACHER</th>
                      {!selectedTeacher && <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'middle' }}>SUBJECTS</th>}
                      {!selectedTeacher && <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>STATUS</th>}
                      <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>INTERVIEW</th>
                      <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>JOINED ON</th>
                      {!selectedTeacher && <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={selectedTeacher ? 3 : 6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                          <FaUsers size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>No teachers match the selected filters.</div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTeachers.map((tr, index) => {
                        const isSelected = selectedTeacher && (selectedTeacher._id === tr._id || selectedTeacher.id === tr.id);
                        const avatarStyle = getAvatarStyle(index);
                        const teacherName = tr.name || tr.fullName || `${tr.firstName || ''} ${tr.lastName || ''}`.trim() || 'Teacher';
                        const subjectsText = Array.isArray(tr.subjects) && tr.subjects.length > 0
                          ? tr.subjects.join(', ')
                          : (typeof tr.subject === 'string' ? tr.subject : 'Maths, Physics');

                        const isVerified = tr.verified === true || tr.status === 'approved' || tr.status === 'verified';
                        const isPending = !isVerified && tr.status !== 'rejected';
                        const isRejected = tr.status === 'rejected';

                        // Interview Data
                        const interview = tr.interview || (tr.interviews && tr.interviews[0]);
                        const interviewTimeStr = interview?.scheduledAt
                          ? new Date(interview.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : null;

                        const interviewStatusStr = interview?.status || (interviewTimeStr ? 'Scheduled' : 'Not Scheduled');

                        const joinedDateStr = tr.createdAt
                          ? new Date(tr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '20 Jul 2025';

                        return (
                          <tr
                            key={tr._id || tr.id || index}
                            onClick={() => handleSelectTeacher(tr)}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(79, 70, 229, 0.06)' : 'transparent',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            {/* TEACHER CELL */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle', minWidth: '180px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: avatarStyle.bg,
                                  color: avatarStyle.text,
                                  fontWeight: '700',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {getInitials(teacherName)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                    {teacherName}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                                    {tr.email || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SUBJECTS CELL */}
                            {!selectedTeacher && (
                              <td
                                style={{
                                  padding: '14px 16px',
                                  verticalAlign: 'middle',
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                  fontWeight: '500',
                                  maxWidth: '240px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={subjectsText}
                              >
                                {subjectsText}
                              </td>
                            )}

                            {/* STATUS CELL */}
                            {!selectedTeacher && (
                              <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                {isVerified ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    <FaCheckCircle size={12} style={{ display: 'block' }} />
                                    Verified
                                  </span>
                                ) : isPending ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: '#d97706',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    <FaClock size={12} style={{ display: 'block' }} />
                                    Pending
                                  </span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    <FaTimesCircle size={12} style={{ display: 'block' }} />
                                    Rejected
                                  </span>
                                )}
                              </td>
                            )}

                            {/* INTERVIEW CELL */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              {interviewTimeStr ? (
                                <div>
                                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {interviewTimeStr}
                                  </div>
                                  <span style={{
                                    display: 'inline-block',
                                    marginTop: '3px',
                                    padding: '2px 7px',
                                    borderRadius: '8px',
                                    fontSize: '10.5px',
                                    fontWeight: '600',
                                    background: interviewStatusStr === 'Scheduled' ? '#e0e7ff' : '#f1f5f9',
                                    color: interviewStatusStr === 'Scheduled' ? '#4338ca' : '#64748b'
                                  }}>
                                    {interviewStatusStr}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>-</div>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '2px 7px',
                                    borderRadius: '8px',
                                    fontSize: '10.5px',
                                    fontWeight: '500',
                                    background: '#f1f5f9',
                                    color: '#94a3b8'
                                  }}>
                                    Not Scheduled
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* JOINED ON CELL */}
                            <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {joinedDateStr}
                            </td>

                            {/* ACTIONS CELL */}
                            {!selectedTeacher && (
                              <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectTeacher(tr);
                                    }}
                                    title="View Details"
                                    style={{
                                      border: 'none',
                                      background: '#f1f5f9',
                                      color: '#64748b',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: 0
                                    }}
                                  >
                                    <FaEye size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRescheduleInterviewId(tr.interview?._id || tr.interview?.id || tr._id);
                                      setNewScheduledAt(tr.interview?.scheduledAt ? new Date(tr.interview.scheduledAt).toISOString().slice(0, 16) : '');
                                      setRescheduleReason('');
                                      setRescheduleModalOpen(true);
                                    }}
                                    title="Schedule / Reschedule Interview"
                                    style={{
                                      border: 'none',
                                      background: '#f1f5f9',
                                      color: '#4f46e5',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      display: (tr.verified === true || tr.status === 'approved' || tr.status === 'verified' || tr.status === 'rejected') ? 'none' : 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: 0
                                    }}
                                  >
                                    <FaCalendarAlt size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(tr);
                                    }}
                                    title="Edit Profile"
                                    style={{
                                      border: 'none',
                                      background: '#f1f5f9',
                                      color: '#64748b',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: 0
                                    }}
                                  >
                                    <FaEdit size={13} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* TABLE PAGINATION FOOTER */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderTop: '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Showing <strong style={{ color: '#0f172a' }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to <strong style={{ color: '#0f172a' }}>{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> teachers
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: currentPage === 1 ? '#cbd5e1' : '#475569',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '12.5px',
                          fontWeight: '600'
                        }}
                      >
                        &lt;
                      </button>
                      {getPaginationRange(currentPage, totalPages).map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return <span key={`ellipsis-${idx}`} style={{ padding: '6px 12px', color: '#64748b', fontSize: '12.5px', fontWeight: '600' }}>...</span>;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: pageNum === currentPage ? 'none' : '1px solid #cbd5e1',
                              background: pageNum === currentPage ? '#4f46e5' : '#ffffff',
                              color: pageNum === currentPage ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: '600'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontSize: '12.5px',
                          fontWeight: '600'
                        }}
                      >
                        &gt;
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                      <input 
                        type="number"
                        placeholder="Page..."
                        value={pageSearchVal}
                        onChange={(e) => setPageSearchVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const pageNum = parseInt(pageSearchVal, 10);
                            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                              setCurrentPage(pageNum);
                              setPageSearchVal('');
                            } else {
                              alert(`Please enter a page number between 1 and ${totalPages}`);
                            }
                          }
                        }}
                        style={{
                          width: '65px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12.5px',
                          background: '#ffffff',
                          color: '#475569',
                          textAlign: 'center'
                        }}
                      />
                      <button 
                        onClick={() => {
                          const pageNum = parseInt(pageSearchVal, 10);
                          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                            setCurrentPage(pageNum);
                            setPageSearchVal('');
                          } else {
                            alert(`Please enter a page number between 1 and ${totalPages}`);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Go
                      </button>
                    </div>

                    <select
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        color: '#475569',
                        background: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={10}>10 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SLIDE-IN DETAIL DRAWER (MASTER-DETAIL DETAIL PANEL) */}
            {selectedTeacher && (
              <div className="glass-panel" style={{
                width: '540px',
                borderRadius: '16px',
                border: '1px solid var(--panel-border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flexShrink: 0
              }}>

                {/* DRAWER HEADER */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => setSelectedTeacher(null)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '16px',
                      border: 'none',
                      background: '#e2e8f0',
                      color: '#64748b',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <FaTimes size={13} />
                  </button>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#e0e7ff',
                      color: '#4338ca',
                      fontWeight: '800',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getInitials(selectedTeacher.name || selectedTeacher.fullName || `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                          {selectedTeacher.name || selectedTeacher.fullName || `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`.trim() || 'Teacher'}
                        </h3>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: selectedTeacher.verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: selectedTeacher.verified ? '#10b981' : '#d97706'
                        }}>
                          {selectedTeacher.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px' }}>
                        {selectedTeacher.email || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {selectedTeacher.phone || selectedTeacher.mobile || '+91 98765 43210'}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>ID: {String(selectedTeacher.vlmTeacherId || selectedTeacher._id || selectedTeacher.id || 'VLM-TCH-000024')}</span>
                        <button
                          onClick={() => handleCopyId(selectedTeacher.vlmTeacherId || selectedTeacher._id || selectedTeacher.id || 'VLM-TCH-000024')}
                          style={{ border: 'none', background: 'transparent', color: copiedId ? '#10b981' : '#4f46e5', cursor: 'pointer', padding: 0 }}
                          title="Copy ID"
                        >
                          <FaCopy size={11} /> {copiedId && 'Copied!'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DRAWER INNER NAVIGATION TABS */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#ffffff'
                }}>
                  {(() => {
                    const isVerified = selectedTeacher.verified === true || selectedTeacher.status === 'approved' || selectedTeacher.status === 'verified';
                    const isRejected = selectedTeacher.status === 'rejected';
                    const needsInterview = !isVerified && !isRejected;
                    return [
                      { id: 'overview', label: 'Overview' },
                      { id: 'documents', label: 'Documents' },
                      ...(needsInterview ? [{ id: 'interview', label: 'Interview' }] : []),
                      { id: 'activity', label: 'Activity' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDrawerTab(tab.id)}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          border: 'none',
                          borderBottom: drawerTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
                          background: 'transparent',
                          color: drawerTab === tab.id ? '#4f46e5' : '#64748b',
                          fontWeight: drawerTab === tab.id ? '700' : '500',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ));
                  })()}
                </div>

                {/* DRAWER TAB BODY CONTENT */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* 1. OVERVIEW TAB */}
                  {drawerTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Basic Information
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Subjects</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {Array.isArray(selectedTeacher.subjects) ? selectedTeacher.subjects.join(', ') : (typeof selectedTeacher.subject === 'string' ? selectedTeacher.subject : 'Maths, Physics')}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Languages</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {Array.isArray(selectedTeacher.languages) && selectedTeacher.languages.length > 0 
                              ? selectedTeacher.languages.map(l => ({ en: 'English', hi: 'Hindi', eh: 'Hinglish' }[l.toLowerCase()] || l)).join(', ') 
                              : '-'}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Highest Qualification</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {selectedTeacher.qualification?.highestQualification || selectedTeacher.qualification?.degree || '-'}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Institute</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {selectedTeacher.qualification?.instituteName || selectedTeacher.qualification?.university || selectedTeacher.qualification?.college || '-'}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Passing Year</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {selectedTeacher.qualification?.passingYear || '-'}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Experience</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {renderExperience(selectedTeacher.experience?.totalYears)}
                          </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Location</div>
                          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                            {renderLocation(selectedTeacher)}
                          </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>About</div>
                          <div style={{ color: '#334155', marginTop: '4px', lineHeight: '1.4', fontSize: '12.5px' }}>
                            {renderAbout(selectedTeacher)}
                          </div>
                        </div>

                        {selectedTeacher.bankDetails ? (
                          <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: '700', fontSize: '11px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Bank Account Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#334155' }}>
                              <div><strong>Holder:</strong> {selectedTeacher.bankDetails.accountHolder || selectedTeacher.name}</div>
                              <div><strong>Bank Name:</strong> {selectedTeacher.bankDetails.bankName || 'N/A'}</div>
                              <div><strong>Account No:</strong> {selectedTeacher.bankDetails.accountNumber || 'N/A'}</div>
                              <div><strong>IFSC Code:</strong> {selectedTeacher.bankDetails.ifsc || 'N/A'}</div>
                              {selectedTeacher.bankDetails.upiId && <div style={{ gridColumn: '1 / -1' }}><strong>UPI ID:</strong> {selectedTeacher.bankDetails.upiId}</div>}
                            </div>
                          </div>
                        ) : (
                          <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2', color: '#991b1b', fontSize: '12px' }}>
                            No bank details added yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. DOCUMENTS TAB */}
                  {drawerTab === 'documents' && (() => {
                    const docList = getDocList(selectedTeacher);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Uploaded Documents ({docList.length})
                        </h4>

                        {docList.length === 0 ? (
                          <div style={{
                            padding: '32px 16px',
                            textAlign: 'center',
                            color: '#94a3b8',
                            fontSize: '13px',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '10px',
                            background: '#f8fafc'
                          }}>
                            <FaRegFileAlt size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
                            <div style={{ fontWeight: '500', color: '#64748b' }}>No documents uploaded by this teacher.</div>
                          </div>
                        ) : (
                          <>
                            {docList.map((doc, idx) => {
                              const hasUrl = Boolean(doc.url && doc.url !== '#');
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (hasUrl) {
                                      setPreviewDoc(doc);
                                    } else {
                                      alert(`Document file link is missing in DB for: ${doc.label}`);
                                    }
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    cursor: hasUrl ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (hasUrl) {
                                      e.currentTarget.style.borderColor = '#4f46e5';
                                      e.currentTarget.style.background = '#f5f3ff';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.background = '#f8fafc';
                                  }}
                                  title={hasUrl ? "Click to preview document" : "File link missing"}
                                >
                                  <div>
                                    <div style={{ fontWeight: '600', fontSize: '12.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {doc.label}
                                      {hasUrl && <FaExternalLinkAlt size={10} color="#94a3b8" />}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{doc.file}</div>
                                  </div>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    background: doc.verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: doc.verified ? '#10b981' : '#d97706'
                                  }}>
                                    {doc.verified ? 'Verified' : 'Pending'}
                                  </span>
                                </div>
                              );
                            })}

                            <button
                              onClick={() => {
                                const urlsToOpen = docList.map(d => d.url).filter(url => url && url !== '#');
                                if (urlsToOpen.length > 0) {
                                  urlsToOpen.forEach(url => window.open(url, '_blank'));
                                } else {
                                  alert('No valid document URLs available to open.');
                                }
                              }}
                              className="glass-button secondary"
                              style={{ marginTop: '8px', width: '100%', justifyContent: 'center', fontSize: '12.5px' }}
                            >
                              <FaExternalLinkAlt size={11} /> Open All Documents
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* 3. INTERVIEW TAB */}
                  {drawerTab === 'interview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Interview Session
                      </h4>

                      <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                            {selectedTeacher.interview?.scheduledAt
                              ? new Date(selectedTeacher.interview.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
                              : '27 July 2025 Saturday'}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: '#e0e7ff', color: '#4338ca' }}>
                            {selectedTeacher.interview?.status || 'Scheduled'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                          {selectedTeacher.interview?.scheduledAt
                            ? new Date(selectedTeacher.interview.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : '07:00 PM - 07:30 PM (30 mins)'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                          Interview Mode: <strong style={{ color: '#0f172a' }}>Video Call</strong>
                        </div>
                      </div>

                      {(selectedTeacher.interview?.status === 'pending' || selectedTeacher.interview?.status === 'rescheduled') && (
                        <button
                          onClick={handleConfirmInterview}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#10b981',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '13.5px',
                            cursor: 'pointer',
                            marginTop: '4px'
                          }}
                        >
                          Accept Rescheduled Slot
                        </button>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={() => {
                            setRescheduleInterviewId(selectedTeacher.interview?.slotId || selectedTeacher.interview?._id || selectedTeacher._id);
                            setNewScheduledAt(selectedTeacher.interview?.scheduledAt ? new Date(selectedTeacher.interview.scheduledAt).toISOString().slice(0, 16) : '');
                            setRescheduleReason('');
                            setRescheduleModalOpen(true);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          Reschedule
                        </button>
                        <button
                          disabled={!isJoinButtonEnabled(selectedTeacher)}
                          onClick={() => handleJoinAgoraCall(selectedTeacher)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isJoinButtonEnabled(selectedTeacher)
                              ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)'
                              : '#cbd5e1',
                            color: isJoinButtonEnabled(selectedTeacher) ? '#ffffff' : '#94a3b8',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: isJoinButtonEnabled(selectedTeacher) ? 'pointer' : 'not-allowed',
                            boxShadow: isJoinButtonEnabled(selectedTeacher) ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'
                          }}
                          title={!isJoinButtonEnabled(selectedTeacher) ? 'Join button opens 15 mins prior to slot' : 'Start Call'}
                        >
                          Start Interview
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. ACTIVITY TAB */}
                  {drawerTab === 'activity' && (() => {
                    // Build real activity events from teacher data
                    const events = [];

                    if (selectedTeacher.createdAt) {
                      events.push({
                        title: 'Application Submitted',
                        date: new Date(selectedTeacher.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        color: '#6366f1'
                      });
                    }

                    // Documents uploaded — if documents array exists
                    const docCount = selectedTeacher.documents?.length || 0;
                    if (docCount > 0) {
                      events.push({
                        title: `${docCount} Document${docCount > 1 ? 's' : ''} Uploaded`,
                        date: selectedTeacher.documents?.[0]?.uploadedAt
                          ? new Date(selectedTeacher.documents[0].uploadedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'During Onboarding',
                        color: '#3b82f6'
                      });
                    }

                    // Interview scheduled
                    const interview = selectedTeacher.interview || (selectedTeacher.interviews && selectedTeacher.interviews[0]);
                    if (interview?.scheduledAt) {
                      events.push({
                        title: `Interview ${interview.status === 'confirmed' ? 'Confirmed' : interview.status === 'rescheduled' ? 'Rescheduled' : 'Scheduled'}`,
                        date: new Date(interview.scheduledAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        color: '#f59e0b'
                      });
                    }

                    // Interview completed
                    if (interview?.completedAt || interview?.status === 'completed') {
                      events.push({
                        title: 'Interview Completed',
                        date: interview.completedAt
                          ? new Date(interview.completedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Completed',
                        color: '#10b981'
                      });
                    }

                    // Verified / Approved
                    if (selectedTeacher.verified === true || selectedTeacher.status === 'approved' || selectedTeacher.status === 'verified') {
                      events.push({
                        title: '✅ Teacher Verified & Approved',
                        date: selectedTeacher.verifiedAt
                          ? new Date(selectedTeacher.verifiedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : selectedTeacher.updatedAt
                            ? new Date(selectedTeacher.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Approval Date Unknown',
                        color: '#10b981'
                      });
                    }

                    // Rejected
                    if (selectedTeacher.status === 'rejected') {
                      events.push({
                        title: '❌ Application Rejected',
                        date: selectedTeacher.rejectedAt
                          ? new Date(selectedTeacher.rejectedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : selectedTeacher.updatedAt
                            ? new Date(selectedTeacher.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Rejection Date Unknown',
                        color: '#ef4444'
                      });
                      if (selectedTeacher.rejectionReason) {
                        events.push({
                          title: `Reason: ${selectedTeacher.rejectionReason}`,
                          date: '',
                          color: '#ef4444',
                          isNote: true
                        });
                      }
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Activity Timeline
                        </h4>

                        {events.length === 0 ? (
                          <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                            No activity recorded yet.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '16px' }}>
                            <div style={{ position: 'absolute', left: '5px', top: '6px', bottom: '6px', width: '2px', background: '#e2e8f0' }} />

                            {events.map((act, idx) => (
                              <div key={idx} style={{ position: 'relative' }}>
                                <div style={{
                                  position: 'absolute',
                                  left: '-16px',
                                  top: '4px',
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: act.color || '#4f46e5'
                                }} />
                                <div style={{ fontSize: '13px', fontWeight: act.isNote ? '400' : '600', color: act.isNote ? '#64748b' : '#0f172a', fontStyle: act.isNote ? 'italic' : 'normal' }}>{act.title}</div>
                                {act.date && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{act.date}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* DRAWER FOOTER QUICK ACTIONS */}
                <div style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Quick Actions
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Write a notification message..."
                        value={notificationText}
                        onChange={e => setNotificationText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12.5px',
                          outline: 'none',
                          background: '#ffffff'
                        }}
                      />
                      <button
                        onClick={() => handleSendNotification(selectedTeacher)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FaPaperPlane size={11} /> Send
                      </button>
                    </div>

                    <button
                      onClick={() => openEditModal(selectedTeacher)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      View Profile
                    </button>
                  </div>

                  {!(selectedTeacher.verified === true || selectedTeacher.status === 'approved' || selectedTeacher.status === 'verified') && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {selectedTeacher.status !== 'rejected' && (
                        <button
                          onClick={() => handleSubmitDecision(selectedTeacher, 'reject')}
                          style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: '1px solid #fca5a5',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Reject Teacher
                        </button>
                      )}
                      <button
                        onClick={() => handleSubmitDecision(selectedTeacher, 'approve')}
                        style={{
                          flex: 1,
                          padding: '9px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#10b981',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Approve Teacher
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* 5. ADD / EDIT TEACHER MODAL */}
      {modalOpen && (
        <ActionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTeacher ? 'Edit Teacher Profile' : 'Add New Teacher Profile'}
          onSubmit={handleAddEditSubmit}
          submitText={editingTeacher ? 'Save Changes' : 'Create Teacher'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. Gaurav Kumar"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                className="glass-input"
                placeholder="e.g. gaurav.kumar@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Subjects (Comma Separated)</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. Mathematics, Physics"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>
          </div>
        </ActionModal>
      )}

      {/* 6. RESCHEDULE INTERVIEW MODAL */}
      {rescheduleModalOpen && (
        <ActionModal
          isOpen={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          title="Reschedule Interview Session"
          onSubmit={handleRescheduleSubmit}
          submitText={reschedulingLoading ? 'Rescheduling...' : 'Confirm New Slot'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Select New Date & Time</label>
              <input
                type="datetime-local"
                className="glass-input"
                value={newScheduledAt}
                onChange={e => setNewScheduledAt(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Reschedule Reason (Optional)</label>
              <textarea
                className="glass-input"
                rows={3}
                placeholder="Reason for rescheduling candidate interview..."
                value={rescheduleReason}
                onChange={e => setRescheduleReason(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>
          </div>
        </ActionModal>
      )}

      {/* 7. AGORA VIDEO CALL MODAL */}
      {callModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#fff' }}>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>Live Teacher Interview Call</h2>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Channel: {callData?.channelName}</div>
            </div>
            <button
              onClick={handleStopAgoraStream}
              style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              End Call & Close
            </button>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: 0 }}>
            <div style={{ background: '#000', borderRadius: '12px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div ref={localVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                You (Admin)
              </span>
            </div>

            <div style={{ background: '#000', borderRadius: '12px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div ref={remoteVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {!remoteUserJoined && (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <FaVideo size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <div>Waiting for candidate to join...</div>
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                Teacher Candidate
              </span>
            </div>
          </div>

          {!joinedCall && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={handleStartAgoraStream}
                style={{ padding: '12px 28px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
              >
                Join & Start Video Stream
              </button>
            </div>
          )}
        </div>
      )}

      {/* 8. DOCUMENT IN-APP PREVIEW MODAL */}
      {previewDoc && (
        <ActionModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.label}`}
          submitText="Open in New Tab"
          onSubmit={() => {
            window.open(previewDoc.url, '_blank');
            setPreviewDoc(null);
          }}
          cancelText="Close"
        >
          <div style={{
            width: '100%',
            height: '60vh',
            minHeight: '450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            padding: 0
          }}>
            {previewDoc.url.toLowerCase().endsWith('.pdf') || previewDoc.file.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={previewDoc.url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Document Preview"
              />
            ) : (
              <img
                src={previewDoc.url}
                alt={previewDoc.label}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </ActionModal>
      )}

    </div>
  );
};

export default Teachers;
