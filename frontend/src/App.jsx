import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initDb } from './utils/mockDb';

// Import our structured page views
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DriverLogin from './pages/DriverLogin';
import DriverPortal from './pages/DriverPortal';

import './App.css';

function App() {
  useEffect(() => {
    // Initialize the simulated database in localStorage on app load
    initDb();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect home to owner login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Owner authentication and dashboard routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Driver simplified PIN authentication and portal routes */}
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/portal" element={<DriverPortal />} />
        
        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
