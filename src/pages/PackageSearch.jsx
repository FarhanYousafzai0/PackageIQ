import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, History, X } from 'lucide-react';
import { fetchPackageIntelligence, generateVerdict } from '../services/api';
import PackageCard from '../components/packageiq/PackageCard';
import HealthScore from '../components/packageiq/HealthScore';
import BundleSizeDisplay from '../components/packageiq/BundleSize';
import AIVerdict from '../components/packageiq/AIVerdict';
import NavigationBar from '../components/packageiq/NavigationBar';
import HeroSection from '../components/packageiq/HeroSection';
import PackageNotFoundState from '../components/packageiq/PackageNotFoundState';
import TrustSignals from '../components/packageiq/TrustSignals';
import AlternativesPanel from '../components/packageiq/AlternativesPanel';
import UsageStatsBar from '../components/packageiq/UsageStatsBar';
import WhatYouGetSection from '../components/packageiq/WhatYouGetSection';
import { fetchUsageStats, trackPackageSearch, trackSiteView } from '../services/analytics';

const DownloadChart = lazy(() => import('../components/packageiq/DownloadChart'));

const PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND';

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

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('packageiq_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse search history');
      }
    }
  }, []);

  useEffect(() => {
    const loadUsage = async () => {
      const [stats] = await Promise.all([
        fetchUsageStats(),
        trackSiteView(),
      ]);
      setUsageStats(stats);
    };

    loadUsage();
  }, []);

  // Save search history
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

  const loadFromHistory = (pkgName) => {
    runSearch(pkgName);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)]">
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
        />
        <UsageStatsBar stats={usageStats} />
      </div>

      <WhatYouGetSection />

      <div className="container relative mx-auto max-w-6xl px-4 pb-12 pt-8">
        {/* Search History */}
        {searchHistory.length > 0 && !packageData && !error && (
          <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Searches
              </h3>
              <button
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((pkg, index) => (
                <button
                  key={index}
                  onClick={() => loadFromHistory(pkg)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error?.code === PACKAGE_NOT_FOUND && (
          <div className="mx-auto mt-8 max-w-4xl">
            <PackageNotFoundState packageName={error.packageName || searchTerm.trim().toLowerCase()} />
          </div>
        )}

        {error && error.code !== PACKAGE_NOT_FOUND && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error.message}
          </div>
        )}

        {/* Results */}
        {packageData && (
          <div className="mt-10 space-y-6">
            <AIVerdict verdict={verdict} />

            {/* Package Card */}
            <PackageCard pkg={packageData} />

            <TrustSignals maintenance={packageData.maintenance} trustSignals={packageData.trustSignals} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <HealthScore score={packageData.healthScore} />
              <BundleSizeDisplay bundleSize={packageData.bundleSize} />
              <Suspense fallback={<div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 text-slate-400">Loading trend chart...</div>}>
                <DownloadChart 
                  data={packageData.downloadTrends} 
                  packageName={packageData.name} 
                />
              </Suspense>
            </div>

            <AlternativesPanel
              packageName={packageData.name}
              alternatives={packageData.alternatives}
              onCompare={handleCompareShortcut}
            />

            {/* Compare Section */}
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
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
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageSearch;
