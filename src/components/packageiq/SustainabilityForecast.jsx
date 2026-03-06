import React from 'react';
import { TrendingUp } from 'lucide-react';

const outlookColors = {
  strong: { badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300', bar: 'bg-emerald-400', label: 'Strong' },
  moderate: { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-200', bar: 'bg-amber-400', label: 'Moderate' },
  declining: { badge: 'border-red-500/20 bg-red-500/10 text-red-300', bar: 'bg-red-400', label: 'Declining' },
};

const signalStyles = {
  positive: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  neutral: 'border-white/10 bg-white/5 text-slate-300',
};

const SustainabilityForecast = ({ sustainability }) => {
  if (!sustainability) return null;

  const { outlook, confidence, signals } = sustainability;
  const colors = outlookColors[outlook] || outlookColors.moderate;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
      <div className="mb-5 flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-cyan-300" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Sustainability Forecast</h3>
          <p className="text-sm text-slate-400">Long-term outlook and maintenance sustainability.</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${colors.badge}`}>
          {colors.label}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Confidence</span>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-200">{confidence}%</span>
        </div>
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

export default SustainabilityForecast;
