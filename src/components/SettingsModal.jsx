import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  AlertCircle,
  ShieldCheck,
  Zap,
  Search,
  RefreshCw,
  Server,
  Sparkles,
  Activity,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, t }) {
  const [provider, setProvider] = useState('free');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterBaseUrl, setOpenRouterBaseUrl] = useState('http://localhost:20128/v1');
  const [openRouterModel, setOpenRouterModel] = useState('kr/claude-sonnet-4.5');
  const [saved, setSaved] = useState(false);
  const [detectedKey, setDetectedKey] = useState('');

  // Model scanner states
  const [models, setModels] = useState([]);
  const [combos, setCombos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('verified'); // 'verified' | 'all' | 'anthropic' | 'gemini' | 'open_source' | 'openai' | 'combo'
  const [showInternal, setShowInternal] = useState(false);

  // Live model test ping
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const isCloud = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const defaultUrl = isCloud
        ? 'https://r74fefq.abc-tunnel.us/v1'
        : 'http://localhost:20128/v1';
      const defaultKey = 'sk-45245fa5a3b0a8f8-rrjkfm-9ecb8a7d';

      const storedProvider = localStorage.getItem('tg_provider') || 'pro';
      let storedOrKey = localStorage.getItem('tg_openrouter_key') || defaultKey;
      let storedOrUrl = localStorage.getItem('tg_openrouter_url') || defaultUrl;
      const storedOrModel = localStorage.getItem('tg_openrouter_model') || 'kr/claude-sonnet-4.5';

      // On Vercel cloud, update expired tunnels or localhost to the active 9Router tunnel
      if (isCloud && (storedOrUrl.includes('localhost') || storedOrUrl.includes('127.0.0.1') || storedOrUrl.includes('trycloudflare.com') || !storedOrKey)) {
        storedOrUrl = defaultUrl;
        storedOrKey = defaultKey;
        localStorage.setItem('tg_openrouter_url', defaultUrl);
        localStorage.setItem('tg_openrouter_key', defaultKey);
      }

      setProvider(storedProvider);
      setOpenRouterKey(storedOrKey);
      setOpenRouterBaseUrl(storedOrUrl);
      setOpenRouterModel(storedOrModel);
      setDetectedKey(defaultKey);
      setSaved(false);
      setTestResult(null);

      // Auto scan models from endpoint
      handleScanModels(storedOrUrl, storedOrKey, false);
    }
  }, [isOpen]);

  // Handle Model Scanning from Endpoint
  const handleScanModels = async (urlOverride, keyOverride, internalFlag) => {
    const url = urlOverride || openRouterBaseUrl;
    const key = keyOverride !== undefined ? keyOverride : openRouterKey;
    const internal = internalFlag !== undefined ? internalFlag : showInternal;

    setIsScanning(true);
    setScanMessage({ text: 'Đang kết nối & lọc danh sách model khả dụng...', type: 'info' });

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: url, apiKey: key, includeInternal: internal })
      });

      const data = await res.json();
      if (data.detectedKey) {
        setDetectedKey(data.detectedKey);
        if (!key && !openRouterKey) {
          setOpenRouterKey(data.detectedKey);
          localStorage.setItem('tg_openrouter_key', data.detectedKey);
        }
      }

      if (data.models && data.models.length > 0) {
        setModels(data.models);
        setCombos(data.combos || []);
        setScanMessage({
          text: `Đã lọc ${data.count} models từ 9Router! (Tự động nhận diện Key: ${data.detectedKey ? data.detectedKey.slice(0, 10) + '...' : 'OK'})`,
          type: 'success'
        });

        // If no model selected, default to top combo gehihi
        if (!openRouterModel) {
          setOpenRouterModel('gehihi');
        }
      } else {
        setScanMessage({
          text: data.error || 'Không tìm thấy model nào từ endpoint.',
          type: 'error'
        });
      }
    } catch (err) {
      setScanMessage({
        text: `Lỗi kết nối: ${err.message}. Đảm bảo 9Router đang chạy!`,
        type: 'error'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Live Ping / Test selected model
  const handleTestSelectedModel = async (overrideModel) => {
    const modelToTest = overrideModel || openRouterModel;
    if (!modelToTest) return;
    setIsTestingModel(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: openRouterBaseUrl,
          apiKey: openRouterKey || detectedKey,
          model: modelToTest
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingModel(false);
    }
  };

  const handleSave = () => {
    const finalKey = (openRouterKey || detectedKey).trim();
    localStorage.setItem('tg_provider', provider);
    localStorage.setItem('tg_openrouter_key', finalKey);
    localStorage.setItem('tg_openrouter_url', openRouterBaseUrl.trim());
    localStorage.setItem('tg_openrouter_model', openRouterModel.trim());

    // Also sync standard keys
    localStorage.setItem('tg_api_key', finalKey);
    localStorage.setItem('tg_model', openRouterModel.trim());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  // Filter models by category and search query
  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.owned_by.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'verified') return m.isVerified || m.id === 'gehihi';
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'combo') return m.isCombo;
    return m.category === selectedCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">Quét & Lọc Model Hoạt Động (9Router)</h3>
              <p className="text-[11px] text-zinc-500">Chỉ lọc ra các AI và Combo thực sự sử dụng được</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tier Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Chế độ vận hành
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Free Tier */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  provider === 'free'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === 'free'}
                  onChange={() => setProvider('free')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-900">Bản Miễn Phí</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      100% Free
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                    Stanford HC3 & RAID Forensic NLP. Chạy ngay không cần key hay proxy.
                  </p>
                </div>
              </label>

              {/* Pro Tier (9Router / OpenRouter) */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  provider === 'pro'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === 'pro'}
                  onChange={() => setProvider('pro')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-600"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-900">Bản PRO Chuyên Sâu</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                      9Router Proxy
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                    Sử dụng các combo AI mạnh nhất trên máy bạn (`open`, `claude`, `gehihi`...).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Configuration Panel (When Pro selected) */}
          {provider === 'pro' && (
            <div className="space-y-4 p-4.5 bg-zinc-50/70 rounded-2xl border border-zinc-200 animate-in fade-in duration-200">
              {/* Endpoint Preset Selector */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Địa chỉ Proxy (Endpoint)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = 'https://medical-privileges-fairfield-lit.trycloudflare.com/v1';
                      setOpenRouterBaseUrl(url);
                      handleScanModels(url);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      openRouterBaseUrl.includes('trycloudflare.com')
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-bold'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <span>☁️ 9Router Tunnel (Chạy Trên Web)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenRouterBaseUrl('http://localhost:20128/v1');
                      handleScanModels('http://localhost:20128/v1');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      openRouterBaseUrl.includes('20128')
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>💻 9Router Local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenRouterBaseUrl('https://openrouter.ai/api/v1');
                      handleScanModels('https://openrouter.ai/api/v1');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      openRouterBaseUrl.includes('openrouter.ai')
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <span>🌐 OpenRouter Cloud</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={openRouterBaseUrl}
                  onChange={(e) => setOpenRouterBaseUrl(e.target.value)}
                  placeholder="https://medical-privileges-fairfield-lit.trycloudflare.com/v1"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span>API Key</span>
                    {detectedKey && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Tự động nhận diện Key 9Router
                      </span>
                    )}
                  </label>
                  {openRouterBaseUrl.includes('20128') && (
                    <span className="text-[11px] text-zinc-500">
                      Lấy tại tab <strong>Endpoint & Key</strong> trên 9Router
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder={detectedKey ? detectedKey : 'Dán API Key tạo từ 9Router vào đây'}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Scan Models Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleScanModels()}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Đang quét và lọc AI...' : '🔍 Quét & Lọc Model Khả Dụng'}</span>
                </button>

                {scanMessage && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      scanMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : scanMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <span>{scanMessage.text}</span>
                  </div>
                )}
              </div>

              {/* FEATURED: Verified 9Router Models (TOP RECOMMENDED) */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-xl border border-indigo-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-zinc-900">
                      Top Model Mạnh Nhất (Đã kích hoạt trên 9Router của bạn):
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    🟢 Đã kiểm chứng 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Model 1: Claude Sonnet 4.5 (Kiro) - SOTA */}
                  <div
                    onClick={() => {
                      setOpenRouterModel('kr/claude-sonnet-4.5');
                      handleTestSelectedModel('kr/claude-sonnet-4.5');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel === 'kr/claude-sonnet-4.5'
                        ? 'bg-white border-purple-600 ring-2 ring-purple-600/30 shadow-xs'
                        : 'bg-white/90 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-zinc-900 font-mono">Claude Sonnet 4.5</span>
                      </div>
                      {openRouterModel === 'kr/claude-sonnet-4.5' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 line-clamp-1">Kiro Provider (SOTA)</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                      🧠 Phân tích & Viết đỉnh cao
                    </span>
                  </div>

                  {/* Model 2: Claude Haiku 4.5 (Kiro) - Fast */}
                  <div
                    onClick={() => {
                      setOpenRouterModel('kr/claude-haiku-4.5');
                      handleTestSelectedModel('kr/claude-haiku-4.5');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel === 'kr/claude-haiku-4.5'
                        ? 'bg-white border-purple-600 ring-2 ring-purple-600/30 shadow-xs'
                        : 'bg-white/90 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">Claude Haiku 4.5</span>
                      {openRouterModel === 'kr/claude-haiku-4.5' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 line-clamp-1">Kiro Provider (Speed)</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      ⚡ Siêu nhanh & nhạy bén
                    </span>
                  </div>

                  {/* Model 3: Llama 3.3 70B (Cloudflare) */}
                  <div
                    onClick={() => {
                      setOpenRouterModel('cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast');
                      handleTestSelectedModel('cf/@cf/meta/llama-3.3-70b-instruct-fp8-fast');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel.includes('llama-3.3')
                        ? 'bg-white border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                        : 'bg-white/90 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">Llama 3.3 70B</span>
                      {openRouterModel.includes('llama-3.3') && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 line-clamp-1">Cloudflare AI (FP8 Fast)</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                      🦙 Open-Source 70B
                    </span>
                  </div>

                  {/* Model 4: Qwen QwQ 32B (Cloudflare) */}
                  <div
                    onClick={() => {
                      setOpenRouterModel('cf/@cf/qwen/qwq-32b');
                      handleTestSelectedModel('cf/@cf/qwen/qwq-32b');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel.includes('qwq-32b')
                        ? 'bg-white border-amber-600 ring-2 ring-amber-600/30 shadow-xs'
                        : 'bg-white/90 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">Qwen QwQ 32B</span>
                      {openRouterModel.includes('qwq-32b') && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 line-clamp-1">Cloudflare AI (Reasoning)</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                      🧠 Suy luận logic sâu
                    </span>
                  </div>

                  {/* Model 5: Poolside Laguna */}
                  <div
                    onClick={() => {
                      setOpenRouterModel('ps/poolside/laguna-s-2.1');
                      handleTestSelectedModel('ps/poolside/laguna-s-2.1');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel.includes('laguna')
                        ? 'bg-white border-teal-600 ring-2 ring-teal-600/30 shadow-xs'
                        : 'bg-white/90 border-teal-200 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">Poolside Laguna</span>
                      {openRouterModel.includes('laguna') && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 line-clamp-1">Laguna S 2.1 (Active 100%)</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                      🌊 Tốc độ cao & Viết mượt
                    </span>
                  </div>

                  {/* Model 6: GPT-OSS 120B / Ollama */}
                  <div
                    onClick={() => {
                      setOpenRouterModel('ollama/gpt-oss:120b');
                      handleTestSelectedModel('ollama/gpt-oss:120b');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel.includes('gpt-oss')
                        ? 'bg-white border-zinc-800 ring-2 ring-zinc-800/30 shadow-xs'
                        : 'bg-white/90 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">GPT-OSS 120B</span>
                      {openRouterModel.includes('gpt-oss') && <Check className="w-3.5 h-3.5 text-zinc-800" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 line-clamp-1">Ollama Cloud / Local</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded">
                      💻 Siêu mô hình 120B
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Model & Test Status Header */}
              <div className="p-3 bg-white rounded-xl border border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-500">Đang chọn:</span>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {openRouterModel || 'Chưa chọn'}
                  </span>
                </div>

                {/* Test button */}
                <button
                  type="button"
                  onClick={() => handleTestSelectedModel()}
                  disabled={isTestingModel || !openRouterModel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                >
                  <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTestingModel ? 'animate-pulse' : ''}`} />
                  <span>{isTestingModel ? 'Đang test...' : '🧪 Test phản hồi Model'}</span>
                </button>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div className="space-y-2">
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Model "{testResult.model}" hoạt động hoàn hảo!</span>
                          <span className="text-[11px] block text-emerald-700">
                            Độ trễ: <strong>{testResult.latencyMs}ms</strong> • Phản hồi: "{testResult.reply}"
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold">Lỗi kết nối tới Model:</span>
                          <p className="text-[11px] text-rose-700 mt-0.5 break-all">{testResult.error}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Friendly suggestion tip when an upstream model has error */}
                  {testResult.tip && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium leading-relaxed">{testResult.tip}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenRouterModel('gehihi');
                          handleTestSelectedModel('gehihi');
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        Chuyển sang "gehihi" ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Category Filter Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                    Lọc theo dòng AI:
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInternal}
                      onChange={(e) => {
                        setShowInternal(e.target.checked);
                        handleScanModels(openRouterBaseUrl, openRouterKey, e.target.checked);
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span>Hiện sub-model nội bộ</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 text-xs">
                  {[
                    { id: 'verified', label: '✅ Đã xác minh 100%' },
                    { id: 'all', label: 'Tất cả' },
                    { id: 'combo', label: '🌟 Combo' },
                    { id: 'gemini', label: '⚡ Gemini' },
                    { id: 'openai', label: '🤖 OpenAI' },
                    { id: 'anthropic', label: '🧠 Claude' },
                    { id: 'open_source', label: '🚀 Open-Source' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-white text-zinc-900 shadow-xs font-bold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Searchable Model Picker */}
              <div>
                {models.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Tìm trong ${filteredModels.length} model khả dụng...`}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-xl bg-white p-1 space-y-0.5">
                      {filteredModels.slice(0, 100).map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setOpenRouterModel(m.id)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            openRouterModel === m.id
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {m.isCombo && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                            <span className="font-mono truncate">{m.id}</span>
                            {m.isVerified && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                ✓ Hoạt động
                              </span>
                            )}
                            {m.id.startsWith('cu/') && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                                Cursor
                              </span>
                            )}
                            {m.owned_by && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-500">
                                {m.owned_by}
                              </span>
                            )}
                          </div>
                          {openRouterModel === m.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </div>
                      ))}
                      {filteredModels.length === 0 && (
                        <div className="p-3 text-center text-xs text-zinc-400 italic">
                          Không có model nào khớp với bộ lọc này.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={openRouterModel}
                      onChange={(e) => setOpenRouterModel(e.target.value)}
                      placeholder="open, claude, gehihi..."
                      className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/80 shrink-0">
          <span className="text-[11px] text-zinc-500">
            {models.length > 0 ? `Đã lọc ${models.length} model dùng được` : 'Chế độ: ' + (provider === 'pro' ? 'PRO (9Router)' : 'Miễn Phí')}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>Lưu cấu hình</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
