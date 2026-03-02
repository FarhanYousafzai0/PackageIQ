import React from 'react';
import { Activity, Eye, GitCompare } from 'lucide-react';

const formatNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
};

const statsConfig = [
  { key: 'siteViews', label: 'Site views', icon: Eye },
  { key: 'packageSearches', label: 'Package checks', icon: Activity },
  { key: 'compareViews', label: 'Compare visits', icon: GitCompare },
];

const UsageStatsBar = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-full border border-white/10 bg-slate-950/50 px-4 py-3 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {statsConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-2 text-sm text-slate-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-cyan-300">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="font-semibold text-slate-100">{formatNumber(stats[key] || 0)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageStatsBar;
