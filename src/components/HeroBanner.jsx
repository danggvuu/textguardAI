import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { ShimmeringText } from '@animate-ui/react/primitives/texts/shimmering';

export default function HeroBanner({ t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-center pt-8 pb-6 px-4 max-w-4xl mx-auto"
    >
      {/* Pill Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-800 text-xs font-semibold mb-3.5 shadow-2xs hover:bg-zinc-200/50 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
        <span>Vượt qua Turnitin, GPTZero & ZeroGPT 100%</span>
        <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
        <span className="text-indigo-600 font-bold">Chuẩn HC3 & RAID</span>
      </motion.div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.18] mb-3">
        {t.heroTitle}{' '}
        <span className="relative inline-block">
          <ShimmeringText
            text={t.heroHighlight}
            color="#4f46e5"
            shimmeringColor="#ec4899"
            duration={2.5}
            className="font-extrabold"
          />
        </span>
      </h1>

      <p className="text-sm md:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-4">
        {t.heroSubtitle}
      </p>
    </motion.div>
  );
}
