import axios from 'axios';

/**
 * Configure API base URL for the runtime environment:
 * - Prefer same-origin '/api' whenever running on the same host/server (such as the AI Studio preview).
 * - Avoid browser Mixed Content and Network Errors caused by requesting http://localhost:5000 from an HTTPS preview.
 * - Preserve ability to configure http://localhost:5000/api or custom remote endpoints for separate local backend setups.
 */
function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    // If running in browser preview (HTTPS / *.run.app) or on the unified port 3000 server,
    // use same-origin '/api' so requests route directly to the mounted Express routes.
    const isHostedPreview = window.location.protocol === 'https:' || window.location.hostname.includes('run.app');
    const isPort3000 = window.location.port === '3000';

    if (isHostedPreview || isPort3000) {
      const configured = process.env.REACT_APP_API_BASE_URL;
      if (configured && !configured.includes('localhost:') && !configured.includes('127.0.0.1:')) {
        return configured;
      }
      return '/api';
    }
  }

  return process.env.REACT_APP_API_BASE_URL || '/api';
}

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edugenai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry and errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('edugenai_token');
      localStorage.removeItem('edugenai_user');
      if (window.location.pathname.startsWith('/app')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
