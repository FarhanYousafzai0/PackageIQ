import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileJson,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpCircle,
  Loader2,
  Search,
  Package2,
  Heart,
  Github,
  ArrowUp,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import NavigationBar from '../components/packageiq/NavigationBar';
import { playChime } from '../utils/notificationChime';
import useCountUp from '../hooks/useCountUp';

const NPM_REGISTRY = 'https://registry.npmjs.org';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const daysSince = (dateStr) => {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
};

const fetchQuickInfo = async (name, currentVersion) => {
  try {
    let data;
    try {
      const res = await axios.get(`${NPM_REGISTRY}/${name}`, { timeout: 10000 });
      data = res.data;
    } catch {
      const proxy = `${CORS_PROXY}${encodeURIComponent(`${NPM_REGISTRY}/${name}`)}`;
      const res = await axios.get(proxy, { timeout: 10000 });
      data = res.data;
    }

    const latest = data['dist-tags']?.latest || 'unknown';
    const lastPublished = data.time?.[latest] || null;
    const days = daysSince(lastPublished);
    const deprecated = !!data.versions?.[latest]?.deprecated;
    const license = data.license || 'Unknown';
    const maintainers = data.maintainers?.length || 0;

    const cleanCurrent = (currentVersion || '').replace(/^[\^~>=<]*/g, '');
    const isOutdated = cleanCurrent && latest !== 'unknown' && cleanCurrent !== latest;

    const issues = [];
    if (deprecated) issues.push('deprecated');
    if (days > 365) issues.push('stale');
    if (isOutdated) issues.push('outdated');
    if (maintainers <= 1) issues.push('single-maintainer');

    let status = 'healthy';
    if (deprecated || days > 730) status = 'critical';
    else if (issues.length >= 2 || days > 365) status = 'warning';

    return {
      name,
      currentVersion: cleanCurrent,
      latestVersion: latest,
      lastPublished,
      daysSincePublish: days,
      deprecated,
      license,
      maintainers,
      isOutdated,
      status,
      issues,
      error: null,
    };
  } catch {
    return {
      name,
      currentVersion: (currentVersion || '').replace(/^[\^~>=<]*/g, ''),
      latestVersion: null,
      lastPublished: null,
      daysSincePublish: null,
      deprecated: false,
      license: null,
      maintainers: null,
      isOutdated: false,
      status: 'error',
      issues: ['lookup-failed'],
      error: 'Could not fetch package data',
    };
  }
};

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle, color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/10', label: 'Healthy' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'border-amber-500/20 bg-amber-500/10', label: 'Warning' },
  critical: { icon: XCircle, color: 'text-red-400', bg: 'border-red-500/20 bg-red-500/10', label: 'Critical' },
  error: { icon: XCircle, color: 'text-slate-500', bg: 'border-white/10 bg-white/5', label: 'Error' },
};

const SAMPLE = `{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.6.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0"
  }
}`;

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-slate-300 shadow-xl backdrop-blur-xl transition-all hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400/30"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

const AnimatedStatCard = ({ label, value, color }) => {
  const displayed = useCountUp(value, { duration: 700 });
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 text-center backdrop-blur-xl card-hover">
      <p className={`text-2xl font-bold ${color}`}>{displayed}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
};

