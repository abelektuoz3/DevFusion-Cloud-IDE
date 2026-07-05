// frontend/src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Workspace API
export const workspaceAPI = {
  create: (data) => api.post("/workspaces", data),
  getAll: () => api.get("/workspaces"),
  getById: (id) => api.get(`/workspaces/${id}`),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
};

// Folder API
export const folderAPI = {
  create: (workspaceId, data) => api.post(`/folders/${workspaceId}`, data),
  getById: (id) => api.get(`/folders/${id}`),
  update: (id, data) => api.put(`/folders/${id}`, data),
  delete: (id) => api.delete(`/folders/${id}`),
};

// File API
export const fileAPI = {
  create: (workspaceId, data) => api.post(`/files/${workspaceId}`, data),
  getById: (id) => api.get(`/files/${id}`),
  update: (id, data) => api.put(`/files/${id}`, data),
  rename: (id, data) => api.patch(`/files/${id}/rename`, data),
  delete: (id) => api.delete(`/files/${id}`),
  autosave: (id, data) => api.post(`/files/${id}/autosave`, data),
};

// Settings API
export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
  updateTheme: (theme) => api.patch("/settings/theme", { theme }),
};

// Notification API
export const notificationAPI = {
  get: (params) => api.get("/notifications", { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Search API
export const searchAPI = {
  search: (query, workspaceId) =>
    api.get("/search", { params: { q: query, workspaceId } }),
};

export default api;
