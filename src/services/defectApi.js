// src/services/defectApi.js
import { CONFIG } from '../config';

const API_BASE = CONFIG.API_BASE_URL;

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API Transaction Failed');
  }
  return res.json();
};

export const defectApi = {
  getUploadSasUrl: async (blobPath) => {
    const res = await fetch(`${CONFIG.API_BASE_URL}/defects/sas?blobName=${encodeURIComponent(blobPath)}`);
    
    // FIX: We need to await the JSON and return ONLY the url string
    const data = await handleResponse(res); 
    return data.url; 
  },

  createDefect: (data) => fetch(`${API_BASE}/defects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createThread: (data) => fetch(`${API_BASE}/defects/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createAttachment: (data) => fetch(`${API_BASE}/defects/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
};