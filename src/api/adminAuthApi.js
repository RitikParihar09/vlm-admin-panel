import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://vlmacademy.in/api') + '/admin';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json'
  }
});

const getAdminToken = () => {
  try {
    return localStorage.getItem('adminToken') || '';
  } catch {
    return '';
  }
};

const attachAuth = (config = {}) => {
  const token = getAdminToken();
  const headers = { ...(config.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...config, headers };
};

const handleApiError = (err) => {
  const status = err?.response?.status;
  const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
  if (status === 401) {
    // Leave redirect decision to caller (context/router usually owns it).
    return { status, message: serverMsg || 'Unauthorized', data: err?.response?.data };
  }
  if (status === 403) {
    return { status, message: serverMsg || 'Forbidden', data: err?.response?.data };
  }
  return { status: status || 500, message: serverMsg || 'Internal Server Error', data: err?.response?.data };
};

export const adminLogin = async ({ email, password }) => {
  const res = await api.post('/login', { email, password }, { headers: { Accept: 'application/json' } });
  return res.data;
};

export const adminGetMe = async () => {
  const res = await api.get('/me', attachAuth());
  return res.data;
};

export const adminGetDashboard = async () => {
  const res = await api.get('/dashboard', attachAuth());
  return res.data;
};

export const adminGetStudents = async () => {
  const res = await api.get('/students', attachAuth());
  return res.data;
};

export const adminGetTeachers = async () => {
  const res = await api.get('/teachers', attachAuth());
  return res.data;
};

export const adminGetParents = async () => {
  const res = await api.get('/parents', attachAuth());
  return res.data;
};

export const adminGetFinancials = async () => {
  const res = await api.get('/financials', attachAuth());
  return res.data;
};

export const adminGetWithdrawals = async () => {
  const res = await api.get('/withdrawals', attachAuth());
  return res.data;
};

export const adminGetResources = async () => {
  const res = await api.get('/resources', attachAuth());
  return res.data;
};

export const adminCreateResource = async (payload) => {
  const res = await api.post('/resources', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminDeleteResource = async (id) => {
  const res = await api.delete(`/resources/${id}`, attachAuth());
  return res.data;
};

export const adminUpdateResource = async (id, payload) => {
  const res = await api.put(`/resources/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminDeleteSubject = async (className, subjectId) => {
  const res = await api.delete(`/study-library/${className}/subjects/${subjectId}`, attachAuth());
  return res.data;
};

export const adminGetSpinSettings = async () => {
  const res = await api.get('/spin-settings', attachAuth());
  return res.data;
};

export const adminUpdateSpinSettings = async (payload) => {
  const res = await api.post('/spin-settings', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

// Student CRUD operations
export const adminAddStudent = async (payload) => {
  const res = await api.post('/students', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};



export const adminUpdateStudent = async (id, payload) => {
  console.log('[DEBUG] adminUpdateStudent - ID:', id, 'Payload:', payload);
  const res = await api.put(`/students/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  console.log('[DEBUG] adminUpdateStudent - Response:', res.data);
  return res.data;
};

export const adminDeleteStudent = async (id) => {
  console.log('[DEBUG] adminDeleteStudent - ID:', id);
  const res = await api.delete(`/students/${id}`, attachAuth());
  console.log('[DEBUG] adminDeleteStudent - Response:', res.data);
  return res.data;
};

// Teacher CRUD operations
export const adminAddTeacher = async (payload) => {
  const res = await api.post('/teachers', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminUpdateTeacher = async (id, payload) => {
  const res = await api.put(`/teachers/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminDeleteTeacher = async (id) => {
  const res = await api.delete(`/teachers/${id}`, attachAuth());
  return res.data;
};

// Parent CRUD operations
export const adminAddParent = async (payload) => {
  const res = await api.post('/parents', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminUpdateParent = async (id, payload) => {
  const res = await api.put(`/parents/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminDeleteParent = async (id) => {
  const res = await api.delete(`/parents/${id}`, attachAuth());
  return res.data;
};

// Study Library API operations
export const adminGetStudyLibrary = async () => {
  const res = await api.get('/study-library', attachAuth());
  return res.data;
};

export const adminAddSubject = async (className, subjectName) => {
  const res = await api.post('/study-library/subjects', { className, subjectName }, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminAddNote = async (className, subjectId, noteData) => {
  const res = await api.post(`/study-library/${className}/subjects/${subjectId}/notes`, noteData, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

// File upload for PDF
export const adminUploadPdf = async (file, className = '', subjectName = '') => {
  const formData = new FormData();
  formData.append('file', file);
  
  let url = '/upload/pdf';
  const queryParams = [];
  if (className) queryParams.push(`className=${encodeURIComponent(className)}`);
  if (subjectName) queryParams.push(`subject=${encodeURIComponent(subjectName)}`);
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }

  const res = await api.post(url, formData, attachAuth());
  return res.data;
};

// Employee Management API operations
export const adminGetEmployees = async () => {
  const res = await api.get('/employees', attachAuth());
  return res.data;
};

export const adminCreateEmployee = async (payload) => {
  const res = await api.post('/employees', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminUpdateEmployee = async (id, payload) => {
  const res = await api.put(`/employees/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminDeleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`, attachAuth());
  return res.data;
};

// Integrations Manager API Operations
export const adminGetIntegrations = async () => {
  const res = await api.get('/integrations', attachAuth());
  return res.data;
};

export const adminUpdateIntegration = async (key, payload) => {
  const res = await api.put(`/integrations/${key}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminTestIntegration = async (key) => {
  const res = await api.post(`/integrations/${key}/test`, {}, attachAuth());
  return res.data;
};

// Banner Ads API Operations
export const adminGetBanners = async () => {
  const res = await api.get('/banners', attachAuth());
  return res.data;
};

export const adminCreateBanner = async (formData) => {
  const res = await api.post('/banners', formData, attachAuth());
  return res.data;
};

export const adminUpdateBanner = async (id, formData) => {
  const res = await api.put(`/banners/${id}`, formData, attachAuth());
  return res.data;
};

export const adminDeleteBanner = async (id) => {
  const res = await api.delete(`/banners/${id}`, attachAuth());
  return res.data;
};

export const adminReorderBanners = async (reorderPayload) => {
  const res = await api.put('/banners/reorder', { items: reorderPayload }, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

// Onboarding Slides API Operations
export const adminGetOnboardingSlides = async () => {
  const res = await api.get('/onboarding-slides', attachAuth());
  return res.data;
};

export const adminCreateOnboardingSlide = async (formData) => {
  const res = await api.post('/onboarding-slides', formData, attachAuth());
  return res.data;
};

export const adminUpdateOnboardingSlide = async (id, formData) => {
  const res = await api.put(`/onboarding-slides/${id}`, formData, attachAuth());
  return res.data;
};

export const adminDeleteOnboardingSlide = async (id) => {
  const res = await api.delete(`/onboarding-slides/${id}`, attachAuth());
  return res.data;
};

// System Settings API Operations
export const adminGetSettings = async () => {
  const res = await api.get('/settings', attachAuth());
  return res.data;
};

export const adminUpdateSetting = async (key, value) => {
  const res = await api.put('/settings', { key, value }, attachAuth());
  return res.data;
};

// Subscription Plans Management
export const adminGetPlans = async () => {
  const res = await api.get('/plans', attachAuth());
  return res.data;
};
export const adminCreatePlan = async (payload) => {
  const res = await api.post('/plans', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};
export const adminUpdatePlan = async (id, payload) => {
  const res = await api.put(`/plans/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};
export const adminDeletePlan = async (id) => {
  const res = await api.delete(`/plans/${id}`, attachAuth());
  return res.data;
};

export const adminGetTrials = async (status = 'all') => {
  const res = await api.get(`/plans/trials`, attachAuth({ params: { status } }));
  return res.data;
};

// Student Subscription Management
export const adminUpdateStudentSubscription = async (id, payload) => {
  const res = await api.put(`/students/${id}/subscription`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

// Short Videos Management
export const adminGetVideos = async (status = '') => {
  const res = await api.get('/videos', attachAuth({ params: { status, limit: 100 } }));
  return res.data;
};
export const adminApproveVideo = async (id) => {
  const res = await api.post(`/videos/${id}/approve`, {}, attachAuth());
  return res.data;
};
export const adminRejectVideo = async (id, reason) => {
  const res = await api.post(`/videos/${id}/reject`, { reason }, attachAuth());
  return res.data;
};
export const adminDeleteVideo = async (id) => {
  const res = await api.delete(`/videos/${id}`, attachAuth());
  return res.data;
};

export const safeAdminCall = async (fn) => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    const mapped = handleApiError(err);
    return { ok: false, error: mapped };
  }
};

