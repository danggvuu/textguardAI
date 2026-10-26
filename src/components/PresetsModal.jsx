import React, { useEffect, useState, useMemo } from 'react';
import { X, Sparkles, Check, FileText, ShieldCheck, AlertTriangle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button as AnimateButton } from '@animate-ui/react/primitives/buttons/button';

export default function PresetsModal({ isOpen, onClose, onSelectPreset }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'ai' | 'human' | 'vi' | 'en'

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

  const filteredPresets = useMemo(() => {
    if (activeFilter === 'all') return presets;
    if (activeFilter === 'ai') return presets.filter((p) => p.type === 'ai');
    if (activeFilter === 'human') return presets.filter((p) => p.type === 'human');
    if (activeFilter === 'vi') return presets.filter((p) => p.language === 'vi');
    if (activeFilter === 'en') return presets.filter((p) => p.language === 'en');
    return presets;
  }, [presets, activeFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6248ff]/10 flex items-center justify-center text-[#6248ff]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#101828]">Kho Mẫu Thử Nghiệm Chuẩn Benchmark</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Stanford HC3 & RAID Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    12 kịch bản thực tế gồm 5 mẫu đối chứng người viết (FPR = 0%) và 7 mẫu tấn công AI phức tạp
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Lọc:</span>
              </div>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({presets.length})
              </button>
              <button
                onClick={() => setActiveFilter('human')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'human'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Người thật / Đối chứng (5)</span>
              </button>
              <button
                onClick={() => setActiveFilter('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === 'ai'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AI & Tấn công tinh vi (7)</span>
              </button>
              <button
                onClick={() => setActiveFilter('vi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'vi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                onClick={() => setActiveFilter('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'en'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                🇬🇧 Tiếng Anh
              </button>
            </div>

            {/* List of Presets */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loading ? (
                <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#6248ff] border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tải danh sách mẫu benchmark...</span>
                </div>
              ) : filteredPresets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">Không có mẫu nào phù hợp với bộ lọc.</div>
              ) : (
                filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#6248ff]/50 bg-white hover:bg-[#fbfaff] transition-all cursor-pointer group shadow-2xs"
                    onClick={() => {
                      onSelectPreset(preset.text);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#101828] group-hover:text-[#6248ff] transition-colors">
                            {preset.title}
                          </span>
                          {preset.type === 'human' ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Người viết (FPR test)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>AI / Tấn công</span>
                            </span>
                          )}
                          {preset.benchmark && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {preset.benchmark}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-[#6248ff]">
                            {preset.language.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <AnimateButton asChild hoverScale={1.04} tapScale={0.96}>
                        <button className="flex items-center gap-1 text-xs font-bold text-[#6248ff] group-hover:underline shrink-0 bg-[#6248ff]/10 hover:bg-[#6248ff]/20 px-3 py-1.5 rounded-lg transition-colors">
                          <span>Chọn mẫu</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </AnimateButton>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-2 italic font-mono text-[11px] leading-relaxed">
                      "{preset.text}"
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
