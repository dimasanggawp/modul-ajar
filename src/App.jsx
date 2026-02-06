import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DeepLearningGenerator from './pages/DeepLearningGenerator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generator" element={<DeepLearningGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
