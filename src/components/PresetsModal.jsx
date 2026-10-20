import React, { useEffect, useState } from 'react';
import { X, Sparkles, Check, FileText } from 'lucide-react';

export default function PresetsModal({ isOpen, onClose, onSelectPreset }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/presets')
        .then((res) => res.json())
        .then((data) => {
          setPresets(data.presets || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6248ff]/10 flex items-center justify-center text-[#6248ff]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#101828]">Kho mẫu văn bản AI để thử nghiệm</h3>
              <p className="text-xs text-slate-500">Chọn một bài mẫu do ChatGPT tạo để kiểm tra ngay lập tức</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Presets */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Đang tải danh sách mẫu...</div>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#6248ff]/40 bg-white hover:bg-[#fbfaff] transition-all cursor-pointer group"
                onClick={() => {
                  onSelectPreset(preset.text);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#101828] group-hover:text-[#6248ff] transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#6248ff]">
                      {preset.language.toUpperCase()}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-bold text-[#6248ff] group-hover:underline">
                    <span>Dùng mẫu này</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-2 font-medium">{preset.description}</p>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3 italic">
                  "{preset.text}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
