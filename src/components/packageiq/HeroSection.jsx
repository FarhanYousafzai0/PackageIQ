import React from 'react';
import { ArrowRight, Loader2, Search, Sparkles, Zap } from 'lucide-react';

const heroStats = [
  { label: 'Signals merged', value: 'npm + GitHub + Bundlephobia' },
  { label: 'Decision speed', value: 'One search, instant verdict' },
  { label: 'Best for', value: 'Research before install' },
];

const HeroSection = ({ loading, searchTerm, setSearchTerm, onSubmit }) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-10 shadow-[0_30px_120px_-40px_rgba(34,211,238,0.45)] backdrop-blur-xl sm:px-10 lg:px-12 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(244,114,182,0.18),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(2,6,23,0.82))]" />
      <div className="absolute -left-16 top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <Sparkles className="h-4 w-4" />
            Read package signals before they become production risk
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Choose packages with data,
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-300 bg-clip-text text-transparent">
              not guesswork.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            PackageIQ pulls registry activity, repository health, and bundle weight into one view so you can decide faster and compare with confidence.
          </p>

          <form id="search-form" onSubmit={onSubmit} className="mt-8">
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-3 shadow-[0_25px_80px_-40px_rgba(14,165,233,0.85)] sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search npm packages like react, vite, tanstack-query..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchTerm.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:min-w-[160px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    Analyze Package
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">What you get</p>
                <p className="text-lg font-semibold text-white">A fast pre-install audit</p>
              </div>
            </div>

            <div className="space-y-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-100">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Popularity</p>
              <p className="mt-2 text-lg font-semibold text-white">Download trends in context</p>
            </div>
            <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-200/70">Maintenance</p>
              <p className="mt-2 text-lg font-semibold text-white">Recent activity and repo signals</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-amber-100/70">Performance</p>
              <p className="mt-2 text-lg font-semibold text-white">Bundle cost before it hits users</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
