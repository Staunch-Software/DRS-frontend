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
  // NEW METHOD: Asks backend for a signed SAS URL for a specific file path
  getUploadSasUrl: async (blobPath) => {
  const res = await fetch(`${CONFIG.API_BASE_URL}/defects/sas?blobName=${encodeURIComponent(blobPath)}`);
  
  if (!res.ok) throw new Error("Could not get upload permission from server");
  const data = await res.json();
  return data.url;
},

  createDefect: (data) => fetch(`${CONFIG.API_BASE_URL}/defects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),

  createThread: (data) =>
    fetch(`${API_BASE}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  createAttachment: (data) =>
    fetch(`${API_BASE}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
};