import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

const compareSuggestions = [
  ['axios', 'ky'],
  ['moment', 'date-fns'],
  ['formik', 'react-hook-form'],
  ['redux', 'zustand'],
  ['@tanstack/react-query', 'swr'],
  ['lodash', 'radash'],
];

const CompareLauncher = ({
  packageOne,
  packageTwo,
  setPackageOne,
  setPackageTwo,
  onSubmit,
  loading = false,
  compact = false,
  title = 'Compare two packages',
}) => {
  return (
    <div className={`rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl ${compact ? '' : 'shadow-[0_30px_120px_-60px_rgba(34,211,238,0.45)]'}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-slate-400">Enter any two npm packages to compare trust, maintenance, bundle cost, and decision fit.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <input
          type="text"
          value={packageOne}
          onChange={(e) => setPackageOne(e.target.value)}
          placeholder="First package, e.g. axios"
          className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        />
        <input
          type="text"
          value={packageTwo}
          onChange={(e) => setPackageTwo(e.target.value)}
          placeholder="Second package, e.g. ky"
          className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        />
        <button
          type="submit"
          disabled={loading || !packageOne.trim() || !packageTwo.trim()}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Suggested comparisons</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {compareSuggestions.map(([left, right]) => (
            <button
              key={`${left}-${right}`}
              type="button"
              onClick={() => {
                setPackageOne(left);
                setPackageTwo(right);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-white"
            >
              {left} vs {right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareLauncher;
