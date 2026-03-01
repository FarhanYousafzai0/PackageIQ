import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitCompare, Package2, Search } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Discover', icon: Search },
  { to: '/compare', label: 'Compare', icon: GitCompare },
];

const NavigationBar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-4 py-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.95)] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 text-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <Package2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-slate-200 uppercase">PackageIQ</p>
            <p className="text-xs text-slate-400">NPM intelligence cockpit</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default NavigationBar;
