import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { authApi } from './services/api';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import FindFuelPage from './pages/FindFuelPage';
import StationDetailPage from './pages/StationDetailPage';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const { token, setUser, logout } = useAppStore();
  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res) => setUser(res.user))
        .catch(() => logout());
    }
  }, []);
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/find-fuel" element={<FindFuelPage />} />
        <Route path="/station/:id" element={<StationDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
