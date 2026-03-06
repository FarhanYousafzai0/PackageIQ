import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, History, X, Share2, ArrowUp, Github, Package2, Heart, CheckCircle, Activity, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPackageIntelligence, generateVerdict } from '../services/api';
import { playChime } from '../utils/notificationChime';
import useScrollReveal from '../hooks/useScrollReveal';
import PackageCard from '../components/packageiq/PackageCard';
import HealthScore from '../components/packageiq/HealthScore';
import BundleSizeDisplay from '../components/packageiq/BundleSize';
import AIVerdict from '../components/packageiq/AIVerdict';
import NavigationBar from '../components/packageiq/NavigationBar';
import PackageNotFoundState from '../components/packageiq/PackageNotFoundState';
import TrustSignals from '../components/packageiq/TrustSignals';
import AlternativesPanel from '../components/packageiq/AlternativesPanel';
import HeroSection from '../components/packageiq/HeroSection';
import SupplyChainRisk from '../components/packageiq/SupplyChainRisk';
import FrameworkCompat from '../components/packageiq/FrameworkCompat';
import DeveloperExperience from '../components/packageiq/DeveloperExperience';
import CommunityPulse from '../components/packageiq/CommunityPulse';
import SustainabilityForecast from '../components/packageiq/SustainabilityForecast';

import { fetchUsageStats, trackPackageSearch, trackSiteView } from '../services/analytics';

const DownloadChart = lazy(() => import('../components/packageiq/DownloadChart'));

const PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND';

const RevealSection = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'visible' : ''} ${delay ? `reveal-delay-${delay}` : ''} ${className}`}
    >
      {children}
    </div>
  );
};

const ResultsSkeleton = () => (
  <div className="mt-10 space-y-6 page-enter">
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full skeleton" />
          <div>
            <div className="h-5 w-40 rounded skeleton" />
            <div className="mt-2 h-3 w-24 rounded skeleton" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full skeleton" />
          <div className="h-8 w-20 rounded-full skeleton" />
        </div>
      </div>
    </div>

    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 rounded skeleton" />
        <div className="h-5 w-48 rounded skeleton" />
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="flex gap-4">
          <div className="h-8 w-8 rounded-lg skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded skeleton" />
            <div className="h-4 w-full rounded skeleton" />
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-16 rounded-xl skeleton" />
        <div className="h-16 rounded-xl skeleton" />
      </div>
    </div>

    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 rounded skeleton" />
        <div className="h-5 w-32 rounded skeleton" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-3/4 rounded skeleton" />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="h-3 w-16 rounded skeleton mb-2" />
            <div className="h-6 w-12 rounded skeleton" />
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-5 rounded skeleton" />
            <div className="h-5 w-28 rounded skeleton" />
          </div>
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full skeleton" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SummaryBar = ({ packageData, verdict, onShare }) => {
  const getVerdictIcon = (overall) => {
    if (overall === 'recommended') return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    if (overall === 'not-recommended') return <AlertTriangle className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-amber-400" />;
  };

  const getVerdictColor = (overall) => {
    if (overall === 'recommended') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    if (overall === 'not-recommended') return 'border-red-500/20 bg-red-500/10 text-red-300';
    return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  };

  const formatNum = (n) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n?.toString() || '0';
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl page-enter">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <Package2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-100">{packageData.name} <span className="font-normal text-slate-500">v{packageData.version}</span></p>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
              <span>Health: <span className="font-semibold text-slate-200">{packageData.healthScore}</span></span>
              <span className="text-slate-600">|</span>
              <span>{formatNum(packageData.downloads)} downloads/wk</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {verdict && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getVerdictColor(verdict.overall)}`}>
              {getVerdictIcon(verdict.overall)}
              {verdict.recommendation?.split('.')[0]}
            </span>
          )}
          <button
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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

const Footer = () => (
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

        <div className="flex items-center gap-4">
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
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/5 pt-6 text-center">
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          Built with <Heart className="h-3 w-3 text-pink-400" /> using React, Vite & Tailwind
        </p>
        <p className="text-xs text-slate-600">
          Data from npm registry, GitHub API & Bundlephobia
        </p>
      </div>
    </div>
  </footer>
);

const PackageSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [comparePackage, setComparePackage] = useState('');
  const [usageStats, setUsageStats] = useState(null);

  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('packageiq_history');
    if (saved) {
      try { setSearchHistory(JSON.parse(saved)); } catch { /* skip */ }
    }
  }, []);

  useEffect(() => {
    const loadUsage = async () => {
      const [stats] = await Promise.all([fetchUsageStats(), trackSiteView()]);
      setUsageStats(stats);
    };
    loadUsage();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveToHistory = (pkgName) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((p) => p !== pkgName);
      const updated = [pkgName, ...filtered].slice(0, 10);
      localStorage.setItem('packageiq_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setPackageData(null);
    setVerdict(null);

    try {
      const data = await fetchPackageIntelligence(searchTerm);
      setPackageData(data);
      saveToHistory(data.name);
      setVerdict(data.decision || generateVerdict(data));
      const totalSearches = await trackPackageSearch();
      setUsageStats((prev) => prev ? { ...prev, packageSearches: totalSearches } : prev);

      playChime();
      toast.success(`Analysis ready for ${data.name}`, {
        description: 'Scroll down to explore the full report.',
        duration: 3000,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError({
        code: err?.code || 'PACKAGE_LOOKUP_FAILED',
        message: err?.message || 'Unable to load package data.',
        packageName: err?.packageName || searchTerm.trim().toLowerCase(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    if (packageData && comparePackage.trim()) {
      navigate(`/compare?pkg1=${packageData.name}&pkg2=${comparePackage.trim()}`);
    }
  };

  const runSearch = (pkgName) => {
    setSearchTerm(pkgName);
    setTimeout(() => {
      document.getElementById('search-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  const handleCompareShortcut = (pkg1, pkg2) => {
    navigate(`/compare?pkg1=${pkg1}&pkg2=${pkg2}`);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('packageiq_history');
  };

  const loadFromHistory = (pkgName) => runSearch(pkgName);

  const handleShare = useCallback(async () => {
    if (!packageData) return;
    const url = `${window.location.origin}/?pkg=${packageData.name}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!', {
        description: `Share this PackageIQ report for ${packageData.name}`,
      });
    } catch {
      toast.error('Failed to copy link');
    }
  }, [packageData]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)] page-enter">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[10%] top-40 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <NavigationBar />

      <div className="container relative mx-auto max-w-6xl px-4 pb-12 pt-6">
        <HeroSection
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSubmit={handleSearch}
          onQuickSearch={runSearch}
          onCompareShortcut={handleCompareShortcut}
          inputRef={searchInputRef}
        />
      </div>

      <div ref={resultsRef} className="container relative mx-auto max-w-6xl px-4 pb-12 pt-8">
        {searchHistory.length > 0 && !packageData && !error && !loading && (
          <RevealSection>
            <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Searches
                </h3>
                <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((pkg, index) => (
                  <button
                    key={index}
                    onClick={() => loadFromHistory(pkg)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 hover:border-cyan-400/20 transition-colors"
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>
          </RevealSection>
        )}

        {error?.code === PACKAGE_NOT_FOUND && (
          <div className="mx-auto mt-8 max-w-4xl page-enter">
            <PackageNotFoundState packageName={error.packageName || searchTerm.trim().toLowerCase()} />
          </div>
        )}

        {error && error.code !== PACKAGE_NOT_FOUND && (
          <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-red-500/30 bg-red-500/10 p-4 text-red-400 page-enter">
            {error.message}
          </div>
        )}

        {loading && <ResultsSkeleton />}

        {packageData && (
          <div className="mt-10 space-y-6">
            <SummaryBar packageData={packageData} verdict={verdict} onShare={handleShare} />

            <RevealSection>
              <AIVerdict verdict={verdict} />
            </RevealSection>

            <RevealSection>
              <PackageCard pkg={packageData} />
            </RevealSection>

            <RevealSection>
              <TrustSignals maintenance={packageData.maintenance} trustSignals={packageData.trustSignals} />
            </RevealSection>

            <RevealSection>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <HealthScore score={packageData.healthScore} />
                <BundleSizeDisplay bundleSize={packageData.bundleSize} />
                <Suspense fallback={<div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 text-slate-400">Loading trend chart...</div>}>
                  <DownloadChart data={packageData.downloadTrends} packageName={packageData.name} />
                </Suspense>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SupplyChainRisk supplyChain={packageData.supplyChain} />
                <FrameworkCompat compat={packageData.compat} />
              </div>
            </RevealSection>

            <RevealSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeveloperExperience devExperience={packageData.devExperience} />
                <CommunityPulse communityPulse={packageData.communityPulse} />
              </div>
            </RevealSection>

            <RevealSection>
              <SustainabilityForecast sustainability={packageData.sustainability} />
            </RevealSection>

            <RevealSection>
              <AlternativesPanel
                packageName={packageData.name}
                alternatives={packageData.alternatives}
                onCompare={handleCompareShortcut}
              />
            </RevealSection>

            <RevealSection>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <GitCompare className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-slate-200">Compare with another package</h3>
                </div>
                <form onSubmit={handleCompare} className="flex gap-3">
                  <input
                    type="text"
                    value={comparePackage}
                    onChange={(e) => setComparePackage(e.target.value)}
                    placeholder="Enter package name to compare..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!comparePackage.trim()}
                    className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <GitCompare className="w-4 h-4" />
                    Compare
                  </button>
                </form>
              </div>
            </RevealSection>
          </div>
        )}
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default PackageSearch;
