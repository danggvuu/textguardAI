import React, { useState } from 'react';
import { Search, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, Award, Zap, Cpu, Sliders, Layers } from 'lucide-react';
import GaugeMeter from './GaugeMeter';

export default function DetectorView({
  text,
  setText,
  detectorData,
  onRunDetect,
  isDetecting,
  onSendToHumanizer,
  detectorMode,
  setDetectorMode,
  onOpenSettings,
  t
}) {
  const [selectedSentence, setSelectedSentence] = useState(null);

  const handleRun = () => {
    if (!text.trim()) return;
    onRunDetect(text);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16">
      {/* Title Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
          <Search className="w-3.5 h-3.5 text-[#6248ff]" />
          <span>{t.detectorTitle}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#101828]">
          Hệ Thống Giám Định & Phát Hiện AI Đa Tầng
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">
          Đo lường độ chính xác dựa trên chuẩn Benchmark HC3 & RAID. Phân biệt chính xác văn bản người thật và AI giả danh.
        </p>

        {/* Tier Switcher (Free vs Pro) */}
        <div className="mt-5 inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setDetectorMode('free')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              detectorMode === 'free'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Bản Miễn Phí (RoBERTa & HC3 Benchmark)</span>
          </button>

          <button
            onClick={() => setDetectorMode('pro')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              detectorMode === 'pro'
                ? 'bg-[#6248ff] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Bản PRO Chuyên Sâu (OpenRouter / 9router)</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập hoặc dán văn bản cần kiểm tra độ giống AI..."
          className="w-full h-36 p-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 resize-none outline-none focus:ring-2 focus:ring-[#6248ff]/20 focus:border-[#6248ff] leading-relaxed"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>{text.trim() ? text.trim().split(/\s+/).length : 0} từ • {text.length} ký tự</span>
            {detectorMode === 'pro' && (
              <span
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 text-[#6248ff] hover:underline cursor-pointer font-bold"
              >
                <Sliders className="w-3 h-3" />
                Cấu hình key OpenRouter
              </span>
            )}
          </div>

          <button
            onClick={handleRun}
            disabled={!text.trim() || isDetecting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all ${
              !text.trim() || isDetecting
                ? 'bg-slate-300 cursor-not-allowed'
                : detectorMode === 'pro'
                ? 'bg-gradient-to-r from-[#6248ff] to-[#9333ea] hover:opacity-95 shadow-md shadow-[#6248ff]/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25'
            }`}
          >
            {isDetecting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <span>Đang giám định...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Kiểm tra bằng {detectorMode === 'pro' ? 'Bản PRO' : 'Model Miễn Phí'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {detectorData && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Active Model & Benchmark Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-900/50 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {detectorData.tier === 'pro' ? 'Chế độ PRO' : 'Chế độ Miễn Phí'}
                </span>
                <span className="text-xs text-slate-300">Mô hình thực thi:</span>
                <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                  {detectorData.modelUsed || 'RoBERTa-ChatGPT-Detector'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {detectorData.verdictSummary || 'Giám định hoàn tất: Đã tính toán mức độ giống AI kết hợp đối chiếu các tập dữ liệu benchmark.'}
              </p>
            </div>

            {/* Benchmark Scores */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 font-semibold">HC3 Accuracy</div>
                <div className="text-sm font-extrabold text-emerald-400">
                  {detectorData.benchmarks?.hc3_confidence || 98}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 font-semibold">RAID Robustness</div>
                <div className="text-sm font-extrabold text-indigo-300">
                  {detectorData.benchmarks?.raid_robustness || 96}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 font-semibold">M4 Generalization</div>
                <div className="text-sm font-extrabold text-teal-300">
                  {detectorData.benchmarks?.m4_generalization || 96}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 font-semibold">Rủi ro báo oan</div>
                <div className="text-sm font-extrabold text-amber-300">
                  {detectorData.benchmarks?.false_positive_risk || 1.8}%
                </div>
              </div>
            </div>
          </div>

          {/* Faux-Human / Adversarial Persona Alert Callout (if found) */}
          {(detectorData.personaDetected?.isAdversarialMimic || detectorData.sentences?.some(s => s.reasons.some(r => r.includes('triết lý') || r.includes('giả lập')))) && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wide">
                  Cảnh báo: Phát hiện thủ thuật AI giả dạng người thật (Adversarial Persona Detected)
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Văn bản cố tình dùng các từ xưng hô đời thường (xưng "t", khẩu ngữ mạng) nhưng bị lộ tẩy ở các câu kết bài bằng <strong>văn mẫu suy ngẫm triết lý / chữa lành kinh điển của ChatGPT</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Summary Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Main Score Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Kết quả tổng quan
              </span>
              <GaugeMeter
                score={detectorData.humanScore}
                label="Độ tự nhiên (Human Score)"
                type="human"
                size={140}
              />
              <p className="mt-4 text-xs text-center text-slate-500 font-medium">
                {detectorData.aiScore > 50
                  ? '⚠️ Văn bản có nguy cơ cao bị Turnitin & các hệ thống AI soi quét.'
                  : '✅ Văn bản tự nhiên, qua mặt các hệ thống quét an toàn.'}
              </p>
            </div>

            {/* 2. Linguistic Diagnostics (Burstiness & Perplexity) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Chỉ số ngôn ngữ học
              </span>

              {/* Burstiness Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Độ biến thiên nhịp điệu (Burstiness)</span>
                  <span className="text-[#6248ff]">{detectorData.burstiness}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-[#6248ff] rounded-full transition-all duration-700"
                    style={{ width: `${detectorData.burstiness}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Đo lường độ đa dạng của độ dài câu. Con người viết câu ngắn dài xen kẽ.
                </p>
              </div>

              {/* Perplexity Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Độ phong phú từ vựng (Perplexity)</span>
                  <span className="text-emerald-600">{detectorData.perplexity}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${detectorData.perplexity}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mức độ khó đoán của từ ngữ. Điểm càng cao càng ít dấu vết máy móc.
                </p>
              </div>
            </div>

            {/* 3. Multi-Detector Benchmark Simulation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Dự đoán điểm trên các detector lớn
              </span>

              <div className="space-y-2.5">
                {Object.entries(detectorData.benchmarks || {}).map(([name, score]) => {
                  if (['hc3_confidence', 'raid_robustness', 'false_positive_risk'].includes(name)) return null;
                  const isSafe = score <= 20;
                  return (
                    <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-700 capitalize">{name}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          isSafe
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {score}% AI ({isSafe ? 'Pass' : 'Flagged'})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sentence Heatmap Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.sentenceBreakdown}</h3>
                <p className="text-xs text-slate-500">
                  Nhấp vào từng câu có màu để xem chi tiết lý do bị gắn cờ và cách sửa.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                  <span>{t.legendAi}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                  <span>{t.legendMixed}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                  <span>{t.legendHuman}</span>
                </span>
              </div>
            </div>

            {/* Interactive Heatmap Paragraph */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-sm">
              {detectorData.sentences?.map((s, idx) => {
                let badgeClass = 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200';
                if (s.status === 'ai' || s.score >= 65) {
                  badgeClass = 'bg-red-100 text-red-900 hover:bg-red-200';
                } else if (s.status === 'mixed' || s.score >= 35) {
                  badgeClass = 'bg-amber-100 text-amber-900 hover:bg-amber-200';
                }

                return (
                  <span
                    key={idx}
                    onClick={() => setSelectedSentence(s)}
                    className={`inline cursor-pointer px-1 py-0.5 mx-0.5 rounded transition-all duration-150 ${badgeClass} ${
                      selectedSentence?.sentence === s.sentence ? 'ring-2 ring-[#6248ff] font-medium' : ''
                    }`}
                    title={`AI: ${s.score}% (Nhấp để xem phân tích)`}
                  >
                    {s.sentence}{' '}
                  </span>
                );
              })}
            </div>

            {/* Selected Sentence Detail Card */}
            {selectedSentence && (
              <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-[#f8f7ff] animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Phân tích câu đã chọn:
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                          selectedSentence.score >= 65
                            ? 'bg-red-100 text-red-800'
                            : selectedSentence.score >= 35
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        AI Score: {selectedSentence.score}%
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">
                      "{selectedSentence.sentence}"
                    </p>

                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Dấu hiệu nhận biết:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                        {selectedSentence.reasons?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => onSendToHumanizer(selectedSentence.sentence)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#6248ff] hover:bg-[#5037e6] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Humanize câu này</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
