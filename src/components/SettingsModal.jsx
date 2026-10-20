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
  const [openRouterModel, setOpenRouterModel] = useState('claude');
  const [saved, setSaved] = useState(false);

  // Model scanner states
  const [models, setModels] = useState([]);
  const [combos, setCombos] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'combo' | 'openai' | 'anthropic' | 'gemini' | 'open_source'
  const [showInternal, setShowInternal] = useState(false);

  // Live model test ping
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const storedProvider = localStorage.getItem('tg_provider') || 'free';
      const storedOrKey = localStorage.getItem('tg_openrouter_key') || '';
      const storedOrUrl = localStorage.getItem('tg_openrouter_url') || 'http://localhost:20128/v1';
      const storedOrModel = localStorage.getItem('tg_openrouter_model') || 'claude';

      setProvider(storedProvider);
      setOpenRouterKey(storedOrKey);
      setOpenRouterBaseUrl(storedOrUrl);
      setOpenRouterModel(storedOrModel);
      setSaved(false);
      setTestResult(null);

      // Auto scan if 9router endpoint
      if (storedOrUrl.includes('20128')) {
        handleScanModels(storedOrUrl, storedOrKey, false);
      }
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
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        setCombos(data.combos || []);
        setScanMessage({
          text: `Đã lọc và tìm thấy ${data.count} models khả dụng từ 9Router!`,
          type: 'success'
        });

        // If no model selected, default to top combo
        if (!openRouterModel && data.combos?.length > 0) {
          setOpenRouterModel(data.combos[0].id);
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
  const handleTestSelectedModel = async () => {
    if (!openRouterModel) return;
    setIsTestingModel(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: openRouterBaseUrl,
          apiKey: openRouterKey,
          model: openRouterModel
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
    localStorage.setItem('tg_provider', provider);
    localStorage.setItem('tg_openrouter_key', openRouterKey.trim());
    localStorage.setItem('tg_openrouter_url', openRouterBaseUrl.trim());
    localStorage.setItem('tg_openrouter_model', openRouterModel.trim());

    // Also sync standard keys
    localStorage.setItem('tg_api_key', openRouterKey.trim());
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
                    <span>9Router Proxy (localhost:20128)</span>
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
                  placeholder="http://localhost:20128/v1"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                    API Key
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
                  placeholder={openRouterBaseUrl.includes('20128') ? 'Dán API Key tạo từ 9Router vào đây' : 'sk-or-v1-...'}
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

              {/* FEATURED: 9Router Combos (TOP PRIORITY) */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-xl border border-indigo-200/80">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-zinc-900">
                    Combo Đã Kích Hoạt Trong 9Router Của Bạn (Khuyên dùng):
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Combo 1: open */}
                  <div
                    onClick={() => setOpenRouterModel('open')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel === 'open'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-xs'
                        : 'bg-white/80 border-zinc-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">open</span>
                      {openRouterModel === 'open' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">GPT-5.3 & Codex Pool</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                      180+ models
                    </span>
                  </div>

                  {/* Combo 2: claude */}
                  <div
                    onClick={() => setOpenRouterModel('claude')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel === 'claude'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-xs'
                        : 'bg-white/80 border-zinc-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">claude</span>
                      {openRouterModel === 'claude' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">Claude Fable & Sonnet</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700">
                      78+ models
                    </span>
                  </div>

                  {/* Combo 3: gehihi */}
                  <div
                    onClick={() => setOpenRouterModel('gehihi')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      openRouterModel === 'gehihi'
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-xs'
                        : 'bg-white/80 border-zinc-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-zinc-900 font-mono">gehihi</span>
                      {openRouterModel === 'gehihi' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">Gemini 3 & 2.5 Flash</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                      144+ models
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
                  onClick={handleTestSelectedModel}
                  disabled={isTestingModel || !openRouterModel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                >
                  <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTestingModel ? 'animate-pulse' : ''}`} />
                  <span>{isTestingModel ? 'Đang test...' : '🧪 Test phản hồi Model'}</span>
                </button>
              </div>

              {/* Test Result Message */}
              {testResult && (
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
                      <div>
                        <span className="font-bold">Lỗi kết nối tới Model:</span>
                        <p className="text-[11px] text-rose-700 mt-0.5">{testResult.error}</p>
                      </div>
                    </>
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
                    { id: 'all', label: 'Tất cả' },
                    { id: 'combo', label: '🌟 Combo' },
                    { id: 'openai', label: '🤖 OpenAI' },
                    { id: 'anthropic', label: '🧠 Claude' },
                    { id: 'gemini', label: '⚡ Gemini' },
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
