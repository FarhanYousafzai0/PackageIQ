import React from 'react';
import { Puzzle, Check, X } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const compatFlags = [
  { key: 'esm', label: 'ESM', tip: 'ES Modules — the modern JavaScript import/export format for tree-shaking and fast bundling.' },
  { key: 'cjs', label: 'CommonJS', tip: 'CommonJS — the require() format used by Node.js and older bundlers.' },
  { key: 'types', label: 'TypeScript', tip: 'Bundled TypeScript type definitions for autocompletion and compile-time checks.' },
  { key: 'browser', label: 'Browser', tip: 'Has a browser-specific entry point for client-side usage.' },
  { key: 'treeshakeable', label: 'Tree-shakeable', tip: 'Unused exports can be removed by bundlers to reduce final bundle size.' },
];

const FrameworkCompat = ({ compat }) => {
  if (!compat) return null;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
      <div className="mb-5 flex items-center gap-3">
        <Puzzle className="h-5 w-5 text-cyan-300" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Framework Compatibility</h3>
          <p className="text-sm text-slate-400">Module format, environment support, and peer requirements.</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {compatFlags.map(({ key, label, tip }) => {
          const supported = compat[key];
          return (
            <Tooltip key={key} text={tip}>
              <div
                className={`w-full rounded-2xl border p-3 text-center cursor-default card-hover ${
                  supported
                    ? 'border-emerald-500/20 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-1 flex items-center justify-center">
                  {supported ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <p className={`text-sm font-medium ${supported ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {label}
                </p>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {compat.nodeEngines && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">
            Node requirement: <span className="font-semibold text-slate-200">{compat.nodeEngines}</span>
          </p>
        </div>
      )}

      {compat.peerDeps?.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-400">Peer Dependencies</p>
          <div className="flex flex-wrap gap-2">
            {compat.peerDeps.map((dep) => (
              <span
                key={dep.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
              >
                {dep.name}
                <span className="text-slate-500">{dep.version}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameworkCompat;
