import React from 'react';
import { Gauge, GitCompare, ShieldCheck, Sparkles } from 'lucide-react';

const cards = [
  {
    title: 'Decision-first verdicts',
    description: 'See whether a package is ready for production, heavy, stale, or worth replacing.',
    icon: Sparkles,
    accent: 'from-cyan-400/25 to-sky-400/5',
  },
  {
    title: 'Trust and maintenance signals',
    description: 'Review release freshness, maintainer spread, TypeScript support, and license risk quickly.',
    icon: ShieldCheck,
    accent: 'from-emerald-400/25 to-emerald-400/5',
  },
  {
    title: 'Bundle and dependency impact',
    description: 'Spot heavy packages before they hurt the browser bundle or complicate your dependency tree.',
    icon: Gauge,
    accent: 'from-amber-300/25 to-amber-300/5',
  },
  {
    title: 'Compare and switch faster',
    description: 'Jump into package comparisons and review alternatives without leaving the workflow.',
    icon: GitCompare,
    accent: 'from-fuchsia-400/25 to-fuchsia-400/5',
  },
];

const WhatYouGetSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">What you get</p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">A faster way to pick frontend packages</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Everything important is grouped into decision cards so you can move from research to install faster.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, description, icon: Icon, accent }) => (
          <div
            key={title}
            className={`rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${accent} p-[1px]`}
          >
            <div className="h-full rounded-[1.7rem] bg-slate-950/80 p-5 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatYouGetSection;
