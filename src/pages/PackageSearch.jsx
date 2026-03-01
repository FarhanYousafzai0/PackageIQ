import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, GitCompare, History, X } from 'lucide-react';
import { fetchPackageIntelligence, generateVerdict } from '../services/api';
import PackageCard from '../components/packageiq/PackageCard';
import HealthScore from '../components/packageiq/HealthScore';
import DownloadChart from '../components/packageiq/DownloadChart';
import BundleSizeDisplay from '../components/packageiq/BundleSize';
import AIVerdict from '../components/packageiq/AIVerdict';

const PackageSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [comparePackage, setComparePackage] = useState('');

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
      
      const aiVerdict = generateVerdict(data);
      setVerdict(aiVerdict);
    } catch (err) {
      setError(err.message);
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

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('packageiq_history');
  };

  const loadFromHistory = (pkgName) => {
    setSearchTerm(pkgName);
    // Trigger search
    setTimeout(() => {
      document.getElementById('search-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            PackageIQ
          </h1>
          <p className="text-xl text-slate-400">
            NPM Package Intelligence Hub
          </p>
        </div>

        {/* Search Form */}
        <form id="search-form" onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search npm packages (e.g., react, lodash, axios...)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-lg"
            />
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && !packageData && (
          <div className="max-w-2xl mx-auto mb-8">
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
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {packageData && (
          <div className="space-y-6">
            {/* Package Card */}
            <PackageCard pkg={packageData} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <HealthScore score={packageData.healthScore} />
              <BundleSizeDisplay bundleSize={packageData.bundleSize} />
              <DownloadChart 
                data={packageData.downloadTrends} 
                packageName={packageData.name} 
              />
            </div>

            {/* AI Verdict */}
            <AIVerdict verdict={verdict} />

            {/* Compare Section */}
            <div className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
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
