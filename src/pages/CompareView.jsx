import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, GitCompare, Scale, Trophy, Sparkles, Package2 } from 'lucide-react';
import { fetchPackageIntelligence, generateVerdict } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';
import useCountUp from '../hooks/useCountUp';
import HealthScore from '../components/packageiq/HealthScore';
import BundleSizeDisplay from '../components/packageiq/BundleSize';
import AIVerdict from '../components/packageiq/AIVerdict';
import NavigationBar from '../components/packageiq/NavigationBar';
import CompareDecisionSummary from '../components/packageiq/CompareDecisionSummary';
import TrustSignals from '../components/packageiq/TrustSignals';
import CompareLauncher from '../components/packageiq/CompareLauncher';
import AlternativesPanel from '../components/packageiq/AlternativesPanel';
import { trackCompareView } from '../services/analytics';

const DownloadChart = lazy(() => import('../components/packageiq/DownloadChart'));

const RevealSection = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''} ${delay ? `reveal-delay-${delay}` : ''} ${className}`}>
      {children}
    </div>
  );
};

const StatRow = ({ label, val1, val2, format, higherIsBetter = true }) => {
  const fmt = format || ((v) => v?.toString() || 'N/A');
  const v1 = val1 ?? 0;
  const v2 = val2 ?? 0;
  const winner = v1 === v2 ? null : higherIsBetter ? (v1 > v2 ? 1 : 2) : (v1 < v2 ? 1 : 2);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 card-hover">
      <p className={`text-right text-lg font-semibold ${winner === 1 ? 'text-emerald-400' : winner === 2 ? 'text-red-400' : 'text-slate-200'}`}>
        {fmt(val1)}
        {winner === 1 && <Trophy className="ml-1.5 inline h-3.5 w-3.5 text-emerald-400" />}
      </p>
      <p className="text-xs text-slate-500 font-medium text-center min-w-[80px]">{label}</p>
      <p className={`text-lg font-semibold ${winner === 2 ? 'text-emerald-400' : winner === 1 ? 'text-red-400' : 'text-slate-200'}`}>
        {winner === 2 && <Trophy className="mr-1.5 inline h-3.5 w-3.5 text-emerald-400" />}
        {fmt(val2)}
      </p>
    </div>
  );
};

const CompareView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pkg1Name = searchParams.get('pkg1');
  const pkg2Name = searchParams.get('pkg2');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pkg1, setPkg1] = useState(null);
  const [pkg2, setPkg2] = useState(null);
  const [verdict1, setVerdict1] = useState(null);
  const [verdict2, setVerdict2] = useState(null);
  const [packageOneInput, setPackageOneInput] = useState(pkg1Name || '');
  const [packageTwoInput, setPackageTwoInput] = useState(pkg2Name || '');

  useEffect(() => {
    setPackageOneInput(pkg1Name || '');
    setPackageTwoInput(pkg2Name || '');
  }, [pkg1Name, pkg2Name]);

  useEffect(() => { trackCompareView(); }, []);

  useEffect(() => {
    if (!pkg1Name || !pkg2Name) { setLoading(false); return; }

    const fetchBothPackages = async () => {
      setLoading(true);
      setError(null);
      setPkg1(null);
      setPkg2(null);
      setVerdict1(null);
      setVerdict2(null);

      try {
        const [data1, data2] = await Promise.all([
          fetchPackageIntelligence(pkg1Name),
          fetchPackageIntelligence(pkg2Name),
        ]);
        setPkg1(data1);
        setPkg2(data2);
        setVerdict1(data1.decision || generateVerdict(data1));
        setVerdict2(data2.decision || generateVerdict(data2));
      } catch (err) {
        setError(err.message || 'Unable to load package data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBothPackages();
  }, [pkg1Name, pkg2Name]);

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
    return num?.toString() || '0';
  };

  const getWinner = () => {
    if (!pkg1 || !pkg2) return null;

    let score1 = 0;
    let score2 = 0;

    if (pkg1.downloads > pkg2.downloads) score1++; else if (pkg2.downloads > pkg1.downloads) score2++;
    if (pkg1.healthScore > pkg2.healthScore) score1++; else if (pkg2.healthScore > pkg1.healthScore) score2++;
    if ((pkg1.github?.stars || 0) > (pkg2.github?.stars || 0)) score1++; else if ((pkg2.github?.stars || 0) > (pkg1.github?.stars || 0)) score2++;
    if ((pkg1.bundleSize?.gzip || Infinity) < (pkg2.bundleSize?.gzip || Infinity)) score1++; else if ((pkg2.bundleSize?.gzip || Infinity) < (pkg1.bundleSize?.gzip || Infinity)) score2++;
    if ((pkg1.github?.openIssues || 0) < (pkg2.github?.openIssues || 0)) score1++; else if ((pkg2.github?.openIssues || 0) < (pkg1.github?.openIssues || 0)) score2++;

    if (score1 > score2) return { winner: pkg1.name, score: `${score1}-${score2}` };
    if (score2 > score1) return { winner: pkg2.name, score: `${score2}-${score1}` };
    return { winner: 'Tie', score: `${score1}-${score2}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)] page-enter">
        <NavigationBar />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <CompareLauncher packageOne={packageOneInput} packageTwo={packageTwoInput} setPackageOne={setPackageOneInput} setPackageTwo={setPackageTwoInput} onSubmit={handleCompareSubmit} loading title="Compare packages side by side" />
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
      <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)] page-enter">
        <NavigationBar />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <CompareLauncher packageOne={packageOneInput} packageTwo={packageTwoInput} setPackageOne={setPackageOneInput} setPackageTwo={setPackageTwoInput} onSubmit={handleCompareSubmit} title="Compare packages side by side" />
          <div className="flex items-center justify-center px-4 py-24">
            <div className="text-center max-w-md">
              <div className="p-4 rounded-[1.75rem] bg-red-500/10 border border-red-500/30 text-red-400 mb-4">{error}</div>
              <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors flex items-center gap-2 mx-auto">
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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_36%,_#020617_100%)] page-enter">
      <NavigationBar />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <CompareLauncher packageOne={packageOneInput} packageTwo={packageTwoInput} setPackageOne={setPackageOneInput} setPackageTwo={setPackageTwoInput} onSubmit={handleCompareSubmit} title="Package comparison" />

        {!pkg1Name || !pkg2Name ? (
          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              <Scale className="h-10 w-10 text-cyan-300" />
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Start here</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Compare before you install</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Enter two package names above and PackageIQ will compare maintenance, bundle size, community support, and likely tradeoffs.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
              {[['react', 'preact'], ['express', 'fastify'], ['moment', 'dayjs']].map(([a, b]) => (
                <button
                  key={`${a}-${b}`}
                  onClick={() => navigate(`/compare?pkg1=${a}&pkg2=${b}`)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
                >
                  {a} vs {b}
                </button>
              ))}
            </div>
          </div>
        ) : winner && (
          <RevealSection>
            <div className="mb-8 mt-8 rounded-[1.75rem] border border-indigo-500/30 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
                  <Trophy className="h-7 w-7 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-1">Winner</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {winner.winner === 'Tie' ? "It's a Tie!" : winner.winner}
                  </p>
                  <p className="text-slate-400 text-sm">Score: {winner.score}</p>
                </div>
              </div>
            </div>
          </RevealSection>
        )}

        {pkg1 && pkg2 && (
          <>
            <RevealSection>
              <div className="mb-8">
                <CompareDecisionSummary pkg1={pkg1} pkg2={pkg2} verdict1={verdict1} verdict2={verdict2} />
              </div>
            </RevealSection>

            <RevealSection>
              <div className="mb-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
                <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <p className="text-right text-xl font-bold text-indigo-400">{pkg1.name}</p>
                  <Sparkles className="h-5 w-5 text-slate-500" />
                  <p className="text-xl font-bold text-pink-400">{pkg2.name}</p>
                </div>
                <div className="space-y-3">
                  <StatRow label="Downloads/wk" val1={pkg1.downloads} val2={pkg2.downloads} format={formatNumber} />
                  <StatRow label="Health Score" val1={pkg1.healthScore} val2={pkg2.healthScore} />
                  <StatRow label="GitHub Stars" val1={pkg1.github?.stars} val2={pkg2.github?.stars} format={formatNumber} />
                  <StatRow label="Bundle (gzip)" val1={pkg1.bundleSize?.gzip} val2={pkg2.bundleSize?.gzip} format={formatBytes} higherIsBetter={false} />
                  <StatRow label="Open Issues" val1={pkg1.github?.openIssues} val2={pkg2.github?.openIssues} format={formatNumber} higherIsBetter={false} />
                  <StatRow label="Forks" val1={pkg1.github?.forks} val2={pkg2.github?.forks} format={formatNumber} />
                </div>
              </div>
            </RevealSection>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pkg1 && (
            <div className="space-y-6">
              <RevealSection>
                <div className="rounded-[1.75rem] border-l-4 border-l-indigo-400 border border-indigo-500/20 bg-indigo-500/5 p-6 backdrop-blur-xl card-hover">
                  <h2 className="text-3xl font-bold text-indigo-400 mb-2">{pkg1.name}</h2>
                  <p className="text-slate-400">v{pkg1.version}</p>
                  <p className="text-slate-300 mt-3">{pkg1.description}</p>
                </div>
              </RevealSection>

              <RevealSection>
                <TrustSignals maintenance={pkg1.maintenance} trustSignals={pkg1.trustSignals} />
              </RevealSection>
              <RevealSection><HealthScore score={pkg1.healthScore} /></RevealSection>
              <RevealSection><BundleSizeDisplay bundleSize={pkg1.bundleSize} /></RevealSection>
              <RevealSection>
                <Suspense fallback={<div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 text-slate-400">Loading chart...</div>}>
                  <DownloadChart data={pkg1.downloadTrends} packageName={pkg1.name} />
                </Suspense>
              </RevealSection>
              <RevealSection><AIVerdict verdict={verdict1} /></RevealSection>
              <RevealSection><AlternativesPanel packageName={pkg1.name} alternatives={pkg1.alternatives} onCompare={handleAlternativeCompare} /></RevealSection>
            </div>
          )}

          {pkg2 && (
            <div className="space-y-6">
              <RevealSection>
                <div className="rounded-[1.75rem] border-l-4 border-l-pink-400 border border-pink-500/20 bg-pink-500/5 p-6 backdrop-blur-xl card-hover">
                  <h2 className="text-3xl font-bold text-pink-400 mb-2">{pkg2.name}</h2>
                  <p className="text-slate-400">v{pkg2.version}</p>
                  <p className="text-slate-300 mt-3">{pkg2.description}</p>
                </div>
              </RevealSection>

              <RevealSection>
                <TrustSignals maintenance={pkg2.maintenance} trustSignals={pkg2.trustSignals} />
              </RevealSection>
              <RevealSection><HealthScore score={pkg2.healthScore} /></RevealSection>
              <RevealSection><BundleSizeDisplay bundleSize={pkg2.bundleSize} /></RevealSection>
              <RevealSection>
                <Suspense fallback={<div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 text-slate-400">Loading chart...</div>}>
                  <DownloadChart data={pkg2.downloadTrends} packageName={pkg2.name} />
                </Suspense>
              </RevealSection>
              <RevealSection><AIVerdict verdict={verdict2} /></RevealSection>
              <RevealSection><AlternativesPanel packageName={pkg2.name} alternatives={pkg2.alternatives} onCompare={handleAlternativeCompare} /></RevealSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatBytes = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default CompareView;
