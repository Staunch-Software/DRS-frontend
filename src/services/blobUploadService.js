import { CONFIG } from '../config';

export const uploadFileToBlob = async (file, defectId, attachmentId) => {
  const containerUrl = CONFIG.AZURE_STORAGE_URL;
  const sasToken = CONFIG.AZURE_SAS_TOKEN;
  
  if (!containerUrl || !sasToken) {
    throw new Error("Azure Storage configuration is missing.");
  }

  const blobName = `${defectId}/${attachmentId}_${file.name}`;
  const uploadUrl = `${containerUrl}/${blobName}?${sasToken}`;

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) throw new Error(`Blob upload failed: ${response.statusText}`);

  return blobName;
};