import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vlm-app-backend.onrender.com/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json'
  }
});

export const setAdminAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// Deprecated: keep file for backward compatibility.
// Real admin auth + admin API calls are implemented in ./adminAuthApi.js

export const adminLogin = () => Promise.reject(new Error('Use adminAuthApi.adminLogin instead'));

export const getAdminDashboard = () => Promise.reject(new Error('Use adminAuthApi.adminGetDashboard instead'));

export const getSpinSettings = () => Promise.reject(new Error('Use adminAuthApi.adminGetSpinSettings instead'));

export const updateSpinSettings = () => Promise.reject(new Error('Use adminAuthApi.adminUpdateSpinSettings instead'));


