// src/services/defectApi.js
import { CONFIG } from '../config';

const API_BASE = CONFIG.API_BASE_URL;

// Helper to get the token (matches your localStorage key from the screenshot)
const getAuthHeader = () => {
  // Matches the key 'drs_token' used in your AuthContext.jsx
  const token = localStorage.getItem('drs_token'); 
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
  // --- GET METHODS (Needed for Shore UI) ---

  // Fetches all defects for the dashboard
  getDefects: () => fetch(`${API_BASE}/defects`, {
    headers: { ...getAuthHeader() }
  }).then(handleResponse),

  // Fetches the conversation for a specific defect
  getThreads: (defectId) => fetch(`${API_BASE}/defects/${defectId}/threads`, {
    headers: { ...getAuthHeader() }
  }).then(handleResponse),


  // --- POST METHODS (Already implemented) ---

  getUploadSasUrl: async (blobPath) => {
    const res = await fetch(`${CONFIG.API_BASE_URL}/defects/sas?blobName=${encodeURIComponent(blobPath)}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await handleResponse(res); 
    return data.url; 
  },

  createDefect: (data) => fetch(`${CONFIG.API_BASE_URL}/defects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createThread: (data) => fetch(`${CONFIG.API_BASE_URL}/defects/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createAttachment: (data) => fetch(`${CONFIG.API_BASE_URL}/defects/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  }).then(handleResponse),
};