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

/**
 * Smart Model Resolver for 9Router:
 * Resolves friendly model names/aliases to their exact working provider prefixes in 9Router
 */
export function resolve9RouterModel(model) {
  if (!model) return 'kr/claude-sonnet-4.5';
  const clean = model.trim();

  // If user calls combo "claude" or alias "claude-sonnet-4.5", route to Kiro provider which works 100%!
  if (clean === 'claude' || clean === 'claude-sonnet-4.5') return 'kr/claude-sonnet-4.5';
  if (clean === 'claude-haiku-4.5') return 'kr/claude-haiku-4.5';
  if (clean === 'claude-sonnet-4.5-thinking') return 'kr/claude-sonnet-4.5-thinking';
  if (clean === 'qwen3-coder-next') return 'kr/qwen3-coder-next';
  if (clean === 'deepseek-3.2') return 'kr/deepseek-3.2';

  // Cloudflare models
  if (clean.startsWith('@cf/')) return `cf/${clean}`;
  if (clean === 'llama-3.3' || clean === 'llama-3.3-70b') return 'cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  if (clean === 'qwq-32b') return 'cf/@cf/qwen/qwq-32b';

  // Ollama models
  if (clean === 'gpt-oss:120b') return 'ollama/gpt-oss:120b';

  // Poolside models
  if (clean === 'poolside/laguna-s-2.1' || clean === 'laguna-s-2.1' || clean === 'laguna') return 'ps/poolside/laguna-s-2.1';
  if (clean === 'poolside/laguna-xs-2.1' || clean === 'laguna-xs-2.1') return 'ps/poolside/laguna-xs-2.1';

  return clean;
}
