import React from 'react';
import { Brain, CheckCircle, AlertTriangle, XCircle, Info, ArrowRight } from 'lucide-react';

const AIVerdict = ({ verdict }) => {
  if (!verdict) return null;

  const getOverallColor = (overall) => {
    switch (overall) {
      case 'recommended':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
          text: 'text-emerald-400',
        };
      case 'not-recommended':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          icon: <XCircle className="w-6 h-6 text-red-400" />,
          text: 'text-red-400',
        };
      default:
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          text: 'text-amber-400',
        };
    }
  };

  const getVerdictIcon = (type) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />;
      case 'negative':
        return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />;
    }
  };

  const colors = getOverallColor(verdict.overall);

  return (
    <div className={`p-6 rounded-[1.75rem] border ${colors.border} ${colors.bg} backdrop-blur-xl card-hover`}>
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-200">Decision Summary</h3>
      </div>
      
      {/* Overall recommendation */}
      <div className="flex items-start gap-4 mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
        <div className="p-2 rounded-lg bg-slate-800">
          {colors.icon}
        </div>
        <div>
          <p className={`font-semibold text-lg ${colors.text}`}>
            {verdict.label === 'install' && 'Install'}
            {verdict.label === 'caution' && 'Use with Caution'}
            {verdict.label === 'good-but-heavy' && 'Good but Heavy'}
            {verdict.label === 'good-but-stale' && 'Good but Stale'}
            {verdict.label === 'prefer-alternative' && 'Prefer Alternative'}
            {verdict.label === 'avoid' && 'Avoid'}
            {verdict.label === 'review' && 'Review First'}
          </p>
          <p className="text-slate-400 mt-1">{verdict.recommendation}</p>
          <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            Confidence {verdict.confidence}%
          </p>
        </div>
      </div>

      {verdict.reasons?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Why this recommendation</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {verdict.reasons.map((reason, index) => (
              <div key={index} className="rounded-xl bg-slate-900/30 p-3 text-sm text-slate-300">
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Verdict details */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Analysis Details
        </h4>
        {verdict.verdicts.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30">
            {getVerdictIcon(item.type)}
            <span className="text-slate-300 text-sm">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <div className="flex items-start gap-3">
          <ArrowRight className="mt-0.5 h-4 w-4 text-cyan-300" />
          <div>
            <p className="text-sm font-medium text-slate-100">Recommended next step</p>
            <p className="mt-1 text-sm text-slate-400">{verdict.nextStep}</p>
          </div>
        </div>
      </div>
      
      {/* Score badge */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-sm text-slate-400">Decision score</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
          {verdict.score}/100
        </span>
      </div>
    </div>
  );
};

export default AIVerdict;
