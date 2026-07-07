import axios from 'axios';

const API_BASE_URL = 'https://vlm-app-backend.onrender.com/api/admin';

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
  if (status === 401) {
    // Leave redirect decision to caller (context/router usually owns it).
    return { status, message: 'Unauthorized', data: err?.response?.data };
  }
  if (status === 403) {
    return { status, message: 'Forbidden', data: err?.response?.data };
  }
  return { status: status || 500, message: 'Internal Server Error', data: err?.response?.data };
};

export const adminLogin = async ({ email, password }) => {
  const res = await api.post('/login', { email, password }, { headers: { Accept: 'application/json' } });
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

export const adminGetSpinSettings = async () => {
  const res = await api.get('/spin-settings', attachAuth());
  return res.data;
};

export const adminUpdateSpinSettings = async (rewards) => {
  const res = await api.post('/spin-settings', { rewards }, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

// Student CRUD operations
export const adminAddStudent = async (payload) => {
  const res = await api.post('/students', payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminUpdateStudentPoints = async (id, points) => {
  const res = await api.patch(`/students/${id}/points`, { points }, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminUpdateStudent = async (id, payload) => {
  const res = await api.put(`/students/${id}`, payload, attachAuth({ headers: { 'Content-Type': 'application/json' } }));
  return res.data;
};

export const adminDeleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`, attachAuth());
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
export const adminUploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload/pdf', formData, attachAuth({
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
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

