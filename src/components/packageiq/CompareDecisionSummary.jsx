import React from 'react';
import { Crown, Gauge, ShieldCheck, Users } from 'lucide-react';

const compareMetric = (pkg1, pkg2, getter, lowerIsBetter = false) => {
  const left = getter(pkg1);
  const right = getter(pkg2);
  if (left == null || right == null) return 'Tie';
  if (left === right) return 'Tie';
  const leftWins = lowerIsBetter ? left < right : left > right;
  return leftWins ? pkg1.name : pkg2.name;
};

const CompareDecisionSummary = ({ pkg1, pkg2, verdict1, verdict2 }) => {
  if (!pkg1 || !pkg2 || !verdict1 || !verdict2) return null;

  const cards = [
    {
      key: 'overall',
      icon: Crown,
      title: 'Best overall',
      winner: compareMetric(pkg1, pkg2, (pkg) => pkg.healthScore),
      detail: verdict1.score === verdict2.score ? 'Both packages are close overall.' : 'Weighted by health score and maintainability.',
    },
    {
      key: 'performance',
      icon: Gauge,
      title: 'Best for bundle size',
      winner: compareMetric(pkg1, pkg2, (pkg) => pkg.bundleSize?.gzip, true),
      detail: 'Smaller gzip footprint is better for frontend bundles.',
    },
    {
      key: 'maintenance',
      icon: ShieldCheck,
      title: 'Best maintained',
      winner: compareMetric(pkg1, pkg2, (pkg) => {
        const statusScore = pkg.maintenance?.status === 'active' ? 3 : pkg.maintenance?.status === 'slow' ? 2 : 1;
        const cadenceScore = pkg.maintenance?.releaseFrequency === 'high' ? 3 : pkg.maintenance?.releaseFrequency === 'medium' ? 2 : 1;
        return statusScore * 10 + cadenceScore;
      }),
      detail: 'Combines recent activity with release cadence.',
    },
    {
      key: 'community',
      icon: Users,
      title: 'Best community support',
      winner: compareMetric(pkg1, pkg2, (pkg) => (pkg.github?.stars || 0) + Math.min(pkg.downloads / 1000, 10000)),
      detail: 'Combines GitHub support with install momentum.',
    },
  ];

  const whenToChoose = pkg1.healthScore >= pkg2.healthScore
    ? `Choose ${pkg1.name} when you want the stronger default package choice.`
    : `Choose ${pkg2.name} when you want the stronger default package choice.`;

  const tradeoff = pkg1.bundleSize?.gzip === pkg2.bundleSize?.gzip
    ? 'Neither package has a clear bundle-size advantage.'
    : pkg1.bundleSize?.gzip < pkg2.bundleSize?.gzip
      ? `${pkg1.name} is lighter, while ${pkg2.name} may still win on ecosystem fit.`
      : `${pkg2.name} is lighter, while ${pkg1.name} may still win on ecosystem fit.`;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-100">Decision Summary</h3>
        <p className="text-sm text-slate-400">Use this first, then drill into charts and raw metrics.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-slate-200">
                <Icon className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-medium">{card.title}</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{card.winner}</p>
              <p className="mt-1 text-sm text-slate-400">{card.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-100">When to choose one</p>
          <p className="mt-2 text-sm text-slate-300">{whenToChoose}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-100">Tradeoff to watch</p>
          <p className="mt-2 text-sm text-slate-300">{tradeoff}</p>
        </div>
      </div>
    </div>
  );
};

export default CompareDecisionSummary;
