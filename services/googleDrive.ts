import axios from 'axios';

/**
 * Lists files in the authenticated user's Google Drive.  The access token must come from an
 * OAuth 2.0 flow.  See Google Drive API docs for details on scopes and token acquisition.
 *
 * @param accessToken OAuth access token
 */
export async function listDriveFiles(accessToken: string) {
  const res = await axios.get('https://www.googleapis.com/drive/v3/files', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      pageSize: 100,
      fields: 'files(id,name,mimeType,size)',
    },
  });
  return res.data.files;
}

/**
 * Download a file from Google Drive and return its blob URL or text content.  This example uses
 * the Drive export endpoint when a file is Google Docs/Sheets/Slides; for binary files it uses
 * the standard download URL.
 */
export async function downloadDriveFile(accessToken: string, fileId: string) {
  const res = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { alt: 'media' },
    responseType: 'arraybuffer',
  });
  return res.data as ArrayBuffer;
}