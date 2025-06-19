import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const apiKey = process.env.REACT_APP_API_KEY;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
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
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  getProfile: () => api.get("/api/auth/me"),
  validateToken: () => api.post("/api/auth/validate"),
  logout: () => api.post("/api/auth/logout"),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get("/api/events"),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (eventData) => api.post("/api/events", eventData),
  update: (id, eventData) => api.put(`/api/events/${id}`, eventData),
  delete: (id) => api.delete(`/api/events/${id}`),
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
