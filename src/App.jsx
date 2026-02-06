import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DeepLearningGenerator from './pages/DeepLearningGenerator';
import ModulAjarGenerator from './pages/ModulAjarGenerator';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generator-rencana-pembelajaran-mendalam" element={<DeepLearningGenerator />} />
        <Route path="/generator-modul-ajar" element={<ModulAjarGenerator />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
