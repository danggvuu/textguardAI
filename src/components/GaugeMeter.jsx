import React from 'react';

export default function GaugeMeter({ score = 100, label = 'Điểm người viết', type = 'human', size = 130 }) {
  // Score is 0 - 100
  // type can be 'human' (higher is green) or 'ai' (higher is red)
  const isGood = type === 'human' ? score >= 70 : score <= 30;
  const strokeColor = isGood ? '#16b364' : (score > 40 && score < 70 ? '#f59e0b' : '#f97066');
  const trackColor = '#eaecf0';

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  // Semicircle gauge or 3/4 circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 120 120"
        >
          {/* Background Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold tracking-tight text-[#101828]">
            {score}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {type === 'human' ? 'Con người' : 'AI'}
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-700 text-center">{label}</p>
      <span
        className={`mt-0.5 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          isGood
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {isGood ? '✓ An toàn' : '⚠ Cần sửa'}
      </span>
    </div>
  );
}
