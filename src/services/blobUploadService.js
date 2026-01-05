import { defectApi } from './defectApi';

const uploadToAzure = async (blob, path) => {
  // 1. Ask the API for a temporary signed URL for this specific path
  // This satisfies the "API generates short-lived SAS" requirement
  const signedUrl = await defectApi.getUploadSasUrl(path);

  // 2. Upload the file directly to Azure using that signed URL
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': blob.type || 'application/json',
    },
    body: blob,
  });

  if (!response.ok) throw new Error(`Azure Upload Failed: ${response.statusText}`);
  return path; 
};

export const blobUploadService = {
  uploadBinary: async (file, defectId, attachmentId) => {
    const path = `${defectId}/attachments/${attachmentId}_${file.name}`;
    return uploadToAzure(file, path);
  },

  uploadMetadataJSON: async (data, defectId) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const path = `${defectId}/metadata.json`;
    return uploadToAzure(blob, path);
  }
};