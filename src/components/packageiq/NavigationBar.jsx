import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitCompare, Package2, Search, FileJson, Keyboard, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Discover', icon: Search },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/audit', label: 'Audit', icon: FileJson },
];

const shortcuts = [
  { keys: ['/'], description: 'Focus search input' },
  { keys: ['Esc'], description: 'Clear search & blur input' },
  { keys: ['?'], description: 'Show this shortcuts panel' },
];

const ShortcutsModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-semibold text-slate-100">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
              <span className="text-sm text-slate-300">{s.description}</span>
              <div className="flex gap-1.5">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NavigationBar = () => {
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '?' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-4 py-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.95)] backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-3 text-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Package2 className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-[0.24em] text-slate-200 uppercase">PackageIQ</p>
              <p className="text-xs text-slate-400">NPM intelligence cockpit</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to);

                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_8px_24px_-8px_rgba(34,211,238,0.5)]'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white sm:flex"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
};

export default NavigationBar;
