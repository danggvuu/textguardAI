import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mammoth from 'mammoth';
import dotenv from 'dotenv';
import { humanizeLocal, humanizeWithLLM } from './nlpEngine.js';
import { detectAIText } from './detectorEngine.js';
import { PRESET_SAMPLES } from './presets.js';
import { resolveApiKey, getAutoDetected9RouterKey, resolve9RouterModel, DEFAULT_9ROUTER_TUNNEL, DEFAULT_9ROUTER_KEY } from './keyHelper.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure Multer for file uploads (stored in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.md', '.docx', '.pdf'];
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowed.includes(ext) || file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ tệp .txt, .md, .docx hoặc .pdf'));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TextGuard AI Humanizer API',
    version: '2.3.0',
    engine: 'Cloudflare AI + 9Router + Multi-Stage Forensic NLP',
    time: new Date()
  });
});

// Presets list
app.get('/api/presets', (req, res) => {
  res.json({ presets: PRESET_SAMPLES });
});

// Scan / Fetch Models from 9Router or OpenRouter endpoint
app.post('/api/models', async (req, res) => {
  try {
    const isCloud = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
    let { baseUrl = '', apiKey = '', includeInternal = false } = req.body;

    if (!baseUrl || (isCloud && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')))) {
      baseUrl = isCloud ? DEFAULT_9ROUTER_TUNNEL : 'http://localhost:20128/v1';
    }
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const modelsEndpoint = cleanUrl.endsWith('/models') ? cleanUrl : `${cleanUrl}/models`;

    const effectiveKey = resolveApiKey(apiKey, cleanUrl) || DEFAULT_9ROUTER_KEY;
    const headers = { 'Content-Type': 'application/json' };
    if (effectiveKey) {
      headers['Authorization'] = `Bearer ${effectiveKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(modelsEndpoint, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Không thể lấy danh sách model (${response.status}): ${errText}`,
        detectedKey: getAutoDetected9RouterKey()
      });
    }

    const data = await response.json();
    const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    // 1. Separate top combos (the primary models configured in 9Router)
    const comboIds = ['open', 'claude', 'gehihi'];
    const combos = [];
    const regularModels = [];

    // List of models tested & verified working 100% on this machine across all providers
    const VERIFIED_MODELS = [
      'kr/claude-sonnet-4.5',
      'kr/claude-haiku-4.5',
      'kr/claude-sonnet-4.5-thinking',
      'kr/qwen3-coder-next',
      'kr/deepseek-3.2',
      'cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      'cf/@cf/qwen/qwq-32b',
      'cf/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
      'cf/@cf/zai-org/glm-4.7-flash',
      'ollama/gpt-oss:120b',
      'ps/poolside/laguna-s-2.1',
      'gemini-2.5-flash',
      'gemini-3-flash-preview',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemma-4-31b-it',
      'gehihi'
    ];

    rawList.forEach(item => {
      const id = item.id || item.name;
      if (!id) return;

      const isCombo = item.owned_by === 'combo' || comboIds.includes(id);
      
      // Determine brand/category
      let category = 'other';
      const lower = id.toLowerCase();
      if (isCombo) {
        category = 'combo';
      } else if (lower.includes('claude') || lower.startsWith('cl/')) {
        category = 'anthropic';
      } else if (lower.includes('gpt') || lower.startsWith('cx/') || lower.startsWith('cu/') || lower.startsWith('gh/') || lower.includes('o1') || lower.includes('openai')) {
        category = 'openai';
      } else if (lower.includes('gemini') || lower.startsWith('gehihi')) {
        category = 'gemini';
      } else if (lower.includes('deepseek') || lower.includes('qwen') || lower.includes('llama') || lower.includes('mistral') || lower.includes('venice')) {
        category = 'open_source';
      }

      const isVerified = VERIFIED_MODELS.includes(id);

      const formatted = {
        id,
        owned_by: item.owned_by || '',
        category,
        isCombo,
        isVerified,
        context_length: item.context_length || item.capabilities?.contextWindow || null
      };

      if (isCombo) {
        combos.push(formatted);
      } else {
        // Filter out internal sub-endpoints unless explicitly requested
        if (!includeInternal) {
          if (id.includes('~') || id.includes(':batch') || id.includes('[1m]')) return;
          if (/embed|moderation|tts|whisper|dall-e|flux|sdxl|rerank|clip/i.test(id)) return;
          if (id.startsWith('cl/google/lyria') || id.startsWith('gh/goldeneye')) return;
        }
        regularModels.push(formatted);
      }
    });

    // Combos first (gehihi top), then verified models, then regular models
    combos.sort((a, b) => (b.id === 'gehihi' ? 1 : 0) - (a.id === 'gehihi' ? 1 : 0));
    regularModels.sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0));

    const sorted = [...combos, ...regularModels];

    return res.json({
      success: true,
      count: sorted.length,
      combos,
      models: sorted,
      detectedKey: getAutoDetected9RouterKey()
    });
  } catch (error) {
    console.error('Fetch models error:', error);
    return res.status(500).json({
      error: `Lỗi kết nối tới Endpoint: ${error.message}. Vui lòng kiểm tra địa chỉ Base URL.`,
      detectedKey: getAutoDetected9RouterKey()
    });
  }
});

