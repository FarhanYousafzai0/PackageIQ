import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import axios from 'axios';

const RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
];

const fetchRange = async (packageName, days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  const url = `https://api.npmjs.org/downloads/range/${startStr}:${endStr}/${packageName}`;

  try {
    const res = await axios.get(url, { timeout: 15000 });
    return res.data.downloads || [];
  } catch {
    try {
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await axios.get(proxy, { timeout: 15000 });
      return res.data.downloads || [];
    } catch {
      return [];
    }
  }
};

const DownloadChart = ({ data: initialData, packageName }) => {
  const [range, setRange] = useState('7d');
  const [chartRawData, setChartRawData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (range === '7d') {
      setChartRawData(initialData);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await fetchRange(packageName, RANGES.find((r) => r.key === range).days);
      if (!cancelled) {
        setChartRawData(result);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [range, packageName, initialData]);

  if ((!initialData || initialData.length === 0) && (!chartRawData || chartRawData.length === 0)) {
    return (
      <div className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-slate-200">Download Trends</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-slate-500">
          No download data available
        </div>
      </div>
    );
  }

  const chartData = (chartRawData || []).map((item) => ({
    date: new Date(item.day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    downloads: item.downloads,
  }));

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-indigo-400 font-semibold">
            {formatNumber(payload[0].value)} downloads
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-slate-200">Download Trends</h3>
        </div>

        <div className="flex rounded-lg border border-slate-700 overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r.key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-48 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/60 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${packageName}-${range}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={range === '90d' ? 13 : range === '30d' ? 4 : 0}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="downloads"
              stroke="#818cf8"
              strokeWidth={2}
              fill={`url(#gradient-${packageName}-${range})`}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DownloadChart;
