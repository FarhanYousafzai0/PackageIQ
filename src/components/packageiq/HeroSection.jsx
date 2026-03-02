import React from 'react';
import { ArrowRight, Loader2, Search, Sparkles } from 'lucide-react';

const starterSearches = [
  'react',
  'vite',
  'react-hook-form',
  'axios',
];

const compareShortcuts = [
  ['axios', 'ky'],
  ['moment', 'date-fns'],
  ['formik', 'react-hook-form'],
  ['@tanstack/react-query', 'swr'],
];

const AnimatedPackageScene = () => (
  <div className="relative mx-auto flex h-[320px] w-full max-w-[360px] items-center justify-center">
    <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />
    <svg
      viewBox="0 0 420 320"
      className="relative h-full w-full"
      role="img"
      aria-label="Animated package intelligence illustration"
    >
      <defs>
        <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>

      <circle cx="210" cy="160" r="112" fill="rgba(15,23,42,0.72)" stroke="rgba(255,255,255,0.08)" />
      <circle cx="210" cy="160" r="90" fill="none" stroke="rgba(103,232,249,0.18)" strokeDasharray="8 10">
        <animateTransform attributeName="transform" type="rotate" from="0 210 160" to="360 210 160" dur="20s" repeatCount="indefinite" />
      </circle>

      <g>
        <path
          d="M120 186C150 134 198 116 252 118C290 120 320 134 344 164"
          fill="none"
          stroke="url(#lineGlow)"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dasharray" values="10 220;90 160;10 220" dur="5s" repeatCount="indefinite" />
        </path>
        <path
          d="M132 214C176 238 214 242 270 224C302 214 324 198 340 176"
          fill="none"
          stroke="rgba(125,211,252,0.55)"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dasharray" values="0 260;80 180;0 260" dur="4.2s" repeatCount="indefinite" />
        </path>
      </g>

      {[
        { x: 118, y: 110, label: 'npm', color: '#67e8f9', delay: '0s' },
        { x: 300, y: 92, label: 'GitHub', color: '#a78bfa', delay: '0.7s' },
        { x: 324, y: 220, label: 'Bundle', color: '#f9a8d4', delay: '1.4s' },
        { x: 110, y: 226, label: 'Score', color: '#86efac', delay: '2s' },
      ].map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="26" fill="rgba(15,23,42,0.95)" stroke={node.color} strokeWidth="2" />
          <circle cx={node.x} cy={node.y} r="34" fill="none" stroke={node.color} strokeOpacity="0.25">
            <animate attributeName="r" values="30;38;30" dur="4s" begin={node.delay} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.4;0.1;0.4" dur="4s" begin={node.delay} repeatCount="indefinite" />
          </circle>
          <text x={node.x} y={node.y + 4} textAnchor="middle" fill={node.color} fontSize="10" fontFamily="sans-serif">
            {node.label}
          </text>
        </g>
      ))}

      <g>
        <rect x="160" y="122" width="100" height="78" rx="22" fill="rgba(2,6,23,0.92)" stroke="rgba(255,255,255,0.12)" />
        <text x="210" y="150" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700" fontFamily="sans-serif">
          PackageIQ
        </text>
        <text x="210" y="172" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
          Search. Compare. Decide.
        </text>
        <text x="210" y="191" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="sans-serif">
          bundle + maintenance + trust
        </text>
      </g>
    </svg>
  </div>
);

const HeroSection = ({ loading, searchTerm, setSearchTerm, onSubmit, onQuickSearch, onCompareShortcut }) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-10 shadow-[0_30px_120px_-40px_rgba(34,211,238,0.45)] backdrop-blur-xl sm:px-10 lg:px-12 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(244,114,182,0.14),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(2,6,23,0.82))]" />
      <div className="absolute -left-16 top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <Sparkles className="h-4 w-4" />
            Pick dependencies with more confidence
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:mx-0 lg:text-6xl">
            Search less,
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-300 bg-clip-text text-transparent">
              decide faster.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg lg:mx-0">
            PackageIQ combines npm activity, GitHub maintenance, alternatives, and bundle cost so you can choose packages with less guesswork.
          </p>

          <form id="search-form" onSubmit={onSubmit} className="mx-auto mt-8 max-w-3xl lg:mx-0">
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

          <div className="mx-auto mt-6 max-w-3xl lg:mx-0">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Starter searches</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
              {starterSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onQuickSearch?.(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-cyan-400/30 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-3xl lg:mx-0">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Compare common choices</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
              {compareShortcuts.map(([left, right]) => (
                <button
                  key={`${left}-${right}`}
                  type="button"
                  onClick={() => onCompareShortcut?.(left, right)}
                  className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-fuchsia-400/30 hover:text-white"
                >
                  {left} vs {right}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatedPackageScene />
      </div>
    </section>
  );
};

export default HeroSection;
