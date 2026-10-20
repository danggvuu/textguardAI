import React from 'react';
import { ShieldCheck, Sparkles, Sliders, Globe, Layers, Search, FileText, Zap, Cpu } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenSettings,
  onOpenPresets,
  currentEngine = 'free',
  activeModel = 'claude',
  t
}) {
  return (
    <header className="w-full border-b border-zinc-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro announcement bar */}
      <div className="w-full bg-zinc-900 text-zinc-300 py-1.5 px-4 text-center text-xs font-medium border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-200">{t.topAnnouncement}</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="hidden sm:inline-flex items-center text-amber-300 font-semibold">
            ★ {t.rating}
          </span>
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => setActiveTab('humanize')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-zinc-900">TextGuard</span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-indigo-200/60 uppercase tracking-wider">
                  AI Studio
                </span>
              </div>
            </div>
          </div>

          {/* Center Tabs: Shadcn Segmented Control */}
          <nav className="hidden md:flex items-center bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/70">
            <button
              onClick={() => setActiveTab('humanize')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'humanize'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.navHumanizer}</span>
            </button>

            <button
              onClick={() => setActiveTab('detect')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'detect'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.navDetector}</span>
            </button>

            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'diff'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.navDiff}</span>
            </button>

            <button
              onClick={onOpenPresets}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40 transition-all duration-150"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>{t.navPresets}</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Engine Badge Pill (Clickable) */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-150 cursor-pointer ${
                currentEngine === 'pro'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
              }`}
              title="Nhấp để thay đổi cấu hình Model & API"
            >
              {currentEngine === 'pro' ? (
                <>
                  <Zap className="w-3 h-3 fill-purple-600 text-purple-600" />
                  <span className="max-w-[130px] truncate">PRO: {activeModel || '9Router'}</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Free (HC3)</span>
                </>
              )}
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            </button>

            {/* Settings Dialog trigger */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-2xs"
              title="Cài đặt Model & API Key"
            >
              <Sliders className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
