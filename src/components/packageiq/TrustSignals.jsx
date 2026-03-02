import React from 'react';
import { AlertTriangle, BadgeCheck, Clock3, FileBadge, Layers3, ShieldCheck, Users } from 'lucide-react';

const signalStyles = {
  positive: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  neutral: 'border-white/10 bg-white/5 text-slate-300',
};

const iconMap = {
  maintenance: Clock3,
  license: ShieldCheck,
  types: FileBadge,
  maintainers: Users,
  dependencies: Layers3,
};

const labelByStatus = {
  active: 'Maintained',
  slow: 'Slowly maintained',
  stale: 'Stale',
};

const TrustSignals = ({ maintenance, trustSignals }) => {
  if (!maintenance || !trustSignals) return null;

  const cards = [
    {
      key: 'maintenance',
      icon: iconMap.maintenance,
      title: labelByStatus[maintenance.status] || 'Unknown maintenance',
      description: `Release cadence: ${maintenance.releaseFrequency}`,
      tone: maintenance.status === 'active' ? 'positive' : maintenance.status === 'stale' ? 'warning' : 'neutral',
    },
    {
      key: 'license',
      icon: iconMap.license,
      title: trustSignals.licenseRisk === 'safe' ? 'Low-risk license' : trustSignals.licenseRisk === 'review' ? 'Review license' : 'License unknown',
      description: trustSignals.licenseRisk === 'review' ? 'Manual legal review recommended.' : 'Suitable for most frontend teams.',
      tone: trustSignals.licenseRisk === 'review' ? 'warning' : 'positive',
    },
    {
      key: 'types',
      icon: iconMap.types,
      title: trustSignals.hasTypes ? 'Good TypeScript support' : 'No bundled types',
      description: trustSignals.hasTypes ? 'Types are available in the package.' : 'Type support may require community definitions.',
      tone: trustSignals.hasTypes ? 'positive' : 'neutral',
    },
    {
      key: 'maintainers',
      icon: iconMap.maintainers,
      title: trustSignals.singleMaintainerRisk ? 'Single-maintainer risk' : 'Maintainer spread looks healthy',
      description: `${maintenance.maintainersCount} maintainer${maintenance.maintainersCount === 1 ? '' : 's'}`,
      tone: trustSignals.singleMaintainerRisk ? 'warning' : 'positive',
    },
    {
      key: 'dependencies',
      icon: iconMap.dependencies,
      title: trustSignals.dependencyCount > 20 ? 'Heavy dependency tree' : 'Dependency tree looks manageable',
      description: trustSignals.dependencyCount != null ? `${trustSignals.dependencyCount} transitive/runtime dependencies` : 'Dependency count unavailable',
      tone: trustSignals.dependencyCount > 20 ? 'warning' : 'neutral',
    },
  ];

  if (trustSignals.archived) {
    cards.unshift({
      key: 'archived',
      icon: AlertTriangle,
      title: 'Repository archived',
      description: 'Archived projects are usually poor choices for new production work.',
      tone: 'warning',
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <BadgeCheck className="h-5 w-5 text-cyan-300" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Trust Signals</h3>
          <p className="text-sm text-slate-400">Quick checks for maintenance, licensing, and adoption risk.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`rounded-2xl border p-4 ${signalStyles[card.tone] || signalStyles.neutral}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <p className="text-sm font-semibold">{card.title}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustSignals;
