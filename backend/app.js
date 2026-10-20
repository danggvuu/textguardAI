import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mammoth from 'mammoth';
import dotenv from 'dotenv';
import { humanizeLocal, humanizeWithLLM } from './nlpEngine.js';
import { detectAIText } from './detectorEngine.js';
import { PRESET_SAMPLES } from './presets.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure Multer for file uploads (stored in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.md', '.docx'];
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowed.includes(ext) || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ tệp .txt, .md, hoặc .docx'));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TextGuard AI Humanizer API', time: new Date() });
});

// Presets list
app.get('/api/presets', (req, res) => {
  res.json({ presets: PRESET_SAMPLES });
});

// Scan / Fetch Models from 9Router or OpenRouter endpoint
app.post('/api/models', async (req, res) => {
  try {
    const { baseUrl = 'http://localhost:20128/v1', apiKey = '', includeInternal = false } = req.body;
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const modelsEndpoint = cleanUrl.endsWith('/models') ? cleanUrl : `${cleanUrl}/models`;

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
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
        error: `Không thể lấy danh sách model (${response.status}): ${errText}`
      });
    }

    const data = await response.json();
    const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    // 1. Separate top combos (the primary models configured in 9Router)
    const comboIds = ['open', 'claude', 'gehihi'];
    const combos = [];
    const regularModels = [];

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

      const formatted = {
        id,
        owned_by: item.owned_by || '',
        category,
        isCombo,
        context_length: item.context_length || item.capabilities?.contextWindow || null
      };

      if (isCombo) {
        combos.push(formatted);
      } else {
        // Filter out internal sub-endpoints unless explicitly requested
        if (!includeInternal) {
          if (id.includes('~') || id.includes(':batch') || id.includes('[1m]')) return;
          if (/embed|moderation|tts|whisper|dall-e|flux|sdxl|rerank|clip/i.test(id)) return;
        }
        regularModels.push(formatted);
      }
    });

    // Combos first, then regular models
    const sorted = [...combos, ...regularModels];

    return res.json({
      success: true,
      count: sorted.length,
      combos,
      models: sorted
    });
  } catch (error) {
    console.error('Fetch models error:', error);
    return res.status(500).json({
      error: `Lỗi kết nối tới Endpoint: ${error.message}. Vui lòng kiểm tra địa chỉ Base URL.`
    });
  }
});

// Ping / Test a specific model on 9Router or OpenRouter
app.post('/api/models/test', async (req, res) => {
  const startTime = Date.now();
  try {
    const { baseUrl = 'http://localhost:20128/v1', apiKey = '', model = 'claude' } = req.body;
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const chatEndpoint = cleanUrl.endsWith('/chat/completions') ? cleanUrl : `${cleanUrl}/chat/completions`;

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        success: false,
        latencyMs,
        error: `Model "${model}" trả về lỗi (${response.status}): ${errText}`
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'OK';

    return res.json({
      success: true,
      model,
      latencyMs,
      reply
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
      openRouterKey,
      openRouterBaseUrl,
      openRouterModel
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Văn bản không được để trống' });
    }

    const result = await detectAIText(text, {
      tier,
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

    // 1. Try LLM if API Key is supplied
    if (apiKey && apiKey.trim()) {
      try {
        humanizedText = await humanizeWithLLM(
          text,
          { strength, readability, purpose },
          { apiKey: apiKey.trim(), provider, model, baseUrl }
        );
        engineUsed = provider;
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

// File upload endpoint
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
      extractedText = result.value;
    } else {
      extractedText = buffer.toString('utf-8');
    }

    return res.json({
      filename: originalname,
      filesize: req.file.size,
      text: extractedText.trim()
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Không thể đọc tệp: ' + error.message });
  }
});

export default app;
