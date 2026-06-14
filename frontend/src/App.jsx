import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initDb } from './utils/mockDb';

// Importation des vues de pages structurées
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DriverLogin from './pages/DriverLogin';
import DriverPortal from './pages/DriverPortal';

import './App.css';

function App() {
  useEffect(() => {
    // Initialisation de la base de données simulée dans localStorage au chargement de l'application
    initDb();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection de l'accueil vers la connexion propriétaire */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Routes d'authentification et de tableau de bord du propriétaire */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Routes du portail et d'authentification PIN simplifiée du chauffeur */}
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/portal" element={<DriverPortal />} />
        
        {/* Redirection globale vers la page de connexion */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
