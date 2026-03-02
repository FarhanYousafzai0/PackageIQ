import React from 'react';
import { ArrowRightLeft, GitCompare, Sparkles } from 'lucide-react';

const labelMap = {
  lighter: 'Lighter',
  safer: 'Safer',
  'more-popular': 'More popular',
  'better-maintained': 'Better maintained',
};

const colorMap = {
  lighter: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  safer: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  'more-popular': 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
  'better-maintained': 'border-amber-300/20 bg-amber-300/10 text-amber-100',
};

const AlternativesPanel = ({ packageName, alternatives = [], onCompare }) => {
  if (!alternatives.length) return null;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <ArrowRightLeft className="h-5 w-5 text-fuchsia-300" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Alternatives to Review</h3>
          <p className="text-sm text-slate-400">Compare this package before you commit to it in production.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {alternatives.map((alternative) => (
          <div key={alternative.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-100">{alternative.name}</p>
                <p className="mt-1 text-sm text-slate-400">{alternative.reason}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${colorMap[alternative.relativeStrength] || colorMap.safer}`}>
                {labelMap[alternative.relativeStrength] || 'Alternative'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onCompare?.(packageName, alternative.name)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-white"
            >
              <GitCompare className="h-4 w-4" />
              Compare now
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        These are seeded by package family and common frontend replacement patterns.
      </div>
    </div>
  );
};

export default AlternativesPanel;
