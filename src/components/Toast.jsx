import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'success' } = toast;

  const bgStyles = {
    success: 'bg-zinc-900 text-white border-zinc-800',
    error: 'bg-rose-950 text-rose-100 border-rose-900',
    info: 'bg-zinc-900 text-white border-zinc-800'
  }[type] || 'bg-zinc-900 text-white border-zinc-800';

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  }[type] || CheckCircle2;

  const iconColors = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-indigo-400'
  }[type] || 'text-emerald-400';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${bgStyles} min-w-[280px] max-w-md`}>
        <Icon className={`w-4 h-4 shrink-0 ${iconColors}`} />
        <span className="text-xs font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
