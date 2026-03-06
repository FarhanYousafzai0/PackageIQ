import React, { Suspense, lazy } from 'react';
import { 
  ExternalLink, 
  Github, 
  Star, 
  GitFork, 
  AlertCircle, 
  Calendar,
  Users,
  Tag,
  Shield,
  Clock3
} from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';

const InstallCommands = lazy(() => import('./InstallCommands'));

const AnimatedStat = ({ value, icon: Icon, iconColor, label, suffix }) => {
  const formatNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };
  const displayed = useCountUp(value, { duration: 900, formatter: formatNum });

  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 card-hover">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-semibold text-slate-200">{displayed}</p>
      {suffix && <p className="text-xs text-slate-500">{suffix}</p>}
    </div>
  );
};

const PackageCard = ({ pkg }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{pkg.name}</h2>
          <p className="text-slate-400 mt-1">v{pkg.version}</p>
        </div>
        <div className="flex items-center gap-2">
          {pkg.homepage && (
            <a
              href={pkg.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              title="Homepage"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          )}
          {pkg.github?.url && (
            <a
              href={pkg.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      <p className="text-slate-300 mb-4 line-clamp-2">{pkg.description || 'No description available'}</p>

      <div className="mb-6">
        <Suspense fallback={<div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Loading install examples...</div>}>
          <InstallCommands packageName={pkg.name} />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <AnimatedStat value={pkg.downloads} icon={Users} iconColor="text-indigo-400" label="Downloads" suffix="/week" />
        {pkg.github && (
          <>
            <AnimatedStat value={pkg.github.stars} icon={Star} iconColor="text-amber-400" label="Stars" />
            <AnimatedStat value={pkg.github.forks} icon={GitFork} iconColor="text-purple-400" label="Forks" />
            <AnimatedStat value={pkg.github.openIssues} icon={AlertCircle} iconColor="text-red-400" label="Issues" />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {pkg.license && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">License:</span>
            <span className="text-slate-200 font-medium">{pkg.license}</span>
          </div>
        )}

        {pkg.github?.lastPush && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Last updated:</span>
            <span className="text-slate-200 font-medium">{formatDate(pkg.github.lastPush)}</span>
          </div>
        )}

        {pkg.maintainers > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Maintainers:</span>
            <span className="text-slate-200 font-medium">{pkg.maintainers}</span>
          </div>
        )}

        {pkg.maintenance?.lastReleaseDate && (
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Last release:</span>
            <span className="text-slate-200 font-medium">{formatDate(pkg.maintenance.lastReleaseDate)}</span>
          </div>
        )}

        {pkg.trustSignals?.licenseRisk && (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">License risk:</span>
            <span className="text-slate-200 font-medium capitalize">{pkg.trustSignals.licenseRisk}</span>
          </div>
        )}
      </div>

      {pkg.keywords && pkg.keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pkg.keywords.slice(0, 8).map((keyword, index) => (
            <span key={index} className="px-2 py-1 text-xs rounded-md border border-white/10 bg-white/5 text-slate-400">
              {keyword}
            </span>
          ))}
          {pkg.keywords.length > 8 && (
            <span className="px-2 py-1 text-xs rounded-md border border-white/10 bg-white/5 text-slate-400">
              +{pkg.keywords.length - 8} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PackageCard;
