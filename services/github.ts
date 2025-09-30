import axios from 'axios';
import { Buffer } from 'buffer';

/**
 * Lists GitHub repositories for the authenticated user.
 * @param token Personal access token with repo read permissions.
 */
export async function listRepos(token: string) {
  const res = await axios.get('https://api.github.com/user/repos', {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
    params: {
      per_page: 100,
      sort: 'updated',
    },
  });
  return res.data;
}

/**
 * Creates or updates a file in a GitHub repository. If the file already exists, a new commit will be
 * created updating it.
 * @param token Personal access token with repo write permissions.
 * @param owner Repo owner (username or org).
 * @param repo Repository name.
 * @param path File path within repository (e.g. 'src/index.js').
 * @param content Raw file content (will be base64 encoded).
 * @param message Commit message.
 */
export async function upsertFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
) {
  // First get the current file to check for sha
  let sha: string | undefined;
  try {
    const existing = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `token ${token}` },
    });
    sha = existing.data.sha;
  } catch (err: any) {
    // If not found, ignore
    if (err.response?.status !== 404) {
      throw err;
    }
  }
  const payload: any = {
    message,
    content: Buffer.from(content).toString('base64'),
    committer: {
      name: owner,
      email: `${owner}@users.noreply.github.com`,
    },
  };
  if (sha) payload.sha = sha;
  const res = await axios.put(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    payload,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );
  return res.data;
}