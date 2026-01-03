// src/api/axios.js
import axios from 'axios';

// Create an Axios instance pointing to your Python Backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1', // Make sure this matches your FastAPI URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the Token to every request if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drs_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;