// Ping / Test a specific model on 9Router or OpenRouter
app.post('/api/models/test', async (req, res) => {
  const startTime = Date.now();
  try {
    const isCloud = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
    let { baseUrl = '', apiKey = '', model = 'kr/claude-sonnet-4.5' } = req.body;

    if (!baseUrl || (isCloud && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')))) {
      baseUrl = isCloud ? DEFAULT_9ROUTER_TUNNEL : 'http://localhost:20128/v1';
    }
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const chatEndpoint = cleanUrl.endsWith('/chat/completions') ? cleanUrl : `${cleanUrl}/chat/completions`;

    const effectiveKey = resolveApiKey(apiKey, cleanUrl) || DEFAULT_9ROUTER_KEY;
    const effectiveModel = resolve9RouterModel(model);

    const headers = { 'Content-Type': 'application/json' };
    if (effectiveKey) {
      headers['Authorization'] = `Bearer ${effectiveKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: effectiveModel,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 50,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    const responseText = await response.text();

    if (!response.ok) {
      let friendlyTip = '';
      if (responseText.includes('RESOURCE_EXHAUSTED') || responseText.includes('429') || responseText.includes('quota')) {
        friendlyTip = '💡 Tip: Toàn bộ 4 key Gemini trên 9Router của bạn đều đã vượt quá giới hạn lượt dùng trong ngày (429 Quota Exceeded). Hãy chọn "kr/claude-sonnet-4.5" (Kiro) hoặc "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast" (Cloudflare) đang Active 100%!';
      } else if (responseText.includes('Missing Authentication header') || responseText.includes('401')) {
        friendlyTip = '💡 Tip: Model này chưa được cấp Authorization Header hợp lệ trên upstream provider trong 9Router. Hãy chọn "kr/claude-sonnet-4.5" hoặc "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast"!';
      } else if (responseText.includes('Cursor AgentService') || responseText.includes('empty turn')) {
        friendlyTip = '💡 Tip: Model này định tuyến qua Cursor Agent. Bạn có thể chọn "kr/claude-sonnet-4.5" hoặc "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast" để chạy mượt 100%!';
      } else if (responseText.includes('not licensed to use Copilot') || responseText.includes('Copilot')) {
        friendlyTip = '💡 Tip: Tài khoản GitHub Copilot trên máy chưa kích hoạt license. Hãy chọn "kr/claude-sonnet-4.5" (Kiro) hoặc "cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast"!';
      } else if (responseText.includes('Paid Model - Credits Required') || responseText.includes('402')) {
        friendlyTip = '💡 Tip: Model này trên provider đã hết credits. Hãy chuyển sang "kr/claude-sonnet-4.5" (Kiro) hoàn toàn miễn phí!';
      }

      return res.status(response.status).json({
        success: false,
        latencyMs,
        error: `Model "${effectiveModel}" trả về lỗi (${response.status}): ${responseText}`,
        tip: friendlyTip
      });
    }

    // Try parsing JSON or SSE fallback
    let reply = 'OK';
    try {
      const data = JSON.parse(responseText);
      reply = data?.choices?.[0]?.message?.content?.trim() 
        || data?.choices?.[0]?.delta?.content?.trim() 
        || data?.choices?.[0]?.message?.reasoning_content?.trim()
        || 'OK';
    } catch {
      if (responseText.includes('data:')) {
        const lines = responseText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const chunk = JSON.parse(line.slice(6));
              const piece = chunk?.choices?.[0]?.delta?.content || chunk?.choices?.[0]?.message?.content;
              if (piece) reply += piece;
            } catch {}
          }
        }
      }
    }

    return res.json({
      success: true,
      model: effectiveModel,
      latencyMs,
      reply: reply || 'OK',
      detectedKey: effectiveKey
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      latencyMs: Date.now() - startTime,
      error: `Không thể kết nối tới Model: ${error.message}`
    });
  }
});

// AI Detection Endpoint
app.post('/api/detect', async (req, res) => {
  try {
    const {
      text,
      tier = 'free',
      domain = 'academic',
      openRouterKey,
      openRouterBaseUrl,
      openRouterModel
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Văn bản không được để trống' });
    }

    const result = await detectAIText(text, {
      tier,
      domain,
      openRouterKey,
      openRouterBaseUrl,
      openRouterModel
    });

    return res.json(result);
  } catch (error) {
    console.error('Detection error:', error);
    return res.status(500).json({ error: 'Lỗi khi phân tích phát hiện AI: ' + error.message });
  }
});

// AI Humanize Endpoint
app.post('/api/humanize', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      text,
      strength = 'balanced',
      readability = 'college',
      purpose = 'general',
      apiKey,
      provider = 'gemini',
      model = 'gemini-1.5-flash',
      baseUrl
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Văn bản cần xử lý không được để trống' });
    }

    let humanizedText = '';
    let engineUsed = 'local-nlp';

    // 1. Resolve key (auto-detects local 9Router key if on localhost)
    const effectiveKey = resolveApiKey(apiKey, baseUrl);

    // Try LLM if provider is not free
    if (provider !== 'free') {
      try {
        humanizedText = await humanizeWithLLM(
          text,
          { strength, readability, purpose },
          { apiKey: effectiveKey, provider, model: model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast', baseUrl }
        );
        engineUsed = (provider === 'pro' || provider === 'openrouter') ? 'Meta Llama 3.3 70B (Cloudflare AI)' : provider;
      } catch (llmErr) {
        console.warn('LLM humanization failed, falling back to local NLP engine:', llmErr.message);
        humanizedText = humanizeLocal(text, { strength, readability, purpose });
        engineUsed = 'local-nlp-fallback';
      }
    } else {
      // 2. High-precision Built-in local NLP engine
      humanizedText = humanizeLocal(text, { strength, readability, purpose });
      engineUsed = 'local-nlp';
    }

    // 3. Compute stats for before & after
    const beforeStats = await detectAIText(text);
    const afterStats = await detectAIText(humanizedText);

    const processingTimeMs = Date.now() - startTime;

    return res.json({
      success: true,
      originalText: text,
      humanizedText,
      beforeStats,
      afterStats,
      engineUsed,
      processingTimeMs,
      options: { strength, readability, purpose }
    });
  } catch (error) {
    console.error('Humanize error:', error);
    return res.status(500).json({ error: 'Lỗi khi xử lý văn bản: ' + error.message });
  }
});

// File upload endpoint (supports .pdf, .docx, .txt, .md)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn một tệp văn bản' });
    }

    const { originalname, buffer } = req.file;
    const ext = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();
    let extractedText = '';

    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (ext === '.pdf') {
      const { extractText } = await import('unpdf');
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      extractedText = text || '';
    } else {
      extractedText = buffer.toString('utf-8');
    }

    const trimmed = extractedText.trim();
    if (!trimmed) {
      return res.status(400).json({
        error: `Tệp "${originalname}" không có văn bản hoặc chỉ chứa hình ảnh quét (scanned image). Vui lòng chọn tệp có nội dung chữ.`
      });
    }

    return res.json({
      success: true,
      filename: originalname,
      filesize: req.file.size,
      wordCount: trimmed.split(/\s+/).filter(Boolean).length,
      text: trimmed
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Không thể đọc tệp: ' + error.message });
  }
});

export default app;
