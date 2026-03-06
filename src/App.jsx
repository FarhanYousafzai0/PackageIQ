import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

const PackageSearch = lazy(() => import('./pages/PackageSearch'));
const CompareView = lazy(() => import('./pages/CompareView'));
const CompatibilityChecker = lazy(() => import('./pages/CompatibilityChecker'));

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<PackageSearch />} />
        <Route path="/compare" element={<CompareView />} />
        <Route path="/audit" element={<CompatibilityChecker />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
          },
        }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading PackageIQ...</p>
        </div>
      }>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  );
}

export default App;
