import axios from 'axios';

const api = axios.create({
  // baseURL: '/api',
  baseURL: 'https://ultratech-backend-1.onrender.com/api',
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('ut_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Avoid redirecting (which reloads the page) if the 401 is from the login request itself
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      sessionStorage.removeItem('ut_token');
      sessionStorage.removeItem('ut_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;