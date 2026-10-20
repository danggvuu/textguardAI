import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Key,
  Check,
  AlertCircle,
  ShieldCheck,
  Zap,
  Search,
  RefreshCw,
  Server,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, t }) {
  const [provider, setProvider] = useState('free');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterBaseUrl, setOpenRouterBaseUrl] = useState('http://localhost:20128/v1');
  const [openRouterModel, setOpenRouterModel] = useState('claude');
  const [saved, setSaved] = useState(false);

  // Model scanner states
  const [models, setModels] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

      // Auto scan if 9router endpoint
      if (storedOrUrl.includes('20128')) {
        handleScanModels(storedOrUrl, storedOrKey);
      }
    }
  }, [isOpen]);

  // Handle Model Scanning from Endpoint
  const handleScanModels = async (urlOverride, keyOverride) => {
    const url = urlOverride || openRouterBaseUrl;
    const key = keyOverride !== undefined ? keyOverride : openRouterKey;

    setIsScanning(true);
    setScanMessage({ text: 'Đang kết nối & quét danh sách model...', type: 'info' });

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: url, apiKey: key })
      });

      const data = await res.json();
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        setScanMessage({
          text: `Thành công! Đã quét được ${data.count} models từ endpoint.`,
          type: 'success'
        });

        // If current model not in list or default, pick first combo or first model
        if (!openRouterModel) {
          const combo = data.models.find(m => m.id === 'open' || m.id === 'claude' || m.id === 'gehihi');
          if (combo) setOpenRouterModel(combo.id);
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

  // Filtered models
  const filteredModels = models.filter((m) =>
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.owned_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Detect 9Router combos
  const comboModels = models.filter(m => ['open', 'claude', 'gehihi'].includes(m.id) || m.owned_by === 'combo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900">Quét & Cấu hình Model AI (9Router / OpenRouter)</h3>
              <p className="text-[11px] text-zinc-500">Tự động nhận diện toàn bộ model từ proxy local hoặc cloud</p>
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
                    Mô hình Stanford HC3 & RAID Forensic NLP. Chạy ngay lập tức không cần key.
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
                      9Router / OpenRouter
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                    Kết nối 9Router Proxy hoặc OpenRouter để gọi các combo model cực mạnh.
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
                  Chọn máy chủ Proxy (Endpoint)
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
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
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
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
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
                    API Key (Key 9Router hoặc OpenRouter)
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
                  placeholder={openRouterBaseUrl.includes('20128') ? 'Dán key tạo từ 9Router vào đây' : 'sk-or-v1-...'}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Scan Models Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleScanModels()}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Đang quét danh sách model...' : '🔍 Quét danh sách Model từ Endpoint'}</span>
                </button>

                {/* Scan Status Message */}
                {scanMessage && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
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

              {/* Quick Select for 9Router Combos */}
              {comboModels.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                    Combo gợi ý từ 9Router của bạn:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {comboModels.map((combo) => (
                      <button
                        key={combo.id}
                        type="button"
                        onClick={() => setOpenRouterModel(combo.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          openRouterModel === combo.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:border-indigo-400'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{combo.id}</span>
                        <span className="text-[10px] opacity-75 font-normal">(Combo)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Searchable Model Picker */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                  Model đang chọn: <span className="font-mono text-indigo-600 font-bold">{openRouterModel || 'Chưa chọn'}</span>
                </label>

                {models.length > 0 ? (
                  <div className="space-y-2">
                    {/* Search input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Tìm kiếm trong ${models.length} model (vd: claude, gpt-6, o1, gehihi...)`}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                      />
                    </div>

                    {/* Filtered Model List (Scrollable) */}
                    <div className="max-h-44 overflow-y-auto border border-zinc-200 rounded-xl bg-white p-1 space-y-0.5">
                      {filteredModels.slice(0, 80).map((m) => (
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
                          Không tìm thấy model nào khớp với từ khóa "{searchQuery}".
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
                      placeholder="open, claude, gehihi, gpt-4o..."
                      className="w-full text-xs font-mono p-2.5 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Bấm nút <strong>"Quét danh sách Model"</strong> ở trên để tự động tải hơn 600+ model từ 9Router của bạn.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/80 shrink-0">
          <span className="text-[11px] text-zinc-500">
            {models.length > 0 ? `Đã đồng bộ ${models.length} model` : 'Chế độ: ' + (provider === 'pro' ? 'PRO (9Router)' : 'Miễn Phí')}
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
