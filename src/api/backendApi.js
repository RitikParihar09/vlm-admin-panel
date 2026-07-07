import axios from 'axios';

const API_BASE_URL = 'https://vlm-app-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getHealth = () => api.get('/health');
export const getStudents = () => api.get('/students');
export const getTeachers = () => api.get('/teachers');
export const getParents = () => api.get('/parents');
export const getAdminData = () => api.get('/admin/data');
export const getStudentDashboard = () => api.get('/student/dashboard');
export const getTeacherDashboard = () => api.get('/teacher/dashboard');
export const getParentDashboard = () => api.get('/parent/dashboard');

const backendApi = {
  setAuthToken,
  getHealth,
  getStudents,
  getTeachers,
  getParents,
  getAdminData,
  getStudentDashboard,
  getTeacherDashboard,
  getParentDashboard
};

export default backendApi;
