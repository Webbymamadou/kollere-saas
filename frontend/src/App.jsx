import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initDb } from './utils/mockDb';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import views
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import DriverLogin from './pages/DriverLogin';
import DriverPortal from './pages/DriverPortal';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

const ProtectedRoute = ({ element }) => {
  const { user, hasActiveAccess, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasActiveAccess) {
    return <Navigate to="/subscription" replace />;
  }

  return element;
};

const AdminRoute = ({ element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return element;
};

const AppContent = () => {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <Routes>
      {/* Page d'accueil publique */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Subscription */}
      <Route path="/subscription" element={<Subscription />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />

      {/* Driver Routes */}
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver/portal" element={<DriverPortal />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
