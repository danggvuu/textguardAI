import React, { useState, useEffect } from 'react';
import { X, Sliders, Key, Cpu, Check, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, t }) {
  const [provider, setProvider] = useState('free');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterBaseUrl, setOpenRouterBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.0-flash-001');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedProvider = localStorage.getItem('tg_provider') || 'free';
      const storedOrKey = localStorage.getItem('tg_openrouter_key') || '';
      const storedOrUrl = localStorage.getItem('tg_openrouter_url') || 'https://openrouter.ai/api/v1';
      const storedOrModel = localStorage.getItem('tg_openrouter_model') || 'google/gemini-2.0-flash-001';

      setProvider(storedProvider);
      setOpenRouterKey(storedOrKey);
      setOpenRouterBaseUrl(storedOrUrl);
      setOpenRouterModel(storedOrModel);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('tg_provider', provider);
    localStorage.setItem('tg_openrouter_key', openRouterKey.trim());
    localStorage.setItem('tg_openrouter_url', openRouterBaseUrl.trim());
    localStorage.setItem('tg_openrouter_model', openRouterModel.trim());
    
    // Also save as global api key for humanizer
    localStorage.setItem('tg_api_key', openRouterKey.trim());
    localStorage.setItem('tg_model', openRouterModel.trim());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6248ff]/10 flex items-center justify-center text-[#6248ff]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#101828]">Cấu hình Model & API Detector</h3>
              <p className="text-xs text-slate-500">Chọn chế độ Miễn phí (Free) hoặc cắm key OpenRouter (9router)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Engine Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Chế độ vận hành
            </label>
            <div className="space-y-2.5">
              {/* Option 1: Free Mode */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  provider === 'free'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Bản Miễn Phí (Free Model + HC3 Benchmark)
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      100% Free
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Sử dụng mô hình <strong>RoBERTa-ChatGPT-Detector</strong> (Hugging Face) kết hợp thuật toán giám định ngôn ngữ học đa tầng (HC3 & RAID Standard). Tự động phát hiện chiêu trò xưng "t" và văn mẫu triết lý chữa lành.
                  </p>
                </div>
              </label>

              {/* Option 2: Pro Mode (OpenRouter / 9router) */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  provider === 'pro'
                    ? 'border-[#6248ff] bg-[#f8f7ff] ring-1 ring-[#6248ff]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === 'pro'}
                  onChange={() => setProvider('pro')}
                  className="mt-1 text-[#6248ff] focus:ring-[#6248ff]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Bản Chuyên Sâu PRO (Cắm Key OpenRouter / 9router)
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-[#6248ff]">
                      VIP • Deep Forensic
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Sử dụng các mô hình hàng đầu (Claude 3.5 Sonnet, GPT-4o, Gemini 2.0 Flash) đóng vai trò Giám định viên Ngôn ngữ học để bóc trần mọi thủ thuật lách AI tinh vi nhất.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* OpenRouter Inputs (when Pro selected) */}
          {provider === 'pro' && (
            <div className="space-y-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-200">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <span>Khóa OpenRouter API Key ("9router")</span>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6248ff] hover:underline normal-case text-[11px] font-semibold"
                  >
                    Lấy key tại OpenRouter.ai →
                  </a>
                </label>
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={openRouterBaseUrl}
                    onChange={(e) => setOpenRouterBaseUrl(e.target.value)}
                    placeholder="https://openrouter.ai/api/v1"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Model giám định
                  </label>
                  <select
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none bg-white cursor-pointer"
                  >
                    <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash (Cực nhanh & sắc)</option>
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Giám định đỉnh cao)</option>
                    <option value="openai/gpt-4o">GPT-4o (Chuẩn mực)</option>
                    <option value="openai/gpt-4o-mini">GPT-4o Mini (Tiết kiệm)</option>
                    <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-indigo-50 text-indigo-900 text-[11px] border border-indigo-200">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#6248ff] mt-0.5" />
                <span>Khóa API được lưu an toàn trong trình duyệt (localStorage) của bạn và truyền thẳng qua backend tới OpenRouter.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#6248ff] hover:bg-[#5037e6] rounded-xl shadow-xs transition-colors"
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
  );
}
