import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function HeroBanner({ t }) {
  return (
    <div className="w-full text-center pt-8 pb-6 px-4 max-w-4xl mx-auto">
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-800 text-xs font-semibold mb-3 shadow-2xs hover:bg-zinc-200/50 transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Vượt qua Turnitin, GPTZero & ZeroGPT 100%</span>
        <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
        <span className="text-indigo-600 font-bold">Chuẩn HC3 & RAID</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.15] mb-3">
        {t.heroTitle}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          {t.heroHighlight}
        </span>
      </h1>

      <p className="text-sm md:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-4">
        {t.heroSubtitle}
      </p>
    </div>
  );
}
