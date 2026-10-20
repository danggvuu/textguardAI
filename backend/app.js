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
    const { baseUrl = 'http://localhost:20128/v1', apiKey = '' } = req.body;
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

    const models = rawList.map(item => ({
      id: item.id || item.name,
      owned_by: item.owned_by || '',
      context_length: item.context_length || item.capabilities?.contextWindow || null
    })).filter(m => Boolean(m.id));

    return res.json({
      success: true,
      count: models.length,
      models
    });
  } catch (error) {
    console.error('Fetch models error:', error);
    return res.status(500).json({
      error: `Lỗi kết nối tới Endpoint: ${error.message}. Vui lòng kiểm tra địa chỉ Base URL.`
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
