import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

const PackageSearch = lazy(() => import('./pages/PackageSearch'));
const CompareView = lazy(() => import('./pages/CompareView'));

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
      <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Loading PackageIQ...</div>}>
        <Routes>
          <Route path="/" element={<PackageSearch />} />
          <Route path="/compare" element={<CompareView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
