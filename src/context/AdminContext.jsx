import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  adminLogin,
  adminGetDashboard,
  adminGetStudents,
  adminGetTeachers,
  adminGetParents,
  adminGetFinancials,
  adminGetWithdrawals,
  adminGetResources,
  adminCreateResource,
  adminDeleteResource,
  adminGetSpinSettings,
  adminUpdateSpinSettings,
  adminAddStudent,
  adminUpdateStudent,
  adminDeleteStudent,
  adminAddTeacher,
  adminUpdateTeacher,
  adminDeleteTeacher,
  adminAddParent,
  adminUpdateParent,
  adminDeleteParent,
  adminGetStudyLibrary,
  adminAddSubject,
  adminAddNote,
  adminUploadPdf,
  safeAdminCall
} from '../api/adminAuthApi';

const AdminContext = createContext(null);

const normalizeStudents = (data) => {
  const payload = data?.data ?? data;
  const list = Array.isArray(payload?.students)
    ? payload.students
    : Array.isArray(payload)
      ? payload
      : [];

  return list.map((st) => ({
    _id: st._id || st.id || '',
    id: st._id || st.id || '',
    name: st.name || st.fullName || st.full_name || `${st.firstName || ''} ${st.lastName || ''}`.trim(),
    email: st.email || st.emailId || st.email_address,
    phone: st.phone || st.phoneNumber,
    grade: st.grade || st.class || st.standard || st.className,
    rewardPoints: st.wallet?.totalPoints ?? st.rewardPoints ?? st.points ?? 0,
    wallet: st.wallet || {},
    vlmStudentId: st.vlmStudentId || st.vlm_id || st.studentId || undefined,
    leaderboardRank: st.leaderboardRank ?? st.rank ?? 0,
    parentIds: st.parentIds || st.parents || [],
    status: st.status || 'active'
  }));
};

const normalizeTeachers = (data) => {
  const payload = data?.data ?? data;
  const list = Array.isArray(payload?.teachers)
    ? payload.teachers
    : Array.isArray(payload)
      ? payload
      : [];

  return list.map((tr) => ({
    _id: tr._id || tr.id || '',
    id: tr._id || tr.id || '',
    name: tr.name || tr.fullName || tr.full_name,
    email: tr.email || tr.emailId || tr.email_address,
    subject: tr.subject || (Array.isArray(tr.subjects) ? tr.subjects[0] : undefined),
    wallet: tr.wallet || {},
    rating: tr.rating,
    activeClasses: tr.activeClasses,
    vlmTeacherId: tr.vlmTeacherId || tr.vlm_id || tr.teacherId || undefined,
    status: tr.status || 'active'
  }));
};

