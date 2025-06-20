import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token (for backward compatibility)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // If refresh fails, broadcast an auth error
      if (originalRequest.url === "/api/auth/refresh") {
        window.dispatchEvent(new Event("auth-error"));
        return Promise.reject(error);
      }

      // Queue subsequent requests while token is refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          api
            .post("/api/auth/refresh")
            .then(() => {
              processQueue(null);
              resolve(api(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              window.dispatchEvent(new Event("auth-error"));
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  refresh: () => api.post("/api/auth/refresh"),
  getProfile: () => api.get("/api/auth/me"),
  validateToken: () => api.post("/api/auth/validate"),
  logout: () => api.post("/api/auth/logout"),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get("/api/events"),
  getDashboardEvents: () => api.get("/api/events/dashboard"),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (eventData) => api.post("/api/events", eventData),
  update: (id, eventData) => api.put(`/api/events/${id}`, eventData),
  delete: (id) => api.delete(`/api/events/${id}`),
  join: (id) => api.post(`/api/events/${id}/join`),
  getCurrentUserParticipantId: (id) => api.get(`/api/events/${id}/participant`),
};

// Participants API
export const participantsAPI = {
  getEventParticipants: (eventId) =>
    api.get(`/api/participants/event/${eventId}`),
  addRegisteredUser: (eventId, userData) =>
    api.post(`/api/participants/event/${eventId}/user`, userData),
  addGuestUser: (eventId, guestData) =>
    api.post(`/api/participants/event/${eventId}/guest`, guestData),
  updateStatus: (participantId, statusData) =>
    api.patch(`/api/participants/${participantId}`, statusData),
  remove: (participantId) => api.delete(`/api/participants/${participantId}`),
};

export default api;
