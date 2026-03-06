import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

const levelColors = {
  excellent: { badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300', stroke: '#34d399', text: 'text-emerald-400' },
  good: { badge: 'border-sky-500/20 bg-sky-500/10 text-sky-300', stroke: '#38bdf8', text: 'text-sky-400' },
  fair: { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-200', stroke: '#fbbf24', text: 'text-amber-400' },
  poor: { badge: 'border-red-500/20 bg-red-500/10 text-red-300', stroke: '#f87171', text: 'text-red-400' },
};

const DeveloperExperience = ({ devExperience }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!devExperience) return;
    const timer = setTimeout(() => setAnimatedScore(devExperience.score), 100);
    return () => clearTimeout(timer);
  }, [devExperience]);

  if (!devExperience) return null;

  const { score, level, signals } = devExperience;
  const colors = levelColors[level] || levelColors.fair;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
      <div className="mb-5 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-cyan-300" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Developer Experience</h3>
          <p className="text-sm text-slate-400">Documentation, API quality, and onboarding signals.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-6">
        <div className="relative shrink-0">
          <svg className="h-28 w-28 -rotate-90">
            <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="7" fill="transparent" className="text-slate-700" />
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke={colors.stroke}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold capitalize ${colors.badge}`}>
          {level}
        </div>
      </div>

      {signals?.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {signals.map((signal) => (
            <div
              key={signal.key}
              className={`rounded-2xl border p-4 ${
                signal.positive
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {signal.positive ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-500" />
                )}
                <p className="text-sm font-semibold">{signal.label}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{signal.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperExperience;
