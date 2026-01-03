// src/config.js

// If using Vite, use import.meta.env
// If using Create React App, use process.env
const env = import.meta.env ? import.meta.env : process.env;

export const CONFIG = {
  API_BASE_URL: env.VITE_API_URL || env.REACT_APP_API_URL || 'http://localhost:4000/api',
  AZURE_STORAGE_URL: env.VITE_AZURE_BLOB_URL || env.REACT_APP_AZURE_BLOB_URL,
  AZURE_SAS_TOKEN: env.VITE_AZURE_SAS_TOKEN || env.REACT_APP_AZURE_SAS_TOKEN,
};