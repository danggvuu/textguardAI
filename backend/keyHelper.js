import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

let cachedKey = null;

const DEFAULT_CF_TOKEN = process.env.CLOUDFLARE_AI_TOKEN || Buffer.from('Y2ZhdF85YTdXdzUwZzZlVW4xbHBBQ0I0aDlBdW9ubVB2cUpoaUVGTkJiaHAyYjQ4MWNjZTQ=', 'base64').toString('utf-8');
const DEFAULT_CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || 'c4e8774800ded088614353f5d23f23d6';

// Built-in high-performance Cloud AI provider (Meta Llama 3.3 70B via Cloudflare AI)
export const CLOUD_AI_CONFIG = {
  baseUrl: `https://api.cloudflare.com/client/v4/accounts/${DEFAULT_CF_ACCOUNT}/ai/v1`,
  apiKey: DEFAULT_CF_TOKEN,
  model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
};

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

export const DEFAULT_9ROUTER_TUNNEL = 'https://r74fefq.abc-tunnel.us/v1';
export const DEFAULT_9ROUTER_KEY = 'sk-45245fa5a3b0a8f8-rrjkfm-9ecb8a7d';

/**
 * Resolve effective API key & Endpoint configuration for Pro mode:
 * Priority 1: User's 9Router Key & Public Tunnel (or localhost if local)
 * Priority 2: User's OpenRouter personal key (sk-or-...)
 * Priority 3: Fallback Cloudflare AI (Meta Llama 3.3 70B)
 */
export function resolveProConfig(providedKey = '', baseUrl = '', model = '') {
  const cleanKey = (providedKey || '').trim();
  const cleanUrl = (baseUrl || '').trim().replace(/\/+$/, '');
  const isCloudEnv = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');

  // Case 1: User explicitly provided a real OpenRouter personal key
  if (cleanKey && cleanKey.startsWith('sk-or-')) {
    return {
      baseUrl: cleanUrl && !cleanUrl.includes('localhost') ? cleanUrl : 'https://openrouter.ai/api/v1',
      apiKey: cleanKey,
      model: model || 'google/gemini-2.0-flash-001',
      providerName: 'OpenRouter'
    };
  }

  // Case 2: Direct Cloudflare AI endpoint
  if (cleanUrl.includes('cloudflare.com')) {
    return {
      baseUrl: cleanUrl || CLOUD_AI_CONFIG.baseUrl,
      apiKey: cleanKey || CLOUD_AI_CONFIG.apiKey,
      model: CLOUD_AI_CONFIG.model,
      providerName: 'Cloudflare AI (Meta Llama 3.3 70B)'
    };
  }

  // Case 3: Public 9Router Tunnel URL (e.g. https://r74fefq.abc-tunnel.us/v1)
  if (cleanUrl && !cleanUrl.includes('localhost') && !cleanUrl.includes('127.0.0.1')) {
    return {
      baseUrl: cleanUrl,
      apiKey: cleanKey || getAutoDetected9RouterKey() || DEFAULT_9ROUTER_KEY,
      model: resolve9RouterModel(model || 'kr/claude-sonnet-4.5'),
      providerName: '9Router (Tunnel)'
    };
  }

  // Case 4: Running locally on user machine -> connect to localhost 9Router directly
  if (!isCloudEnv) {
    return {
      baseUrl: cleanUrl || 'http://localhost:20128/v1',
      apiKey: cleanKey || getAutoDetected9RouterKey() || DEFAULT_9ROUTER_KEY,
      model: resolve9RouterModel(model || 'kr/claude-sonnet-4.5'),
      providerName: '9Router (Local)'
    };
  }

  // Case 5: Running on Vercel cloud with no public tunnel specified in request
  // Use the verified active 9Router Tunnel URL directly with user's key!
  return {
    baseUrl: DEFAULT_9ROUTER_TUNNEL,
    apiKey: cleanKey || getAutoDetected9RouterKey() || DEFAULT_9ROUTER_KEY,
    model: resolve9RouterModel(model || 'kr/claude-sonnet-4.5'),
    providerName: '9Router'
  };
}

/**
 * Resolve effective API key
 */
export function resolveApiKey(providedKey, baseUrl = '') {
  if (providedKey && typeof providedKey === 'string' && providedKey.trim()) {
    return providedKey.trim();
  }
  return getAutoDetected9RouterKey();
}

/**
 * Smart Model Resolver for 9Router
 */
export function resolve9RouterModel(model) {
  if (!model) return 'kr/claude-sonnet-4.5';
  const clean = model.trim();

  if (clean === 'claude' || clean === 'claude-sonnet-4.5') return 'kr/claude-sonnet-4.5';
  if (clean === 'claude-haiku-4.5') return 'kr/claude-haiku-4.5';
  if (clean === 'claude-sonnet-4.5-thinking') return 'kr/claude-sonnet-4.5-thinking';
  if (clean === 'qwen3-coder-next') return 'kr/qwen3-coder-next';
  if (clean === 'deepseek-3.2') return 'kr/deepseek-3.2';

  if (clean.startsWith('@cf/')) return `cf/${clean}`;
  if (clean === 'llama-3.3' || clean === 'llama-3.3-70b') return 'cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  if (clean === 'qwq-32b') return 'cf/@cf/qwen/qwq-32b';

  return clean;
}
