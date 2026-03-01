import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const DownloadChart = ({ data, packageName }) => {
  if (!data || data.length === 0) {
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

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    downloads: item.downloads,
    fullDate: item.day,
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
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-200">Download Trends (7 Days)</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${packageName}`} x1="0" y1="0" x2="0" y2="1">
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
              fill={`url(#gradient-${packageName})`}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DownloadChart;
