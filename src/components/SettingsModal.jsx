import React, { useState, useEffect } from 'react';
import { X, Sliders, Key, Cpu, Check, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, t }) {
  const [provider, setProvider] = useState('local');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedProvider = localStorage.getItem('tg_provider') || 'local';
      const storedKey = localStorage.getItem('tg_api_key') || '';
      const storedModel = localStorage.getItem('tg_model') || 'gemini-1.5-flash';

      setProvider(storedProvider);
      setApiKey(storedKey);
      setModel(storedModel);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('tg_provider', provider);
    localStorage.setItem('tg_api_key', apiKey.trim());
    localStorage.setItem('tg_model', model);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6248ff]/10 flex items-center justify-center text-[#6248ff]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#101828]">{t.settingsTitle}</h3>
              <p className="text-xs text-slate-500">Tùy biến động cơ nhân bản hóa văn bản</p>
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
              {t.settingsEngine}
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  provider === 'local'
                    ? 'border-[#6248ff] bg-[#f8f7ff]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === 'local'}
                  onChange={() => setProvider('local')}
                  className="mt-1 text-[#6248ff] focus:ring-[#6248ff]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Smart NLP Offline Engine
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Mặc định • Miễn phí
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sử dụng bộ quy tắc ngôn ngữ học tái cấu trúc câu, loại bỏ cliché và tăng Burstiness cục bộ không cần API Key.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  provider === 'gemini'
                    ? 'border-[#6248ff] bg-[#f8f7ff]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                  className="mt-1 text-[#6248ff] focus:ring-[#6248ff]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Google Gemini API</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-[#6248ff]">
                      Tốc độ cao • Siêu tự nhiên
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sử dụng prompt anti-detection chuyên sâu trên Gemini Flash để biến đổi câu từ sâu nhất.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  provider === 'openai'
                    ? 'border-[#6248ff] bg-[#f8f7ff]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === 'openai'}
                  onChange={() => setProvider('openai')}
                  className="mt-1 text-[#6248ff] focus:ring-[#6248ff]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">OpenAI API (GPT-4o)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sử dụng mô hình OpenAI với chỉ dẫn ngôn ngữ học chống gắn cờ AI.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* API Key Input (if LLM selected) */}
          {provider !== 'local' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <span>{t.settingsApiKey} ({provider.toUpperCase()})</span>
                  <a
                    href={provider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://platform.openai.com/api-keys'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6248ff] hover:underline normal-case text-[11px] font-semibold"
                  >
                    Lấy khóa API miễn phí →
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Dán ${provider === 'gemini' ? 'Gemini AI Studio Key' : 'OpenAI sk-...'} vào đây`}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settingsModel}
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none bg-white cursor-pointer"
                >
                  {provider === 'gemini' ? (
                    <>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Mới nhất, siêu nhanh)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ổn định)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Sâu sắc nhất)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">GPT-4o Mini (Nhanh & tiết kiệm)</option>
                      <option value="gpt-4o">GPT-4o (Chất lượng cao nhất)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{t.apiKeyHint}</span>
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
            {t.settingsClose}
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
              <span>{t.settingsSave}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
