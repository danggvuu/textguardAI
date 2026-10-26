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
  Info,
  CornerDownLeft,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import { Shine } from '@animate-ui/react/primitives/effects/shine';
import { Button as AnimateButton } from '@animate-ui/react/primitives/buttons/button';

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
  onShowToast,
  t
}) {
  const [strength, setStrength] = useState('balanced');
  const [readability, setReadability] = useState('college');
  const [purpose, setPurpose] = useState('general');
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState('');
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
    onShowToast?.({ message: 'Đã sao chép văn bản vào bộ nhớ tạm', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        onShowToast?.({ message: 'Đã dán văn bản từ bộ nhớ tạm', type: 'info' });
      }
    } catch {
      // Fallback
    }
  };

  // Handle Clear
  const handleClear = () => {
    setInputText('');
    setLoadedFileName('');
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
    onShowToast?.({ message: 'Đang tải xuống tệp .txt', type: 'success' });
  };

  // Handle File Upload (.pdf, .docx, .txt, .md)
  const handleFileProcess = async (file) => {
    if (!file) return;
    setIsFileLoading(true);
    setLoadedFileName(file.name);

    try {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

      // Ultra-fast client-side reading for plain text & markdown
      if (ext === '.txt' || ext === '.md') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          setInputText(content);
          setIsFileLoading(false);
          const count = content.trim().split(/\s+/).filter(Boolean).length;
          onShowToast?.({ message: `Đã nhập tệp: ${file.name} (${count} từ)`, type: 'success' });
        };
        reader.onerror = () => {
          setIsFileLoading(false);
          onShowToast?.({ message: 'Không thể đọc tệp văn bản', type: 'error' });
        };
        reader.readAsText(file);
        return;
      }

      // For .docx and .pdf, use serverless upload endpoint
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi khi trích xuất tệp');
      }

      if (data.text) {
        setInputText(data.text);
        onShowToast?.({
          message: `Đã nhập tệp: ${data.filename} (${data.wordCount || data.text.split(/\s+/).filter(Boolean).length} từ)`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('File upload error:', err);
      onShowToast?.({ message: 'Không thể đọc tệp: ' + err.message, type: 'error' });
      setLoadedFileName('');
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleStartHumanize = () => {
    if (!inputText.trim()) return;
    onHumanize({ strength, readability, purpose });
  };

  // Keyboard shortcut listener (Cmd/Ctrl + Enter)
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleStartHumanize();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16">
      {/* Control Strip (Shadcn style toolbar) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strength selector */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.strengthLabel}</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
              <button
                onClick={() => setStrength('light')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  strength === 'light'
                    ? 'bg-white text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title={t.strengthLightDesc}
              >
                {t.strengthLight}
              </button>
              <button
                onClick={() => setStrength('balanced')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  strength === 'balanced'
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title={t.strengthBalancedDesc}
              >
                {t.strengthBalanced}
              </button>
              <button
                onClick={() => setStrength('aggressive')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  strength === 'aggressive'
                    ? 'bg-white text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title={t.strengthAggressiveDesc}
              >
                {t.strengthAggressive}
              </button>
            </div>
          </div>

          {/* Readability selector */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.readabilityLabel}</span>
            </label>
            <select
              value={readability}
              onChange={(e) => setReadability(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all cursor-pointer"
            >
              <option value="high_school">{t.readabilityHighSchool}</option>
              <option value="college">{t.readabilityCollege}</option>
              <option value="journalist">{t.readabilityJournalist}</option>
              <option value="doctorate">{t.readabilityDoctorate}</option>
            </select>
          </div>

          {/* Purpose selector */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.purposeLabel}</span>
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all cursor-pointer"
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

        {/* Quick sample chips */}
        <div className="mt-3.5 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="font-medium text-[11px]">Thử nhanh văn bản mẫu:</span>
            <button
              onClick={onOpenPresets}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800 text-[11px] font-semibold transition-colors"
            >
              <FileText className="w-3 h-3 text-indigo-600" />
              <span>Chọn bài mẫu AI có sẵn...</span>
            </button>
          </div>

          {/* Target Detector Bypass Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['Turnitin', 'GPTZero', 'CopyLeaks', 'ZeroGPT'].map((det) => (
              <span
                key={det}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {det} Pass
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Dual-Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left Pane: Source Text */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileProcess(e.dataTransfer.files[0]);
          }}
          className={`flex flex-col bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
            isDragOver ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-zinc-200/80'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-800 tracking-wide">Văn bản AI gốc</span>
              <span className="text-[11px] text-zinc-400 font-mono">({inputWords} {t.words})</span>
              {loadedFileName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <FileText className="w-3 h-3 text-indigo-600" />
                  <span className="max-w-[140px] truncate" title={loadedFileName}>{loadedFileName}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 rounded-md transition-colors"
                title="Dán từ Clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-zinc-500" />
                <span>{t.btnPaste}</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isFileLoading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 rounded-md transition-colors disabled:opacity-50"
                title="Tải tệp .pdf, .docx, .txt, .md"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-500" />
                <span>{isFileLoading ? 'Đang đọc...' : t.btnUpload}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => handleFileProcess(e.target.files?.[0])}
                className="hidden"
              />
              {inputText && (
                <button
                  onClick={handleClear}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-md transition-colors"
                  title={t.btnClear}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Textarea container */}
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.inputPlaceholder}
              className="w-full flex-1 min-h-[380px] p-4 text-sm text-zinc-800 placeholder-zinc-400 bg-transparent resize-none outline-none leading-relaxed font-normal"
            />
            {isFileLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-2"></div>
                <p className="text-xs font-bold text-zinc-800">Đang trích xuất nội dung từ tệp...</p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{loadedFileName}</p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-100 bg-zinc-50/40 text-[11px] text-zinc-500 font-mono">
            <span>{inputWords} từ • {inputChars} ký tự</span>
            {beforeStats && (
              <span className="font-sans font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                AI Score: {beforeStats.aiScore}%
              </span>
            )}
          </div>
        </div>

        {/* Right Pane: Humanized Output */}
        <div className="flex flex-col bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden relative">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-800 tracking-wide">Văn bản tự nhiên hóa</span>
              {afterStats && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ★ <CountingNumber number={afterStats.humanScore} fromNumber={0} />% {t.humanScore}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {humanizedText && (
                <>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{t.btnCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{t.btnCopy}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t.btnDownload}</span>
                  </button>

                  <button
                    onClick={onViewDiff}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t.btnViewDiff}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Textarea / Output container */}
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={humanizedText}
              onChange={(e) => setHumanizedText(e.target.value)}
              placeholder={t.outputPlaceholder}
              className="w-full flex-1 min-h-[380px] p-4 text-sm text-zinc-800 placeholder-zinc-400 bg-transparent resize-none outline-none leading-relaxed font-normal"
            />

            {/* Scanning / Processing State Animation */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20"
                >
                  <div className="relative w-16 h-16 mb-4">
                    <div className="w-16 h-16 rounded-full border-3 border-zinc-100 border-t-indigo-600 animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h4 className="font-extrabold text-sm text-zinc-900 mb-1">
                    Đang nhân bản hóa văn bản...
                  </h4>
                  <p className="text-xs text-indigo-600 font-semibold max-w-sm">
                    {processingStage || t.stages[0]}
                  </p>
                  <div className="w-48 bg-zinc-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-100 bg-zinc-50/40 text-[11px] text-zinc-500 font-mono">
            <span>{outputWords} từ • {outputChars} ký tự</span>

            {humanizedText && (
              <button
                onClick={onCheckAI}
                className="font-sans flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.btnCheckAI}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Button with Animate UI Spring & Shine */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <AnimateButton asChild hoverScale={1.02} tapScale={0.98}>
          <button
            onClick={handleStartHumanize}
            disabled={!inputText.trim() || isProcessing}
            className={`relative overflow-hidden flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
              !inputText.trim() || isProcessing
                ? 'bg-zinc-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30'
            }`}
          >
            {!isProcessing && inputText.trim() && (
              <Shine loop loopDelay={3} duration={2.2} opacity={0.35} />
            )}
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? t.btnProcessing : t.btnHumanize}</span>
            <div className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">
              <CornerDownLeft className="w-3 h-3" />
              <span>Enter</span>
            </div>
          </button>
        </AnimateButton>

        <p className="mt-2.5 text-[11px] text-zinc-500 font-medium">
          🔒 Quyền riêng tư đảm bảo • Không lưu trữ hay huấn luyện văn bản của bạn
        </p>
      </div>
    </div>
  );
}
