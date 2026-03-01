import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PackageSearch from './pages/PackageSearch';
import CompareView from './pages/CompareView';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PackageSearch />} />
        <Route path="/compare" element={<CompareView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
