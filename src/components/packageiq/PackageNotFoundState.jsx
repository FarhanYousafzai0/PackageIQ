import React from 'react';
import { Compass, PackageSearch } from 'lucide-react';

const copyByContext = {
  search: {
    title: 'Package not found',
    description: 'We could not find this package on npm. Check the name and try another search.',
  },
  compare: {
    title: 'Package unavailable',
    description: 'This package could not be resolved from npm, so there is nothing to compare on this side.',
  },
};

const PackageNotFoundState = ({ packageName, context = 'search' }) => {
  const copy = copyByContext[context] || copyByContext.search;

  return (
    <div className="rounded-[1.75rem] border border-amber-400/20 bg-slate-950/70 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
          <PackageSearch className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-100">{copy.title}</h2>
          <p className="mt-2 text-slate-300">{copy.description}</p>
          <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-cyan-200">
            {packageName}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-100">Check the spelling</p>
          <p className="mt-1 text-sm text-slate-400">Package names are exact and usually all lowercase.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-100">Verify the scope</p>
          <p className="mt-1 text-sm text-slate-400">Scoped packages need the full format, like `@scope/name`.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-slate-100">
            <Compass className="h-4 w-4 text-cyan-300" />
            <p className="text-sm font-medium">Try a broader search</p>
          </div>
          <p className="mt-1 text-sm text-slate-400">Search a library family or the unscoped package name first.</p>
        </div>
      </div>
    </div>
  );
};

export default PackageNotFoundState;
