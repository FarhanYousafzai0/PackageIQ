import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const PackageSearch = lazy(() => import('./pages/PackageSearch'));
const CompareView = lazy(() => import('./pages/CompareView'));

function App() {
  return (
    <Router>
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
