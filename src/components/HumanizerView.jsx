import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Clipboard,
  Trash2,
  Upload,
  Copy,
  Check,
  Download,
  Search,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HumanizerView({
  inputText,
  setInputText,
  humanizedText,
  setHumanizedText,
  beforeStats,
  afterStats,
  onHumanize,
  isProcessing,
  processingStage,
  onCheckAI,
  onViewDiff,
  onOpenPresets,
  t
}) {
  const [strength, setStrength] = useState('balanced');
  const [readability, setReadability] = useState('college');
  const [purpose, setPurpose] = useState('general');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Word and character counts
  const inputWords = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const inputChars = inputText.length;
  const outputWords = humanizedText.trim() ? humanizedText.trim().split(/\s+/).length : 0;
  const outputChars = humanizedText.length;

  // Handle Copy
  const handleCopy = () => {
    if (!humanizedText) return;
    navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      // Fallback
    }
  };

  // Handle Clear
  const handleClear = () => {
    setInputText('');
  };

  // Handle Download (.txt)
  const handleDownload = () => {
    if (!humanizedText) return;
    const blob = new Blob([humanizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `textguard-humanized-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        setInputText(data.text);
      }
    } catch (err) {
      alert('Không thể tải tệp: ' + err.message);
    }
  };

  const handleStartHumanize = () => {
    if (!inputText.trim()) return;
    onHumanize({ strength, readability, purpose });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16">
      {/* Configuration Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Humanization Strength */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-[#6248ff]" />
              {t.strengthLabel}
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStrength('light')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                  strength === 'light'
                    ? 'bg-white text-[#6248ff] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t.strengthLightDesc}
              >
                {t.strengthLight}
              </button>
              <button
                onClick={() => setStrength('balanced')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                  strength === 'balanced'
                    ? 'bg-white text-[#6248ff] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t.strengthBalancedDesc}
              >
                {t.strengthBalanced}
              </button>
              <button
                onClick={() => setStrength('aggressive')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                  strength === 'aggressive'
                    ? 'bg-white text-[#6248ff] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t.strengthAggressiveDesc}
              >
                {t.strengthAggressive}
              </button>
            </div>
          </div>

          {/* 2. Readability Level */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <Info className="w-3.5 h-3.5 text-[#6248ff]" />
              {t.readabilityLabel}
            </label>
            <select
              value={readability}
              onChange={(e) => setReadability(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none transition-all cursor-pointer"
            >
              <option value="high_school">{t.readabilityHighSchool}</option>
              <option value="college">{t.readabilityCollege}</option>
              <option value="journalist">{t.readabilityJournalist}</option>
              <option value="doctorate">{t.readabilityDoctorate}</option>
            </select>
          </div>

          {/* 3. Purpose */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6248ff]" />
              {t.purposeLabel}
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] outline-none transition-all cursor-pointer"
            >
              <option value="general">{t.purposeGeneral}</option>
              <option value="essay">{t.purposeEssay}</option>
              <option value="marketing">{t.purposeMarketing}</option>
              <option value="story">{t.purposeStory}</option>
              <option value="business">{t.purposeBusiness}</option>
              <option value="legal">{t.purposeLegal}</option>
            </select>
          </div>
        </div>

        {/* Target Detectors Bypass Indicator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-500">Mục tiêu qua mặt bộ kiểm tra:</span>
          <div className="flex flex-wrap items-center gap-2">
            {['Turnitin', 'GPTZero', 'CopyLeaks', 'ZeroGPT', 'CrossPlag'].map((det) => (
              <span
                key={det}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {det}: 99% Human
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Input Panel */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Input Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Văn bản AI gốc ({inputWords} {t.words})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                title="Dán từ Clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                {t.btnPaste}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                title="Tải tệp .txt, .docx, .md"
              >
                <Upload className="w-3.5 h-3.5" />
                {t.btnUpload}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={onOpenPresets}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#6248ff] hover:bg-[#6248ff]/10 rounded-md transition-colors"
              >
                {t.btnSamples}
              </button>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                  title={t.btnClear}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Input Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="w-full flex-1 min-h-[340px] p-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none outline-none leading-relaxed font-normal"
          />

          {/* Input Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              <span>{inputWords} {t.words}</span>
              <span>•</span>
              <span>{inputChars} {t.chars}</span>
            </div>
            {beforeStats && (
              <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                AI Score: {beforeStats.aiScore}%
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Output Panel */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
          {/* Output Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Văn bản tự nhiên ({outputWords} {t.words})
              </span>
              {afterStats && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  ★ {afterStats.humanScore}% {t.humanScore}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {humanizedText && (
                <>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t.btnCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.btnCopy}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                    title="Tải tệp .txt"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.btnDownload}</span>
                  </button>

                  <button
                    onClick={onViewDiff}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#6248ff] hover:bg-[#6248ff]/10 rounded-md transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t.btnViewDiff}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output Textarea / Result Content */}
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={humanizedText}
              onChange={(e) => setHumanizedText(e.target.value)}
              placeholder={t.outputPlaceholder}
              className="w-full flex-1 min-h-[340px] p-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none outline-none leading-relaxed font-normal"
            />

            {/* Processing Overlay with Dynamic Stages */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="relative w-16 h-16 mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#6248ff] animate-spin"></div>
                  <Sparkles className="w-7 h-7 text-[#6248ff] absolute inset-0 m-auto animate-pulse" />
                </div>
                <h4 className="font-bold text-base text-[#101828] mb-1">
                  Đang nhân bản hóa văn bản...
                </h4>
                <p className="text-sm text-[#6248ff] font-semibold transition-all">
                  {processingStage || t.stages[0]}
                </p>
                <div className="w-48 bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#6248ff] to-[#db2777] animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Output Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              <span>{outputWords} {t.words}</span>
              <span>•</span>
              <span>{outputChars} {t.chars}</span>
            </div>

            {humanizedText && (
              <button
                onClick={onCheckAI}
                className="flex items-center gap-1.5 text-xs font-bold text-[#6248ff] hover:text-[#5037e6] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.btnCheckAI}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <button
          onClick={handleStartHumanize}
          disabled={!inputText.trim() || isProcessing}
          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base md:text-lg text-white shadow-lg transition-all ${
            !inputText.trim() || isProcessing
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#6248ff] via-[#745bfd] to-[#9333ea] hover:from-[#5037e6] hover:to-[#7e22ce] shadow-[#6248ff]/25 hover:shadow-xl hover:shadow-[#6248ff]/35 transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
          <span>{isProcessing ? t.btnProcessing : t.btnHumanize}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.2]" />
        </button>

        <p className="mt-3 text-xs text-slate-500 font-medium">
          🔒 Bảo mật 100% • Văn bản không được lưu trữ hay sử dụng để huấn luyện mô hình
        </p>
      </div>
    </div>
  );
}
