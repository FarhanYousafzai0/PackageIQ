import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Loader2, Search, Sparkles, Package } from 'lucide-react';
import axios from 'axios';

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
  <div className="relative mx-auto hidden h-[350px] w-full max-w-[400px] items-center justify-center mb-8 lg:mb-12 lg:flex">
    <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-[80px]" />
    <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-[100px]" />
    
    <svg
      viewBox="0 0 400 400"
      className="relative h-full w-full drop-shadow-2xl"
      role="img"
      aria-label="Animated package intelligence illustration"
    >
      <defs>
        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform="translate(200 200)">
        <circle r="160" fill="none" stroke="url(#ringGradient)" strokeWidth="1" strokeDasharray="4 8">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="40s" repeatCount="indefinite" />
        </circle>
        <circle r="120" fill="none" stroke="url(#ringGradient)" strokeWidth="1.5" strokeDasharray="15 15">
          <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle r="80" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="1" strokeDasharray="2 4">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
        </circle>
      </g>

      <g>
        <path d="M100 120 Q150 160 170 180" fill="none" stroke="rgba(103,232,249,0.3)" strokeWidth="2" />
        <circle r="3" fill="#67e8f9" filter="url(#glow)">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M100 120 Q150 160 170 180" />
        </circle>
        
        <path d="M300 120 Q250 160 230 180" fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="2" />
        <circle r="3" fill="#a78bfa" filter="url(#glow)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M300 120 Q250 160 230 180" />
        </circle>
        
        <path d="M320 280 Q250 240 230 220" fill="none" stroke="rgba(249,168,212,0.3)" strokeWidth="2" />
        <circle r="3" fill="#f9a8d4" filter="url(#glow)">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M320 280 Q250 240 230 220" />
        </circle>
        
        <path d="M80 280 Q150 240 170 220" fill="none" stroke="rgba(134,239,172,0.3)" strokeWidth="2" />
        <circle r="3" fill="#86efac" filter="url(#glow)">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M80 280 Q150 240 170 220" />
        </circle>
      </g>

      {[
        { x: 100, y: 120, label: 'npm data', color: '#67e8f9', delay: '0s', glowColor: 'rgba(103,232,249,0.2)' },
        { x: 300, y: 120, label: 'GitHub', color: '#a78bfa', delay: '0.7s', glowColor: 'rgba(167,139,250,0.2)' },
        { x: 320, y: 280, label: 'Bundle Size', color: '#f9a8d4', delay: '1.4s', glowColor: 'rgba(249,168,212,0.2)' },
        { x: 80, y: 280, label: 'Health', color: '#86efac', delay: '2s', glowColor: 'rgba(134,239,172,0.2)' },
      ].map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="32" fill={node.glowColor}>
            <animate attributeName="r" values="28;40;28" dur="3s" begin={node.delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" begin={node.delay} repeatCount="indefinite" />
          </circle>
          <circle cx={node.x} cy={node.y} r="28" fill="#0f172a" stroke={node.color} strokeWidth="1.5" />
          <circle cx={node.x} cy={node.y} r="24" fill={node.color} fillOpacity="0.1" />
          <circle cx={node.x} cy={node.y - 8} r="2" fill={node.color} filter="url(#glow)" />
          <text x={node.x} y={node.y + 4} textAnchor="middle" fill={node.color} fontSize="11" fontWeight="600" fontFamily="sans-serif">
            {node.label}
          </text>
        </g>
      ))}

      <g transform="translate(200 200)">
        <circle r="60" fill="url(#centerGradient)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" filter="url(#glow)">
          <animate attributeName="r" values="58;62;58" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle r="45" fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="15s" repeatCount="indefinite" />
        </circle>
        <rect x="-40" y="-30" width="80" height="60" rx="12" fill="rgba(2,6,23,0.8)" stroke="rgba(103,232,249,0.3)" strokeWidth="1" />
        <text x="0" y="-4" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">
          PackageIQ
        </text>
        <text x="0" y="14" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif" fontWeight="500">
          INTELLIGENCE
        </text>
        <g>
          <circle cx="-15" cy="22" r="1.5" fill="#67e8f9">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="22" r="1.5" fill="#a78bfa">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="15" cy="22" r="1.5" fill="#f9a8d4">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="1s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    </svg>
  </div>
);

const useNpmSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query.trim())}&size=6`,
          { timeout: 5000 }
        );
        setSuggestions(
          (res.data.objects || []).map((obj) => ({
            name: obj.package.name,
            description: obj.package.description || '',
            version: obj.package.version,
          }))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return { suggestions, loading };
};

const HeroSection = ({ loading, searchTerm, setSearchTerm, onSubmit, onQuickSearch, onCompareShortcut, inputRef }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useNpmSuggestions(searchTerm);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    onQuickSearch?.(name);
  };

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
              <div className="relative flex-1" ref={wrapperRef}>
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search npm packages like react, vite, tanstack-query..."
                  autoFocus
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />

                {/* Keyboard hint */}
                <div className="pointer-events-none absolute inset-y-0 right-4 hidden items-center sm:flex">
                  {!searchTerm && (
                    <kbd className="rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">/</kbd>
                  )}
                </div>

                {showSuggestions && suggestions.length > 0 && searchTerm.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleSuggestionClick(s.name)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                      >
                        <Package className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-100">{s.name} <span className="text-slate-500 font-normal">v{s.version}</span></p>
                          <p className="truncate text-xs text-slate-400">{s.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
