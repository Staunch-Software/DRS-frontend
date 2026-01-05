// src/services/defectApi.js
import { CONFIG } from '../config';

const API_BASE = CONFIG.API_BASE_URL;

// Helper to get the token from wherever you store it (usually localStorage)
const getAuthHeader = () => {
  const token = localStorage.getItem('token'); // <--- Check if your key is 'token' or 'access_token'
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API Transaction Failed');
  }
  return res.json();
};

export const defectApi = {
  getUploadSasUrl: async (blobPath) => {
    const res = await fetch(
      `${API_BASE}/defects/sas?blobName=${encodeURIComponent(blobPath)}`, 
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(), // <--- ADDED THIS
        }
      }
    );
    return handleResponse(res);
  },

  createDefect: (data) => fetch(`${API_BASE}/defects`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader() // <--- ADDED THIS
    },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createThread: (data) => fetch(`${API_BASE}/threads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader() // <--- ADDED THIS
    },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createAttachment: (data) => fetch(`${API_BASE}/attachments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader() // <--- ADDED THIS
    },
    body: JSON.stringify(data),
  }).then(handleResponse),
};