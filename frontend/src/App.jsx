import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import FindFuelPage from './pages/FindFuelPage';
import StationDetailPage from './pages/StationDetailPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/find-fuel" element={<FindFuelPage />} />
        <Route path="/station/:id" element={<StationDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
