/** Formats bytes into a human readable string. */
export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Formats a UNIX timestamp (ms) into a locale date/time string. */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}