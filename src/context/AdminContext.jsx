import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  adminLogin,
  adminGetMe,
  adminGetDashboard,
  adminGetStudents,
  adminGetTeachers,
  adminGetParents,
  adminGetFinancials,
  adminGetWithdrawals,
  adminGetResources,
  adminCreateResource,
  adminDeleteResource,
  adminUpdateResource,
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
  adminDeleteSubject,
  adminAddNote,
  adminUploadPdf,
  adminGetEmployees,
  adminCreateEmployee,
  adminUpdateEmployee,
  adminDeleteEmployee,
  adminGetIntegrations,
  adminUpdateIntegration,
  adminTestIntegration,
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminReorderBanners,
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
  const [employees, setEmployees] = useState([]);

  const [financials, setFinancials] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [resources, setResources] = useState([]);
  const [doubts, setDoubts] = useState([]);
  // Default study library structure
  const defaultStudyLibrary = [
    { className: 'Class 1', subjects: [] },
    { className: 'Class 2', subjects: [] },
    { className: 'Class 3', subjects: [] },
    { className: 'Class 4', subjects: [] },
    { className: 'Class 5', subjects: [] },
    { className: 'Class 6', subjects: [] },
    { className: 'Class 7', subjects: [] },
    { className: 'Class 8', subjects: [] },
    { className: 'Class 9', subjects: [] },
    { className: 'Class 10', subjects: [] },
    { className: 'Class 11', subjects: [] },
    { className: 'Class 12', subjects: [] }
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

    // Load/refresh current user details to get isSuperAdmin and permissions
    let currentUser = adminUser;
    const rMe = await safeAdminCall(adminGetMe);
    if (rMe.ok && rMe.data?.data) {
      currentUser = rMe.data.data;
      setAdminUser(rMe.data.data);
    } else if (!rMe.ok && (rMe.status === 401 || rMe.error?.status === 401 || rMe.error?.message?.includes('Unauthorized') || rMe.error?.message?.includes('401'))) {
      logoutAdmin();
      setGlobalLoading(false);
      return;
    }

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

    if (currentUser?.isSuperAdmin || currentUser?.permissions?.includes('employees')) {
      const rEmployees = await safeAdminCall(adminGetEmployees);
      if (rEmployees.ok) setEmployees(rEmployees.data?.data ?? rEmployees.data ?? []);
    }

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
    if (res.ok) {
      const rawData = res.data?.data ?? res.data ?? [];
      const normalized = (rawData || []).map(cls => ({
        ...cls,
        subjects: (cls.subjects || []).map(sub => ({
          ...sub,
          notes: (sub.notes || []).map(note => ({
            id: note._id || note.id,
            title: note.title,
            content: note.description || note.content || 'No description provided.',
            link: note.pdfUrl || note.fileUrl || note.link || '',
            resourceType: note.resourceType === 'notes' ? 'note' : note.resourceType === 'videos' ? 'video' : note.resourceType === 'previous_year_papers' ? 'pyq' : note.resourceType || 'note',
            board: note.board || 'CBSE',
            visibility: note.visibility || 'active'
          }))
        }))
      }));
      setStudyLibrary(normalized);
    } else {
      setGlobalError(res.error?.message || 'Failed to load study library');
    }
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

  const addEmployee = async (payload) => {
    const res = await safeAdminCall(() => adminCreateEmployee(payload));
    if (!res.ok) {
      setGlobalError(res.error?.message || 'Failed to create employee');
      return false;
    }
    await refreshAll();
    return true;
  };

  const updateEmployee = async (id, payload) => {
    const res = await safeAdminCall(() => adminUpdateEmployee(id, payload));
    if (!res.ok) {
      setGlobalError(res.error?.message || 'Failed to update employee');
      return false;
    }
    await refreshAll();
    return true;
  };

  const deleteEmployee = async (id) => {
    const res = await safeAdminCall(() => adminDeleteEmployee(id));
    if (!res.ok) {
      setGlobalError(res.error?.message || 'Failed to delete employee');
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
      uploadPdf: async (file, className = '', subjectName = '') => {
        return safeAdminCall(() => adminUploadPdf(file, className, subjectName));
      },

      // Employees
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,

      // Integrations
      getIntegrations: async () => {
        return safeAdminCall(() => adminGetIntegrations());
      },
      updateIntegration: async (key, payload) => {
        return safeAdminCall(() => adminUpdateIntegration(key, payload));
      },
      testIntegration: async (key) => {
        return safeAdminCall(() => adminTestIntegration(key));
      },

      // Banners
      getBanners: async () => {
        return safeAdminCall(() => adminGetBanners());
      },
      createBanner: async (formData) => {
        return safeAdminCall(() => adminCreateBanner(formData));
      },
      updateBanner: async (id, formData) => {
        return safeAdminCall(() => adminUpdateBanner(id, formData));
      },
      deleteBanner: async (id) => {
        return safeAdminCall(() => adminDeleteBanner(id));
      },
      reorderBanners: async (payload) => {
        return safeAdminCall(() => adminReorderBanners(payload));
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
        
        // Map frontend keys to backend expected format
        let apiResourceType = resourceData.resourceType;
        if (resourceData.resourceType === 'note') apiResourceType = 'notes';
        else if (resourceData.resourceType === 'video') apiResourceType = 'videos';
        else if (resourceData.resourceType === 'pyq') apiResourceType = 'previous_year_papers';

        const apiPayload = {
          title: resourceData.title,
          content: resourceData.content,
          resourceType: apiResourceType,
          board: resourceData.board || 'CBSE',
          visibility: resourceData.visibility || 'active',
          link: resourceData.link
        };

        // Try API call
        try {
          const res = await safeAdminCall(() => adminAddNote(className, subjectId, apiPayload));
          if (res.ok) {
            const rawNote = res.data?.data ?? res.data ?? newNote;
            const apiNote = {
              id: rawNote._id || rawNote.id || newNote.id,
              title: rawNote.title || newNote.title,
              content: rawNote.description || rawNote.content || newNote.content,
              link: rawNote.pdfUrl || rawNote.fileUrl || rawNote.link || newNote.link,
              resourceType: resourceData.resourceType,
              board: rawNote.board || newNote.board,
              visibility: rawNote.visibility || newNote.visibility
            };

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
        
        // Update local state fallback
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
      deleteResourceFromSubject: async (className, subjectId, noteId) => {
        try {
          const res = await safeAdminCall(() => adminDeleteResource(noteId));
          if (res.ok) {
            setStudyLibrary(prev => 
              prev.map(c => c.className === className
                ? {
                    ...c,
                    subjects: c.subjects?.map(s => s.id === subjectId
                      ? { ...s, notes: (s.notes || []).filter(n => n.id !== noteId) }
                      : s
                    ) || []
                  }
                : c
              )
            );
            return true;
          }
        } catch (e) {
          // fallback
        }
        setStudyLibrary(prev => 
          prev.map(c => c.className === className
            ? {
                ...c,
                subjects: c.subjects?.map(s => s.id === subjectId
                  ? { ...s, notes: (s.notes || []).filter(n => n.id !== noteId) }
                  : s
                ) || []
              }
            : c
          )
        );
        return true;
      },
      updateResourceInSubject: async (className, subjectId, noteId, resourceData) => {
        let apiResourceType = resourceData.resourceType;
        if (resourceData.resourceType === 'note') apiResourceType = 'notes';
        else if (resourceData.resourceType === 'video') apiResourceType = 'videos';
        else if (resourceData.resourceType === 'pyq') apiResourceType = 'previous_year_papers';

        const apiPayload = {
          title: resourceData.title,
          content: resourceData.content,
          resourceType: apiResourceType,
          board: resourceData.board || 'CBSE',
          visibility: resourceData.visibility || 'active',
          link: resourceData.link
        };

        try {
          const res = await safeAdminCall(() => adminUpdateResource(noteId, apiPayload));
          if (res.ok) {
            const rawNote = res.data?.data ?? res.data ?? apiPayload;
            const apiNote = {
              id: rawNote._id || rawNote.id || noteId,
              title: rawNote.title || resourceData.title,
              content: rawNote.description || rawNote.content || resourceData.content,
              link: rawNote.pdfUrl || rawNote.fileUrl || rawNote.link || resourceData.link,
              resourceType: resourceData.resourceType,
              board: rawNote.board || resourceData.board || 'CBSE',
              visibility: rawNote.visibility || resourceData.visibility || 'active'
            };

            setStudyLibrary(prev => 
              prev.map(c => c.className === className
                ? {
                    ...c,
                    subjects: c.subjects?.map(s => s.id === subjectId
                      ? { ...s, notes: (s.notes || []).map(n => n.id === noteId ? apiNote : n) }
                      : s
                    ) || []
                  }
                : c
              )
            );
            return true;
          }
        } catch (e) {
          // fallback
        }

        setStudyLibrary(prev => 
          prev.map(c => c.className === className
            ? {
                ...c,
                subjects: c.subjects?.map(s => s.id === subjectId
                  ? { ...s, notes: (s.notes || []).map(n => n.id === noteId ? { ...n, ...resourceData } : n) }
                  : s
                ) || []
              }
            : c
          )
        );
        return true;
      },
      deleteSubjectFromClass: async (className, subjectId) => {
        try {
          const res = await safeAdminCall(() => adminDeleteSubject(className, subjectId));
          if (res.ok) {
            setStudyLibrary(prev => 
              prev.map(c => c.className === className
                ? { ...c, subjects: (c.subjects || []).filter(s => s.id !== subjectId) }
                : c
              )
            );
            return true;
          }
        } catch (e) {
          // fallback
        }
        setStudyLibrary(prev => 
          prev.map(c => c.className === className
            ? { ...c, subjects: (c.subjects || []).filter(s => s.id !== subjectId) }
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
      spinSettings,
      employees
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);

