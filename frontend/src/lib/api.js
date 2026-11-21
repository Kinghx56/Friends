import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

// Attach the session token from localStorage to every request.
api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem('mock_auth');
  if (storedAuth) {
    try {
      const { session } = JSON.parse(storedAuth);
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // corrupted localStorage entry — ignore
    }
  }
  return config;
});

// A 401 means the session is gone or expired. Clear local auth and return to the
// login page — unless we are already there (a bad-credentials 401 must not bounce).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('mock_auth');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
