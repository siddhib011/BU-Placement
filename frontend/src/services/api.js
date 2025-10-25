import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api'; // Adjust if your backend runs elsewhere

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage or context
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    if (userInfo && userInfo.token) {
      config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;