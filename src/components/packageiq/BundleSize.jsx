import React from 'react';
import { Package, Zap, Layers } from 'lucide-react';

const BundleSizeDisplay = ({ bundleSize }) => {
  if (!bundleSize) {
    return (
      <div className="p-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl card-hover">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-200">Bundle Size</h3>
        </div>
        <div className="h-32 flex items-center justify-center text-slate-500">
          No bundle size data available
        </div>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSizeCategory = (gzip) => {
    if (gzip < 10000) return { label: 'Small', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (gzip < 50000) return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (gzip < 100000) return { label: 'Large', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { label: 'Very Large', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const sizeCategory = getSizeCategory(bundleSize.gzip);

  return (
    <div className="p-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl card-hover">
      <div className="flex items-center gap-3 mb-4">
        <Package className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-slate-200">Bundle Size</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Minified</span>
          </div>
          <p className="text-xl font-semibold text-slate-200">
            {formatBytes(bundleSize.size)}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Gzipped</span>
          </div>
          <p className="text-xl font-semibold text-slate-200">
            {formatBytes(bundleSize.gzip)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Dependencies</span>
        </div>
        <span className="font-medium text-slate-200">
          {bundleSize.dependencyCount}
        </span>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sizeCategory.bg} ${sizeCategory.color}`}>
          {sizeCategory.label}
        </span>
        
        {bundleSize.hasJSModule && (
          <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
            ES Module
          </span>
        )}
      </div>
    </div>
  );
};

export default BundleSizeDisplay;
