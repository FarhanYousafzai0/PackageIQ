import React from 'react';
import { Users } from 'lucide-react';

const healthColors = {
  thriving: { badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300', label: 'Thriving' },
  healthy: { badge: 'border-sky-500/20 bg-sky-500/10 text-sky-300', label: 'Healthy' },
  moderate: { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-200', label: 'Moderate' },
  quiet: { badge: 'border-white/10 bg-white/5 text-slate-300', label: 'Quiet' },
};

const signalStyles = {
  positive: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  neutral: 'border-white/10 bg-white/5 text-slate-300',
};

const CommunityPulse = ({ communityPulse }) => {
  if (!communityPulse) return null;

  const { health, signals } = communityPulse;
  const colors = healthColors[health] || healthColors.moderate;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
      <div className="mb-5 flex items-center gap-3">
        <Users className="h-5 w-5 text-cyan-300" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Community Pulse</h3>
          <p className="text-sm text-slate-400">Engagement health and community activity signals.</p>
        </div>
      </div>

      <div className="mb-5">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {signals?.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {signals.map((signal) => (
            <div
              key={signal.key}
              className={`rounded-2xl border p-4 ${signalStyles[signal.tone] || signalStyles.neutral}`}
            >
              <p className="text-sm font-semibold">{signal.label}</p>
              <p className="mt-2 text-sm text-slate-300">{signal.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPulse;
