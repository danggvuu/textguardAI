import React from 'react';
import { ShieldCheck, Sparkles, Sliders, Globe, Layers, Search, FileText } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, lang, setLang, onOpenSettings, onOpenPresets, t }) {
  return (
    <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      {/* Top promotional announcement banner (TextGuard style) */}
      <div className="w-full bg-gradient-to-r from-[#e4e0fe] via-[#f4f1ff] to-[#fbd8f9] py-2 px-4 text-center border-b border-indigo-100">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm font-semibold text-[#160b33]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{t.topAnnouncement}</span>
          <span className="hidden md:inline-block text-slate-400">|</span>
          <span className="hidden md:inline-flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
            ★ {t.rating}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('humanize')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6248ff] to-[#8d77ff] flex items-center justify-center text-white shadow-md shadow-[#6248ff]/25">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#101828]">TextGuard</span>
                <span className="bg-[#6248ff]/10 text-[#6248ff] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 font-medium">Humanizer & Detector</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('humanize')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'humanize'
                  ? 'bg-white text-[#6248ff] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {t.navHumanizer}
            </button>

            <button
              onClick={() => setActiveTab('detect')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'detect'
                  ? 'bg-white text-[#6248ff] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              {t.navDetector}
            </button>

            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'diff'
                  ? 'bg-white text-[#6248ff] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              {t.navDiff}
            </button>

            <button
              onClick={onOpenPresets}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all hover:bg-white/50"
            >
              <FileText className="w-4 h-4" />
              {t.navPresets}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Chuyển ngôn ngữ / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            </button>

            {/* API Settings */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Cài đặt API AI"
            >
              <Sliders className="w-3.5 h-3.5 text-[#6248ff]" />
              <span className="hidden sm:inline">{t.navSettings}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
