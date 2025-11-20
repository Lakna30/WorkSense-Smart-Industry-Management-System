import axios from 'axios';
import { getToken } from './auth.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Employee API functions
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getDepartments: () => api.get('/employees/departments/list'),
  getJobTitles: () => api.get('/employees/job-titles/list')
};

//Schedule API functions
export const scheduleAPI = {
  getAll: () => api.get('/schedules'),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getEmployees: () => api.get('/schedules/employees/list'),
  getChecklist: (id) => api.get(`/schedules/${id}/checklist`),
  addChecklistItem: (id, data) => api.post(`/schedules/${id}/checklist`, data),
  updateChecklistItem: (id, itemId, data) => api.patch(`/schedules/${id}/checklist/${itemId}`, data),
  deleteChecklistItem: (id, itemId) => api.delete(`/schedules/${id}/checklist/${itemId}`)
};


export default api;