const normalizeParents = (data) => {
  const payload = data?.data ?? data;
  const list = Array.isArray(payload?.parents)
    ? payload.parents
    : Array.isArray(payload)
      ? payload
      : [];

  return list.map((pa) => ({
    _id: pa._id || pa.id || '',
    id: pa._id || pa.id || '',
    name: pa.name || pa.fullName || pa.full_name,
    email: pa.email || pa.emailId || pa.email_address,
    phone: pa.phone || pa.mobile || pa.contact,
    children: pa.children || pa.studentIds || []
  }));
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || 'null');
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem('adminToken') || '';
    } catch {
      return '';
    }
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);

  const [financials, setFinancials] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [resources, setResources] = useState([]);
  const [doubts, setDoubts] = useState([]);
  // Default study library structure
  const defaultStudyLibrary = [
    {
      className: 'Class 1',
      subjects: [
        { id: 'math-1', name: 'Mathematics', notes: [] },
        { id: 'sci-1', name: 'Science', notes: [] },
        { id: 'eng-1', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 2',
      subjects: [
        { id: 'math-2', name: 'Mathematics', notes: [] },
        { id: 'sci-2', name: 'Science', notes: [] },
        { id: 'eng-2', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 3',
      subjects: [
        { id: 'math-3', name: 'Mathematics', notes: [] },
        { id: 'sci-3', name: 'Science', notes: [] },
        { id: 'eng-3', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 4',
      subjects: [
        { id: 'math-4', name: 'Mathematics', notes: [] },
        { id: 'sci-4', name: 'Science', notes: [] },
        { id: 'eng-4', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 5',
      subjects: [
        { id: 'math-5', name: 'Mathematics', notes: [] },
        { id: 'sci-5', name: 'Science', notes: [] },
        { id: 'eng-5', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 6',
      subjects: [
        { id: 'math-6', name: 'Mathematics', notes: [] },
        { id: 'sci-6', name: 'Science', notes: [] },
        { id: 'eng-6', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 7',
      subjects: [
        { id: 'math-7', name: 'Mathematics', notes: [] },
        { id: 'sci-7', name: 'Science', notes: [] },
        { id: 'eng-7', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 8',
      subjects: [
        { id: 'math-8', name: 'Mathematics', notes: [] },
        { id: 'sci-8', name: 'Science', notes: [] },
        { id: 'eng-8', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 9',
      subjects: [
        { id: 'math-9', name: 'Mathematics', notes: [] },
        { id: 'sci-9', name: 'Science', notes: [] },
        { id: 'eng-9', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 10',
      subjects: [
        { id: 'math-10', name: 'Mathematics', notes: [] },
        { id: 'sci-10', name: 'Science', notes: [] },
        { id: 'eng-10', name: 'English', notes: [] }
      ]
    },
    {
      className: 'Class 11',
      subjects: [
        { id: 'math-11', name: 'Mathematics', notes: [] },
        { id: 'sci-11', name: 'Physics', notes: [] },
        { id: 'chem-11', name: 'Chemistry', notes: [] }
      ]
    },
    {
      className: 'Class 12',
      subjects: [
        { id: 'math-12', name: 'Mathematics', notes: [] },
        { id: 'sci-12', name: 'Physics', notes: [] },
        { id: 'chem-12', name: 'Chemistry', notes: [] }
      ]
    }
  ];

  const [studyLibrary, setStudyLibrary] = useState(defaultStudyLibrary);

  const [spinSettings, setSpinSettings] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const hasAuth = !!adminToken && !!adminUser;

  // Prevent duplicate refreshAll calls (especially during StrictMode double-invoke)
  // by ensuring we only refresh once per successful login state.
  const refreshGuardRef = React.useRef(false);

  useEffect(() => {
    try {
      if (adminToken) localStorage.setItem('adminToken', adminToken);
      else localStorage.removeItem('adminToken');
    } catch {
      // ignore
    }
  }, [adminToken]);


  useEffect(() => {
    try {
      if (adminUser) localStorage.setItem('adminUser', JSON.stringify(adminUser));
      else localStorage.removeItem('adminUser');
    } catch {
      // ignore
    }
  }, [adminUser]);

  // Fetch everything needed by the visible admin pages.
  const refreshAll = async () => {
    if (!hasAuth) return;

    setGlobalLoading(true);
    setGlobalError('');

    const results = await Promise.all([
      safeAdminCall(adminGetDashboard),
      safeAdminCall(adminGetStudents),
      safeAdminCall(adminGetTeachers),
      safeAdminCall(adminGetParents),
      safeAdminCall(adminGetFinancials),
      safeAdminCall(adminGetWithdrawals),
      safeAdminCall(adminGetResources)
    ]);

    const [rDash, rStudents, rTeachers, rParents, rFinancials, rWithdrawals, rResources] = results;

    if (!rDash.ok) setGlobalError(rDash.error?.message || 'Failed to load dashboard');
    if (rDash.ok) setDashboard(rDash.data?.data ?? rDash.data ?? null);

    if (rStudents.ok) setStudents(normalizeStudents(rStudents.data));
    if (!rStudents.ok && !rDash.ok) setGlobalError(rStudents.error?.message || 'Failed to load students');

    if (rTeachers.ok) setTeachers(normalizeTeachers(rTeachers.data));
    if (!rTeachers.ok && !rDash.ok) setGlobalError(rTeachers.error?.message || 'Failed to load teachers');

    if (rParents.ok) setParents(normalizeParents(rParents.data));
    if (!rParents.ok && !rDash.ok) setGlobalError(rParents.error?.message || 'Failed to load parents');

    if (rFinancials.ok) setFinancials(rFinancials.data?.data ?? rFinancials.data ?? null);
    if (rWithdrawals.ok) setWithdrawals(rWithdrawals.data?.data ?? rWithdrawals.data ?? []);
    if (rResources.ok) setResources(rResources.data?.data ?? rResources.data ?? []);

    setGlobalLoading(false);
  };

  useEffect(() => {
    if (!hasAuth) {
      refreshGuardRef.current = false;
      return;
    }

    if (refreshGuardRef.current) return;
    refreshGuardRef.current = true;

    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAuth]);


  const loginAdmin = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');

    const result = await safeAdminCall(() => adminLogin({ email, password }));
    if (!result.ok) {
      setAuthLoading(false);
      // If backend returns success:false but no status, map it.
      setAuthError(result.error?.message || 'Login failed');
      return false;
    }

    const token = result.data?.token || result.data?.accessToken;
    const user = result.data?.user;

    if (!token || !user) {
      setAuthLoading(false);
      setAuthError('Invalid login response');
      return false;
    }


    setAdminToken(token);
    setAdminUser(user);
    setAuthLoading(false);
    return true;
  };

  const logoutAdmin = () => {
    setAdminToken('');
    setAdminUser(null);
    setDashboard(null);
    setStudents([]);
    setTeachers([]);
    setParents([]);
    setFinancials(null);
    setWithdrawals([]);
    setResources([]);
    setStudyLibrary([]);
    setSpinSettings(null);
    // allow refreshAll to run again on next login
    refreshGuardRef.current = false;
  };

  const fetchStudyLibrary = async () => {
    const res = await safeAdminCall(() => adminGetStudyLibrary());
    if (res.ok) setStudyLibrary(res.data?.data ?? res.data ?? []);
    else setGlobalError(res.error?.message || 'Failed to load study library');
  };


  const updateSpin = async (rewards) => {
    const res = await safeAdminCall(() => adminUpdateSpinSettings(rewards));
    if (res.ok) {
      setSpinSettings(res.data?.data ?? res.data ?? null);
      return true;
    }
    setGlobalError(res.error?.message || 'Failed to update spin settings');
    return false;
  };

  const fetchSpin = async () => {
    const res = await safeAdminCall(() => adminGetSpinSettings());
    if (res.ok) setSpinSettings(res.data?.data ?? res.data ?? null);
    else setGlobalError(res.error?.message || 'Failed to load spin settings');
  };

  const createResource = async (payload) => {
    const res = await safeAdminCall(() => adminCreateResource(payload));
    if (!res.ok) {
      setGlobalError(res.error?.message || 'Failed to create resource');
      return false;
    }
    await refreshAll();
    return true;
  };

  const deleteResource = async (id) => {
    const res = await safeAdminCall(() => adminDeleteResource(id));
    if (!res.ok) {
      setGlobalError(res.error?.message || 'Failed to delete resource');
      return false;
    }
    await refreshAll();
    return true;
  };

  const value = useMemo(
    () => ({
      // Auth
      adminUser,
      adminToken,
      hasAuth,
      loginAdmin,
      logoutAdmin,
      authLoading,
      authError,

      // Global loads
      globalLoading,
      globalError,

      // Dashboard
      dashboard,
      dashboardStats: {
        totalStudents: dashboard?.totalStudents ?? 0,
        activeStudents: dashboard?.activeStudents ?? 0,
        totalTeachers: dashboard?.totalTeachers ?? 0,
        activeTeachers: dashboard?.activeTeachers ?? 0,
        totalParents: dashboard?.totalParents ?? 0,
        pendingDoubts: dashboard?.pendingDoubts ?? 0,
        pendingTeacherApprovals: dashboard?.pendingTeacherApprovals ?? 0
      },

      // Data
      students,
      teachers,
      parents,
      financials,
      withdrawals,
      resources,
      doubts,
      studyLibrary,

      // Spin
      spinSettings,
      fetchSpin,
      updateSpinSettings: updateSpin,

      // Study Library
      fetchStudyLibrary,

      // Resources
      createResource,
      deleteResource,

      // File Upload
      uploadPdf: async (file) => {
        const res = await safeAdminCall(() => adminUploadPdf(file));
        if (!res.ok) {
          setGlobalError(res.error?.message || 'Failed to upload PDF');
          return null;
        }
        return res.data;
      },

      // Kept for UI compatibility: no-op mutations (backend write endpoints not specified in task for students/teachers/etc.)
      updateAdminUser: (u) => setAdminUser((prev) => ({ ...(prev || {}), ...(u || {}) })),

// Student CRUD operations
      addStudent: async (payload) => {
        const res = await safeAdminCall(() => adminAddStudent(payload));
        if (!res.ok) {
          setGlobalError(res.error?.message || 'Failed to add student');
          return false;
        }
        await refreshAll();
        return true;
      },
updateStudent: async (id, payload) => {
        console.log('[DEBUG] updateStudent - ID:', id, 'Payload:', payload);
        const res = await safeAdminCall(() => adminUpdateStudent(id, payload));
        if (!res.ok) {
          console.log('[DEBUG] updateStudent - Error:', res.error);
          setGlobalError(res.error?.message || 'Failed to update student');
          return false;
        }
        await refreshAll();
        return true;
      },

      deleteStudent: async (id) => {
        console.log('[DEBUG] deleteStudent - ID:', id);
        const res = await safeAdminCall(() => adminDeleteStudent(id));
        if (!res.ok) {
          console.log('[DEBUG] deleteStudent - Error:', res.error);
          setGlobalError(res.error?.message || 'Failed to delete student');
          return false;
        }
        await refreshAll();
        return true;
      },

// Teacher CRUD operations
      addTeacher: async (payload) => {
        const res = await safeAdminCall(() => adminAddTeacher(payload));
        if (!res.ok) {
          setGlobalError(res.error?.message || 'Failed to add teacher');
          return false;
        }
        await refreshAll();
        return true;
      },
      updateTeacher: async (id, payload) => {
        console.log('[DEBUG] updateTeacher - ID:', id, 'Payload:', payload);
        const res = await safeAdminCall(() => adminUpdateTeacher(id, payload));
        if (!res.ok) {
          console.log('[DEBUG] updateTeacher - Error:', res.error);
          setGlobalError(res.error?.message || 'Failed to update teacher');
          return false;
        }
        await refreshAll();
        return true;
      },
      deleteTeacher: async (id) => {
        console.log('[DEBUG] deleteTeacher - ID:', id);
        const res = await safeAdminCall(() => adminDeleteTeacher(id));
        if (!res.ok) {
          console.log('[DEBUG] deleteTeacher - Error:', res.error);
          setGlobalError(res.error?.message || 'Failed to delete teacher');
          return false;
        }
        await refreshAll();
        return true;
      },

      // Parent CRUD operations
      addParent: async (payload) => {
        const res = await safeAdminCall(() => adminAddParent(payload));
        if (!res.ok) {
          setGlobalError(res.error?.message || 'Failed to add parent');
          return false;
        }
        await refreshAll();
        return true;
      },
      updateParent: async (id, payload) => {
        console.log('[DEBUG] updateParent - ID:', id, 'Payload:', payload);
        const res = await safeAdminCall(() => adminUpdateParent(id, payload));
        if (!res.ok) {
          console.log('[DEBUG] updateParent - Error:', res.error);
          setGlobalError(res.error?.message || 'Failed to update parent');
          return false;
        }
        await refreshAll();
        return true;
      },
      deleteParent: async (id) => {
        console.log('[DEBUG] deleteParent - ID:', id);
        const res = await safeAdminCall(() => adminDeleteParent(id));
        if (!res.ok) {
          console.log('[DEBUG] deleteParent - Error:', res.error);
          setGlobalError(res.error?.message || 'Failed to delete parent');
          return false;
        }
        await refreshAll();
        return true;
      },

      // Study Library operations
      addSubjectToClass: async (className, subjectName) => {
        // Generate a unique ID for the subject
        const newSubjectId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newSubject = { id: newSubjectId, name: subjectName, notes: [] };
        
        // Try API call, but update local state regardless
        try {
          const res = await safeAdminCall(() => adminAddSubject(className, subjectName));
          if (res.ok) {
            const apiSubject = res.data?.data ?? res.data ?? newSubject;
            setStudyLibrary(prev => {
              const existingClass = prev.find(c => c.className === className);
              if (existingClass) {
                return prev.map(c => c.className === className 
                  ? { ...c, subjects: [...(c.subjects || []), apiSubject] }
                  : c
                );
              }
              return [...prev, { className, subjects: [apiSubject] }];
            });
            return apiSubject;
          }
        } catch (e) {
          // API failed, but we still update local state
        }
        
        // Update local state
        setStudyLibrary(prev => {
          const existingClass = prev.find(c => c.className === className);
          if (existingClass) {
            return prev.map(c => c.className === className 
              ? { ...c, subjects: [...(c.subjects || []), newSubject] }
              : c
            );
          }
          return [...prev, { className, subjects: [newSubject] }];
        });
        return newSubject;
      },
      addResourceToSubject: async (className, subjectId, resourceData) => {
        // Generate a unique ID for the note
        const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNote = { id: noteId, ...resourceData };
        
        // Try API call, but update local state regardless
        try {
          const res = await safeAdminCall(() => adminAddNote(className, subjectId, resourceData));
          if (res.ok) {
            const apiNote = res.data?.data ?? res.data ?? newNote;
            setStudyLibrary(prev => 
              prev.map(c => c.className === className
                ? {
                    ...c,
                    subjects: c.subjects?.map(s => s.id === subjectId
                      ? { ...s, notes: [...(s.notes || []), apiNote] }
                      : s
                    ) || []
                  }
                : c
              )
            );
            return true;
          }
        } catch (e) {
          // API failed, but we still update local state
        }
        
        // Update local state
        setStudyLibrary(prev => 
          prev.map(c => c.className === className
            ? {
                ...c,
                subjects: c.subjects?.map(s => s.id === subjectId
                  ? { ...s, notes: [...(s.notes || []), newNote] }
                  : s
                ) || []
              }
            : c
          )
        );
        return true;
      },

      // Other no-op mutations (backend write endpoints not specified)
      addLiveClass: () => {},
      updateLiveClass: () => {},
      deleteLiveClass: () => {},
      addStudyMaterial: () => {},
      deleteStudyMaterial: () => {},
      addNoteToSubject: () => {},
      addMcqTask: () => {},
      deleteMcqTask: () => {},
      updateDoubt: () => {},
      addShortVideo: () => {},
      deleteShortVideo: () => {}
    }),
    [
      adminUser,
      adminToken,
      hasAuth,
      authLoading,
      authError,
      globalLoading,
      globalError,
      dashboard,
      students,
      teachers,
      parents,
      financials,
      withdrawals,
      resources,
      studyLibrary,
      spinSettings
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);

