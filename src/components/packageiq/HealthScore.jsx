import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const HealthScore = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreStroke = (s) => {
    if (s >= 80) return '#34d399';
    if (s >= 60) return '#fbbf24';
    if (s >= 40) return '#fb923c';
    return '#f87171';
  };

  const getScoreBg = (s) => {
    if (s >= 80) return 'bg-emerald-500/20';
    if (s >= 60) return 'bg-amber-500/20';
    if (s >= 40) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getScoreBorder = (s) => {
    if (s >= 80) return 'border-emerald-500/30';
    if (s >= 60) return 'border-amber-500/30';
    if (s >= 40) return 'border-orange-500/30';
    return 'border-red-500/30';
  };

  const getScoreIcon = (s) => {
    if (s >= 80) return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (s >= 60) return <Activity className="w-5 h-5 text-amber-400" />;
    if (s >= 40) return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Poor';
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`relative p-6 rounded-2xl border ${getScoreBorder(score)} ${getScoreBg(score)} backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-4">
        {getScoreIcon(score)}
        <h3 className="text-lg font-semibold text-slate-200">Health Score</h3>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-700"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={getScoreStroke(score)}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400 mt-1">/ 100</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(score)} ${getScoreColor(score)}`}>
          {getScoreIcon(score)}
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
};

export default HealthScore;
