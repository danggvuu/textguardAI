import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function HeroBanner({ t }) {
  return (
    <div className="w-full text-center py-8 md:py-12 px-4 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4f1ff] border border-[#e4e0fe] text-[#6248ff] text-xs md:text-sm font-semibold mb-4 shadow-2xs">
        <Sparkles className="w-4 h-4 text-[#6248ff]" />
        <span>Vượt qua Turnitin, GPTZero & ZeroGPT 100%</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#101828] tracking-tight leading-[1.15] mb-4">
        {t.heroTitle}
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6248ff] via-[#856dfa] to-[#db2777]">
          {t.heroHighlight}
        </span>
      </h1>

      <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
        {t.heroSubtitle}
      </p>

      {/* Feature bullet pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-slate-600 font-medium">
        <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Giữ nguyên 100% ngữ nghĩa & dữ liệu
        </span>
        <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Tăng độ biến thiên câu (Burstiness)
        </span>
        <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Hỗ trợ cả Tiếng Việt & Tiếng Anh
        </span>
      </div>
    </div>
  );
}
