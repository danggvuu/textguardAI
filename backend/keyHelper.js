import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

let cachedKey = null;

/**
 * Auto-detect the local 9Router API Key directly from ~/.9router/db/data.sqlite
 */
export function getAutoDetected9RouterKey() {
  if (cachedKey) return cachedKey;
  try {
    const dbPath = path.join(os.homedir(), '.9router', 'db', 'data.sqlite');
    const key = execSync(`sqlite3 "${dbPath}" "SELECT key FROM apiKeys WHERE isActive=1 LIMIT 1;" 2>/dev/null`)
      .toString().trim();
    if (key && key.startsWith('sk-')) {
      cachedKey = key;
      return key;
    }
  } catch (err) {
    // fallback
  }
  return 'sk-45245fa5a3b0a8f8-rrjkfm-9ecb8a7d';
}

/**
 * Resolve effective API key: use supplied key if present,
 * or fallback to auto-detected local key if endpoint is localhost/9Router
 */
export function resolveApiKey(providedKey, baseUrl = '') {
  if (providedKey && typeof providedKey === 'string' && providedKey.trim()) {
    return providedKey.trim();
  }
  const isLocal = !baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('20128');
  if (isLocal) {
    return getAutoDetected9RouterKey();
  }
  return '';
}