const CompatibilityChecker = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const resultsRef = useRef(null);

  const handleAnalyze = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please paste your package.json content');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      toast.error('Invalid JSON — please paste valid package.json content');
      return;
    }

    const deps = parsed.dependencies || {};
    const devDeps = parsed.devDependencies || {};
    const allDeps = [
      ...Object.entries(deps).map(([name, version]) => ({ name, version, type: 'dependency' })),
      ...Object.entries(devDeps).map(([name, version]) => ({ name, version, type: 'devDependency' })),
    ];

    if (allDeps.length === 0) {
      toast.error('No dependencies found in the pasted JSON');
      return;
    }

    setLoading(true);
    setProgress({ done: 0, total: allDeps.length });
    setResults(null);

    const batchSize = 5;
    const allResults = [];

    for (let i = 0; i < allDeps.length; i += batchSize) {
      const batch = allDeps.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((dep) => fetchQuickInfo(dep.name, dep.version))
      );
      batchResults.forEach((r, idx) => {
        allResults.push({
          ...(r.status === 'fulfilled' ? r.value : { name: batch[idx].name, status: 'error', issues: ['lookup-failed'], error: 'Failed' }),
          type: batch[idx].type,
        });
      });
      setProgress({ done: Math.min(i + batchSize, allDeps.length), total: allDeps.length });
    }

    const sorted = allResults.sort((a, b) => {
      const priority = { critical: 0, warning: 1, error: 2, healthy: 3 };
      return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
    });

    setResults(sorted);
    setLoading(false);

    playChime();
    const criticalCount = sorted.filter((r) => r.status === 'critical').length;
    toast.success('Audit complete!', {
      description: criticalCount > 0
        ? `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} found — check below.`
        : 'All dependencies look good. Check the report below.',
      duration: 3500,
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLoadSample = () => {
    setJsonInput(SAMPLE);
    toast.success('Sample package.json loaded');
  };

  const summary = results
    ? {
        total: results.length,
        healthy: results.filter((r) => r.status === 'healthy').length,
        warning: results.filter((r) => r.status === 'warning').length,
        critical: results.filter((r) => r.status === 'critical').length,
        outdated: results.filter((r) => r.isOutdated).length,
      }
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)] page-enter">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[10%] top-40 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <NavigationBar />

      <div className="container relative mx-auto max-w-5xl px-4 pb-12 pt-10">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            <FileJson className="h-4 w-4" />
            Compatibility Checker
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Audit your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">package.json</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Paste your package.json to instantly check every dependency for outdated versions,
            stale maintenance, security risks, and more.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Paste your package.json
            </label>
            <button
              onClick={handleLoadSample}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Load sample
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{ "dependencies": { "react": "^18.2.0" } }'
            rows={10}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-y"
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !jsonInput.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing ({progress.done}/{progress.total})
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze Dependencies
                </>
              )}
            </button>

            {loading && (
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {summary && (
          <div ref={resultsRef} className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <AnimatedStatCard label="Total Packages" value={summary.total} color="text-slate-100" />
              <AnimatedStatCard label="Healthy" value={summary.healthy} color="text-emerald-400" />
              <AnimatedStatCard label="Warnings" value={summary.warning} color="text-amber-400" />
              <AnimatedStatCard label="Critical" value={summary.critical} color="text-red-400" />
            </div>

            {summary.outdated > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3">
                <ArrowUpCircle className="h-5 w-5 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-200">
                  <span className="font-semibold">{summary.outdated}</span> package{summary.outdated > 1 ? 's' : ''} can be updated to newer versions.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {results.map((pkg) => {
                const cfg = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.error;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={`${pkg.name}-${pkg.type}`}
                    className={`rounded-2xl border p-4 transition-colors card-hover ${cfg.bg}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusIcon className={`h-5 w-5 shrink-0 ${cfg.color}`} />
                        <div className="min-w-0">
                          <button
                            onClick={() => navigate(`/?pkg=${pkg.name}`)}
                            className="text-sm font-semibold text-slate-100 hover:text-cyan-300 transition-colors truncate block"
                          >
                            {pkg.name}
                          </button>
                          <span className="text-xs text-slate-500">{pkg.type}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {pkg.currentVersion && (
                          <span className="text-slate-400">
                            v{pkg.currentVersion}
                            {pkg.isOutdated && pkg.latestVersion && (
                              <span className="ml-1 text-amber-400">→ v{pkg.latestVersion}</span>
                            )}
                          </span>
                        )}
                        {pkg.daysSincePublish != null && pkg.daysSincePublish !== Infinity && (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Clock className="h-3 w-3" />
                            {pkg.daysSincePublish}d ago
                          </span>
                        )}
                        {pkg.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.issues.map((issue) => (
                              <span
                                key={issue}
                                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                <Package2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-300">PackageIQ</p>
                <p className="text-xs text-slate-500">NPM intelligence cockpit</p>
              </div>
            </div>
            <a
              href="https://github.com/FarhanYousafzai0/PackageIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
          <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/5 pt-6 text-center">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              Built with <Heart className="h-3 w-3 text-pink-400" /> using React, Vite & Tailwind
            </p>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
};

export default CompatibilityChecker;
