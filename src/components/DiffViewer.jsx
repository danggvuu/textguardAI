import React, { useMemo } from 'react';
import { diffWords } from 'diff';
import { ArrowLeft, Sparkles, CheckCircle2, Layers } from 'lucide-react';

export default function DiffViewer({ originalText, humanizedText, onBack, t }) {
  const differences = useMemo(() => {
    if (!originalText || !humanizedText) return [];
    return diffWords(originalText, humanizedText);
  }, [originalText, humanizedText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    differences.forEach((part) => {
      if (part.added) added++;
      if (part.removed) removed++;
    });
    return { added, removed };
  }, [differences]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6248ff] hover:text-[#5037e6] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trình soạn thảo</span>
          </button>
          <h2 className="text-2xl font-extrabold text-[#101828] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#6248ff]" />
            {t.diffTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.diffSubtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-md border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {t.diffLegendRemoved} ({stats.removed})
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {t.diffLegendAdded} ({stats.added})
          </span>
        </div>
      </div>

      {/* Main Diff Display Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 leading-loose text-sm text-slate-800">
        {differences.length === 0 ? (
          <p className="text-slate-400 italic text-center py-12">
            Chưa có nội dung để so sánh. Vui lòng chạy "Chuyển thành văn bản tự nhiên" trước.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 font-normal">
              {differences.map((part, index) => {
                if (part.added) {
                  return (
                    <span
                      key={index}
                      className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-medium border border-emerald-200/50"
                      title="Nội dung đã được nhân bản hóa"
                    >
                      {part.value}
                    </span>
                  );
                }
                if (part.removed) {
                  return (
                    <span
                      key={index}
                      className="bg-red-100 text-red-700 line-through px-1 py-0.5 rounded opacity-75 border border-red-200/50"
                      title="Khuôn mẫu AI bị loại bỏ"
                    >
                      {part.value}
                    </span>
                  );
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
