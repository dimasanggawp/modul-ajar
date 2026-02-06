import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DeepLearningGenerator from './pages/DeepLearningGenerator';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generator" element={<DeepLearningGenerator />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
