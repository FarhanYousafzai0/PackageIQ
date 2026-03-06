import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const riskColors = {
  low: {
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    text: 'text-emerald-400',
    label: 'Low Risk',
  },
  medium: {
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
    text: 'text-amber-400',
    label: 'Medium Risk',
  },
  high: {
    badge: 'border-red-500/20 bg-red-500/10 text-red-300',
    text: 'text-red-400',
    label: 'High Risk',
  },
};

const riskIcon = {
  low: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  medium: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  high: <XCircle className="h-4 w-4 text-red-400" />,
};

const SupplyChainRisk = ({ supplyChain }) => {
  if (!supplyChain) return null;

  const { riskLevel, score, signals } = supplyChain;
  const colors = riskColors[riskLevel] || riskColors.medium;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl card-hover">
      <div className="mb-5 flex items-center gap-3">
        <ShieldAlert className="h-5 w-5 text-cyan-300" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-100">Supply Chain Risk</h3>
            <Tooltip text="Evaluates dependency depth, maintainer count, license, and update frequency to estimate security exposure.">
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-sm text-slate-400">Security and dependency chain assessment.</p>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${colors.badge}`}>
          {riskIcon[riskLevel]}
          {colors.label}
        </div>
        <div className="text-sm text-slate-400">
          Safety score: <span className={`font-semibold ${colors.text}`}>{score}</span>
          <span className="text-slate-500"> / 100</span>
        </div>
      </div>

      {signals?.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {signals.map((signal) => {
            const sc = riskColors[signal.risk] || riskColors.medium;
            return (
              <div
                key={signal.key}
                className={`rounded-2xl border p-4 ${sc.badge}`}
              >
                <div className="flex items-center gap-2">
                  {riskIcon[signal.risk]}
                  <p className="text-sm font-semibold">{signal.label}</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{signal.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplyChainRisk;
