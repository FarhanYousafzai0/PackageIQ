import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, GitCompare, Scale } from 'lucide-react';
import { fetchPackageIntelligence, generateVerdict } from '../services/api';
import HealthScore from '../components/packageiq/HealthScore';
import BundleSizeDisplay from '../components/packageiq/BundleSize';
import AIVerdict from '../components/packageiq/AIVerdict';
import NavigationBar from '../components/packageiq/NavigationBar';
import PackageNotFoundState from '../components/packageiq/PackageNotFoundState';
import CompareDecisionSummary from '../components/packageiq/CompareDecisionSummary';
import TrustSignals from '../components/packageiq/TrustSignals';
import CompareLauncher from '../components/packageiq/CompareLauncher';
import AlternativesPanel from '../components/packageiq/AlternativesPanel';
import { trackCompareView } from '../services/analytics';

const DownloadChart = lazy(() => import('../components/packageiq/DownloadChart'));

const PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND';

const normalizeAppError = (err, fallbackPackageName) => ({
  code: err?.code || 'PACKAGE_LOOKUP_FAILED',
  message: err?.message || 'Unable to load package data.',
  packageName: err?.packageName || fallbackPackageName,
});

const CompareView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pkg1, setPkg1] = useState(null);
  const [pkg2, setPkg2] = useState(null);
  const [verdict1, setVerdict1] = useState(null);
  const [verdict2, setVerdict2] = useState(null);
  const [pkg1Error, setPkg1Error] = useState(null);
  const [pkg2Error, setPkg2Error] = useState(null);
  const [packageOneInput, setPackageOneInput] = useState(pkg1Name || '');
  const [packageTwoInput, setPackageTwoInput] = useState(pkg2Name || '');

  const pkg1Name = searchParams.get('pkg1');
  const pkg2Name = searchParams.get('pkg2');

  useEffect(() => {
    setPackageOneInput(pkg1Name || '');
    setPackageTwoInput(pkg2Name || '');
  }, [pkg1Name, pkg2Name]);

  useEffect(() => {
    trackCompareView();
  }, []);

  useEffect(() => {
    if (!pkg1Name || !pkg2Name) {
      setLoading(false);
      return;
    }

    const fetchBothPackages = async () => {
      setLoading(true);
      setError(null);
      setPkg1(null);
      setPkg2(null);
      setVerdict1(null);
      setVerdict2(null);
      setPkg1Error(null);
      setPkg2Error(null);

      try {
        const [result1, result2] = await Promise.allSettled([
          fetchPackageIntelligence(pkg1Name),
          fetchPackageIntelligence(pkg2Name),
        ]);

        if (result1.status === 'fulfilled') {
          setPkg1(result1.value);
          setVerdict1(result1.value.decision || generateVerdict(result1.value));
        } else {
          const appError = normalizeAppError(result1.reason, pkg1Name);
          if (appError.code === PACKAGE_NOT_FOUND) {
            setPkg1Error(appError);
          } else {
            throw appError;
          }
        }

        if (result2.status === 'fulfilled') {
          setPkg2(result2.value);
          setVerdict2(result2.value.decision || generateVerdict(result2.value));
        } else {
          const appError = normalizeAppError(result2.reason, pkg2Name);
          if (appError.code === PACKAGE_NOT_FOUND) {
            setPkg2Error(appError);
          } else {
            throw appError;
          }
        }
      } catch (err) {
        setError(normalizeAppError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBothPackages();
  }, [pkg1Name, pkg2Name, navigate]);

  const handleCompareSubmit = (e) => {
    e.preventDefault();
    if (!packageOneInput.trim() || !packageTwoInput.trim()) return;
    navigate(`/compare?pkg1=${packageOneInput.trim()}&pkg2=${packageTwoInput.trim()}`);
  };

  const handleAlternativeCompare = (basePackage, alternativePackage) => {
    navigate(`/compare?pkg1=${basePackage}&pkg2=${alternativePackage}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getComparisonColor = (val1, val2, higherIsBetter = true) => {
    if (val2 === null || val2 === undefined) return 'text-slate-200';
    if (val1 === val2) return 'text-slate-400';
    const isBetter = higherIsBetter ? val1 > val2 : val1 < val2;
    return isBetter ? 'text-emerald-400' : 'text-red-400';
  };

  const getWinner = () => {
    if (!pkg1 || !pkg2) return null;
    
    let score1 = 0;
    let score2 = 0;

    // Downloads
    if (pkg1.downloads > pkg2.downloads) score1++;
    else if (pkg2.downloads > pkg1.downloads) score2++;

    // Health score
    if (pkg1.healthScore > pkg2.healthScore) score1++;
    else if (pkg2.healthScore > pkg1.healthScore) score2++;

    // GitHub stars
    if (pkg1.github?.stars > pkg2.github?.stars) score1++;
    else if (pkg2.github?.stars > pkg1.github?.stars) score2++;

    // Bundle size (smaller is better)
    if (pkg1.bundleSize?.gzip < pkg2.bundleSize?.gzip) score1++;
    else if (pkg2.bundleSize?.gzip < pkg1.bundleSize?.gzip) score2++;

    // Open issues (fewer is better)
    if (pkg1.github?.openIssues < pkg2.github?.openIssues) score1++;
    else if (pkg2.github?.openIssues < pkg1.github?.openIssues) score2++;

    if (score1 > score2) return { winner: pkg1.name, score: `${score1}-${score2}` };
    if (score2 > score1) return { winner: pkg2.name, score: `${score2}-${score1}` };
    return { winner: 'Tie', score: `${score1}-${score2}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)]">
        <NavigationBar />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <CompareLauncher
            packageOne={packageOneInput}
            packageTwo={packageTwoInput}
            setPackageOne={setPackageOneInput}
            setPackageTwo={setPackageTwoInput}
            onSubmit={handleCompareSubmit}
            loading
            title="Compare packages side by side"
          />
          <div className="flex items-center justify-center px-4 py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading package data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)]">
        <NavigationBar />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <CompareLauncher
            packageOne={packageOneInput}
            packageTwo={packageTwoInput}
            setPackageOne={setPackageOneInput}
            setPackageTwo={setPackageTwoInput}
            onSubmit={handleCompareSubmit}
            title="Compare packages side by side"
          />
          <div className="flex items-center justify-center px-4 py-24">
            <div className="text-center max-w-md">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
                {error.message}
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const winner = getWinner();
  const showCompareEmptyState = !pkg1 && !pkg2 && pkg1Error?.code === PACKAGE_NOT_FOUND && pkg2Error?.code === PACKAGE_NOT_FOUND;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)]">
      <NavigationBar />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <CompareLauncher
          packageOne={packageOneInput}
          packageTwo={packageTwoInput}
          setPackageOne={setPackageOneInput}
          setPackageTwo={setPackageTwoInput}
          onSubmit={handleCompareSubmit}
          title="Package comparison"
        />

        {/* Winner Banner */}
        {!pkg1Name || !pkg2Name ? (
          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-8 text-center backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Start here</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Compare before you install</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Enter two package names above and PackageIQ will compare maintenance, bundle size, community support, and likely tradeoffs.
            </p>
          </div>
        ) : winner && (
          <div className="mb-8 mt-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4">
              <Scale className="w-8 h-8 text-indigo-400" />
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Winner</p>
                <p className="text-2xl font-bold text-slate-100">
                  {winner.winner === 'Tie' ? "It's a Tie!" : winner.winner}
                </p>
                <p className="text-slate-400 text-sm">Score: {winner.score}</p>
              </div>
            </div>
          </div>
        )}

        {showCompareEmptyState ? (
          <PackageNotFoundState
            packageName={`${pkg1Error.packageName} and ${pkg2Error.packageName}`}
            context="compare"
          />
        ) : (
        <>
        {pkg1 && pkg2 && (
          <div className="mb-8">
            <CompareDecisionSummary pkg1={pkg1} pkg2={pkg2} verdict1={verdict1} verdict2={verdict2} />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Package 1 */}
          {pkg1 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-indigo-400 mb-2">{pkg1.name}</h2>
                <p className="text-slate-400">v{pkg1.version}</p>
                <p className="text-slate-300 mt-3">{pkg1.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Downloads</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg1.downloads, pkg2?.downloads)}`}>
                    {formatNumber(pkg1.downloads)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Health Score</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg1.healthScore, pkg2?.healthScore)}`}>
                    {pkg1.healthScore}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">GitHub Stars</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg1.github?.stars || 0, pkg2.github?.stars || 0)}`}>
                    {formatNumber(pkg1.github?.stars || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Bundle (gzip)</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg1.bundleSize?.gzip || 0, pkg2.bundleSize?.gzip || 0, false)}`}>
                    {pkg1.bundleSize ? formatBytes(pkg1.bundleSize.gzip) : 'N/A'}
                  </p>
                </div>
              </div>

              <TrustSignals maintenance={pkg1.maintenance} trustSignals={pkg1.trustSignals} />
              <HealthScore score={pkg1.healthScore} />
              <BundleSizeDisplay bundleSize={pkg1.bundleSize} />
              <Suspense fallback={<div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 text-slate-400">Loading trend chart...</div>}>
                <DownloadChart data={pkg1.downloadTrends} packageName={pkg1.name} />
              </Suspense>
              <AIVerdict verdict={verdict1} />
              <AlternativesPanel
                packageName={pkg1.name}
                alternatives={pkg1.alternatives}
                onCompare={handleAlternativeCompare}
              />
            </div>
          )}

          {pkg1Error?.code === PACKAGE_NOT_FOUND && (
            <PackageNotFoundState packageName={pkg1Error.packageName} context="compare" />
          )}

          {/* Package 2 */}
          {pkg2 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-pink-500/30 bg-pink-500/5 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-pink-400 mb-2">{pkg2.name}</h2>
                <p className="text-slate-400">v{pkg2.version}</p>
                <p className="text-slate-300 mt-3">{pkg2.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Downloads</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg2.downloads, pkg1?.downloads)}`}>
                    {formatNumber(pkg2.downloads)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Health Score</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg2.healthScore, pkg1?.healthScore)}`}>
                    {pkg2.healthScore}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">GitHub Stars</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg2.github?.stars || 0, pkg1.github?.stars || 0)}`}>
                    {formatNumber(pkg2.github?.stars || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Bundle (gzip)</p>
                  <p className={`text-xl font-semibold ${getComparisonColor(pkg2.bundleSize?.gzip || 0, pkg1.bundleSize?.gzip || 0, false)}`}>
                    {pkg2.bundleSize ? formatBytes(pkg2.bundleSize.gzip) : 'N/A'}
                  </p>
                </div>
              </div>

              <TrustSignals maintenance={pkg2.maintenance} trustSignals={pkg2.trustSignals} />
              <HealthScore score={pkg2.healthScore} />
              <BundleSizeDisplay bundleSize={pkg2.bundleSize} />
              <Suspense fallback={<div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 text-slate-400">Loading trend chart...</div>}>
                <DownloadChart data={pkg2.downloadTrends} packageName={pkg2.name} />
              </Suspense>
              <AIVerdict verdict={verdict2} />
              <AlternativesPanel
                packageName={pkg2.name}
                alternatives={pkg2.alternatives}
                onCompare={handleAlternativeCompare}
              />
            </div>
          )}

          {pkg2Error?.code === PACKAGE_NOT_FOUND && (
            <PackageNotFoundState packageName={pkg2Error.packageName} context="compare" />
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

// Helper function
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default CompareView;
