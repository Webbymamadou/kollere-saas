import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Landmark, 
  Navigation, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  LogOut, 
  RefreshCw,
  Menu,
  X,
  MapPin,
  ShieldCheck
} from 'lucide-react';

import { getFromDb, saveToDb } from '../utils/mockDb';

// Import upgraded modals
import ReceiptModal from '../components/ReceiptModal';
import AddVehicleModal from '../components/AddVehicleModal';

// Chart.js imports & registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [vehicles, setVehicles] = useState(() => getFromDb('vehicles', []));
  const [drivers, setDrivers] = useState(() => getFromDb('drivers', []));
  const [payments, setPayments] = useState(() => getFromDb('payments', []));
  const [maintenances] = useState(() => {
    const initialMaintenances = [
      { id: 'm1', vehicle_id: 'v1', type: 'oil_change', mileage_at_maintenance: 44100, cost: 25000, maintenance_date: '2026-05-15', description: 'Vidange complète' },
      { id: 'm2', vehicle_id: 'v3', type: 'brakes', mileage_at_maintenance: 82100, cost: 45000, maintenance_date: '2026-06-02', description: 'Changement plaquettes' }
    ];
    return getFromDb('maintenances', initialMaintenances);
  });
  const [incidents, setIncidents] = useState(() => getFromDb('incidents', []));
  const [documents, setDocuments] = useState(() => getFromDb('documents', []));
  const [fleetName, setFleetName] = useState(() => {
    const profile = localStorage.getItem('verse_owner_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.fleetName) {
        return parsed.fleetName;
      }
    }
    return 'Dakar Fleet';
  });
  
  // Custom tabs and sidebar navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals & Popovers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // all, approved, pending, rejected
  const [incidentFilter, setIncidentFilter] = useState('all'); // all, pending, resolved
  
  // Notification states
  const [notifications, setNotifications] = useState([
    { id: 'init-1', title: 'Système configuré', body: 'Le dashboard premium Kollëré est opérationnel.', time: '18:30', read: false },
    { id: 'init-2', title: 'Relances WhatsApp', body: 'Tâches programmées à 22h00 prêtes.', time: '17:45', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const navigate = useNavigate();

  // Load data from mock DB on mount
  useEffect(() => {
    const role = localStorage.getItem('verse_auth_role');
    if (role !== 'owner') {
      navigate('/login');
    }
  }, [navigate]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Close notifications panel on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerNotification = (title, body) => {
    // Add to internal notification center
    const timeNow = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newNotif = {
      id: 'n_' + Date.now(),
      title,
      body,
      time: timeNow,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // System level HTML5 notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { 
        body,
        icon: '/favicon.ico',
        vibrate: [200, 100, 200]
      });
    }
  };

  // Listen to cross-tab updates via localStorage to auto-refresh state and trigger notifications
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'verse_payments') {
        try {
          const newVal = JSON.parse(e.newValue || '[]');
          const prevPendingIds = payments.filter(p => p.status === 'pending').map(p => p.id);
          const newPendings = newVal.filter(p => p.status === 'pending' && !prevPendingIds.includes(p.id));
          
          setPayments(newVal);

          newPendings.forEach(p => {
            triggerNotification(
              "Nouveau versement 💰",
              `${p.driver_name} a soumis un versement de ${p.amount.toLocaleString()} FCFA.`
            );
          });
        } catch (err) {
          console.error(err);
        }
      }
      
      if (e.key === 'verse_incidents') {
        try {
          const newVal = JSON.parse(e.newValue || '[]');
          const prevPendingIds = incidents.filter(i => i.status === 'pending').map(i => i.id);
          const newPendings = newVal.filter(i => i.status === 'pending' && !prevPendingIds.includes(i.id));
          
          setIncidents(newVal);

          newPendings.forEach(inc => {
            const catLabel = inc.type === 'engine' ? 'Moteur' : inc.type === 'accident' ? 'Accident' : 'Police';
            triggerNotification(
              "⚠️ Nouvel incident signalé",
              `${inc.driver_name} a déclaré un problème (${catLabel}) : "${inc.description}".`
            );
          });
        } catch (err) {
          console.error(err);
        }
      }

      if (e.key === 'verse_vehicles') {
        try {
          setVehicles(JSON.parse(e.newValue || '[]'));
        } catch (err) {
          console.error(err);
        }
      }

      if (e.key === 'verse_drivers') {
        try {
          setDrivers(JSON.parse(e.newValue || '[]'));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [payments, incidents]);

  // Business Logic handlers
  const handleApprovePayment = (paymentId) => {
    const updatedPayments = payments.map(p => {
      if (p.id === paymentId) {
        if (p.odometer) {
          const updatedVehicles = vehicles.map(v => {
            if (v.id === p.vehicle_id) {
              return { ...v, current_mileage: p.odometer, pending_mileage: null };
            }
            return v;
          });
          setVehicles(updatedVehicles);
          saveToDb('vehicles', updatedVehicles);
        }
        return { ...p, status: 'approved', validated_at: new Date().toISOString() };
      }
      return p;
    });
    setPayments(updatedPayments);
    saveToDb('payments', updatedPayments);

    triggerNotification("Versement approuvé", "Les données financières et d'odomètre ont été mises à jour.");
  };

  const handleRejectPayment = (paymentId) => {
    const updatedPayments = payments.map(p => {
      if (p.id === paymentId) {
        const updatedVehicles = vehicles.map(v => {
          if (v.id === p.vehicle_id) {
            return { ...v, pending_mileage: null };
          }
          return v;
        });
        setVehicles(updatedVehicles);
        saveToDb('vehicles', updatedVehicles);
        return { ...p, status: 'rejected' };
      }
      return p;
    });
    setPayments(updatedPayments);
    saveToDb('payments', updatedPayments);

    triggerNotification("Versement rejeté", "La transaction a été marquée comme invalide.");
  };

  const handleAddVehicleAndDriver = ({ id, vehicleId, magicToken, plate, model, mileage, driverName, driverPhone, driverPin }) => {
    const driverObj = {
      id,
      name: driverName,
      phone: driverPhone,
      pin_code: driverPin,
      status: 'active',
      vehicle_id: vehicleId,
      magic_token: magicToken
    };

    const vehicleObj = {
      id: vehicleId,
      license_plate: plate,
      brand_model: model,
      current_mileage: mileage,
      last_oil_change_mileage: mileage,
      status: 'active',
      driver_id: id,
      year: '2023' // default year for modern layout
    };

    const updatedDrivers = [...drivers, driverObj];
    const updatedVehicles = [...vehicles, vehicleObj];

    setDrivers(updatedDrivers);
    setVehicles(updatedVehicles);

    saveToDb('drivers', updatedDrivers);
    saveToDb('vehicles', updatedVehicles);

    triggerNotification("Enrôlement réussi", `Le véhicule ${plate} et le chauffeur ${driverName} sont en ligne.`);
  };

  const handleDeleteDriver = (driverId) => {
    const updatedDrivers = drivers.filter(d => d.id !== driverId);
    setDrivers(updatedDrivers);
    saveToDb('drivers', updatedDrivers);

    const updatedVehicles = vehicles.map(v => {
      if (v.driver_id === driverId) {
        return { ...v, driver_id: null };
      }
      return v;
    });
    setVehicles(updatedVehicles);
    saveToDb('vehicles', updatedVehicles);

    triggerNotification("Chauffeur désactivé", "Registre mis à jour.");
  };

  const handleDeleteVehicle = (vehicleId) => {
    const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updatedVehicles);
    saveToDb('vehicles', updatedVehicles);

    const updatedDrivers = drivers.map(d => {
      if (d.vehicle_id === vehicleId) {
        return { ...d, vehicle_id: null };
      }
      return d;
    });
    setDrivers(updatedDrivers);
    saveToDb('drivers', updatedDrivers);

    triggerNotification("Véhicule supprimé", "Registre mis à jour.");
  };

  const handleTogglePaymentStatus = (driverId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedDrivers = drivers.map(d => {
      if (d.id === driverId) {
        const driverPayments = payments.filter(p => 
          p.status === 'approved' && 
          p.driver_name === d.name &&
          p.date === todayStr
        );
        const totalPaidToday = driverPayments.reduce((sum, p) => sum + p.amount, 0);
        const autoPaid = totalPaidToday > 0;
        
        const currentIsPaid = d.paid_today !== undefined ? d.paid_today : autoPaid;
        return { ...d, paid_today: !currentIsPaid };
      }
      return d;
    });
    setDrivers(updatedDrivers);
    saveToDb('drivers', updatedDrivers);
  };

  const handleResolveIncident = (incidentId) => {
    const updatedIncidents = incidents.map(i => {
      if (i.id === incidentId) {
        return { ...i, status: 'resolved' };
      }
      return i;
    });
    setIncidents(updatedIncidents);
    saveToDb('incidents', updatedIncidents);
    triggerNotification("Incident résolu", "L'alerte a été classée.");
  };

  const handleRegenerateMagicToken = (driverId) => {
    const updatedDrivers = drivers.map(d => {
      if (d.id === driverId) {
        return { 
          ...d, 
          magic_token: 'mt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        };
      }
      return d;
    });
    setDrivers(updatedDrivers);
    saveToDb('drivers', updatedDrivers);
    triggerNotification("Accès réinitialisé", "Nouveau lien magique généré.");
  };

  const handleLogout = () => {
    localStorage.removeItem('verse_auth_role');
    navigate('/login');
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getOilChangeStatus = (vehicle) => {
    const driven = vehicle.current_mileage - vehicle.last_oil_change_mileage;
    const remaining = Math.max(0, 5000 - driven);
    const percentage = Math.min(100, (driven / 5000) * 100);
    
    if (driven >= 5000) return { label: 'Urgent', driven, remaining, percentage: 100, color: 'text-red-500 bg-red-50 border-red-100', barColor: 'bg-red-500', urgent: true };
    if (driven >= 4500) return { label: 'À prévoir', driven, remaining, percentage, color: 'text-amber-600 bg-amber-50 border-amber-100', barColor: 'bg-amber-500', urgent: false };
    return { label: 'Correct', driven, remaining, percentage, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', barColor: 'bg-emerald-500', urgent: false };
  };

  // Financial metrics
  const approvedPayments = payments.filter(p => p.status === 'approved');
  const totalEarnings = approvedPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalSpend = maintenances.reduce((acc, m) => acc + m.cost, 0);
  const netProfit = totalEarnings - totalSpend;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const earningsToday = payments
    .filter(p => p.status === 'approved' && p.date === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // '2026-06'
  const earningsMonth = payments
    .filter(p => p.status === 'approved' && p.date.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + p.amount, 0);

  // Profitability rate: Net Profit / Gross Earnings
  const profitabilityRate = totalEarnings > 0 
    ? Math.round((netProfit / totalEarnings) * 100) 
    : 100;


  // Trips Mock data
  const mockCourses = [
    { id: 'c_1', driver: 'Moussa Diop', vehicle: 'DK-3421-A', date: '2026-06-06', time: '14:20', route: 'Mermoz ➔ Plateau', amount: 8500, status: 'completed', platform: 'Yango' },
    { id: 'c_2', driver: 'Amadou Sow', vehicle: 'DK-8854-B', date: '2026-06-06', time: '15:10', route: 'Almadies ➔ AIBD', amount: 22000, status: 'completed', platform: 'Uber' },
    { id: 'c_3', driver: 'Moussa Diop', vehicle: 'DK-3421-A', date: '2026-06-06', time: '16:05', route: 'Plateau ➔ Yoff', amount: 7000, status: 'completed', platform: 'Heetch' },
    { id: 'c_4', driver: 'Ibrahima Ndiaye', vehicle: 'DK-9921-C', date: '2026-06-06', time: '10:15', route: 'Liberté 6 ➔ Parcelles', amount: 4500, status: 'completed', platform: 'Yassir' },
    { id: 'c_5', driver: 'Amadou Sow', vehicle: 'DK-8854-B', date: '2026-06-06', time: '11:45', route: 'Fann ➔ Thiaroye', amount: 9500, status: 'completed', platform: 'Yango' },
    { id: 'c_6', driver: 'Ibrahima Ndiaye', vehicle: 'DK-9921-C', date: '2026-06-05', time: '19:30', route: 'Ngor ➔ Point E', amount: 6200, status: 'completed', platform: 'Heetch' }
  ];

  // Calcule le statut d'un document en temps réel à partir de sa date d'expiration
  // Retourne: { label, color, daysLeft, isExpired, isExpiring, isValid }
  const getDocStatus = (expiry) => {
    const daysLeft = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0)  return { label: 'Expiré',       color: '#EF4444', daysLeft, isExpired: true,  isExpiring: false, isValid: false };
    if (daysLeft <= 60) return { label: 'Bientôt expiré', color: '#D97706', daysLeft, isExpired: false, isExpiring: true,  isValid: false };
    return               { label: 'Valide',           color: '#16A34A', daysLeft, isExpired: false, isExpiring: false, isValid: true  };
  };

  // Génère et télécharge un PDF HTML pour un document administratif
  const handleDownloadDocPdf = (doc) => {
    const { label: statusLabel, color: statusColor } = getDocStatus(doc.expiry);
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${doc.type} — ${doc.vehicle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #0F172A; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6D4AFF; padding-bottom: 20px; margin-bottom: 32px; }
    .brand { font-size: 22px; font-weight: 900; color: #6D4AFF; }
    .brand span { color: #0F172A; }
    .badge { background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40; border-radius: 8px; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
    .subtitle { font-size: 13px; color: #64748B; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .field { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; }
    .field-label { font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .field-value { font-size: 14px; font-weight: 700; color: #0F172A; }
    .footer { border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 11px; color: #94A3B8; display: flex; justify-content: space-between; }
    .watermark { text-align: center; margin: 24px 0; color: #CBD5E1; font-size: 11px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Verse<span>SaaS</span></div>
    <div class="badge">${statusLabel}</div>
  </div>
  <h1>${doc.type}</h1>
  <p class="subtitle">Document administratif de la flotte VTC — Généré automatiquement</p>
  <div class="grid">
    <div class="field">
      <div class="field-label">Véhicule concerné</div>
      <div class="field-value">${doc.vehicle}</div>
    </div>
    <div class="field">
      <div class="field-label">Type de document</div>
      <div class="field-value">${doc.type}</div>
    </div>
    <div class="field">
      <div class="field-label">Date d'expiration</div>
      <div class="field-value">${doc.expiry}</div>
    </div>
    <div class="field">
      <div class="field-label">Fichier source</div>
      <div class="field-value">${doc.file}</div>
    </div>
    <div class="field">
      <div class="field-label">Statut</div>
      <div class="field-value" style="color: ${statusColor}">${statusLabel}</div>
    </div>
    <div class="field">
      <div class="field-label">Date de génération</div>
      <div class="field-value">${today}</div>
    </div>
  </div>
  <div class="watermark">⬛ Ce document a été généré par VerseSaaS — à valider auprès des autorités compétentes</div>
  <div class="footer">
    <span>VerseSaaS — Gestion de Flotte VTC</span>
    <span>Réf. ${doc.id.toUpperCase()} · ${today}</span>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file.replace('.pdf', '') + '_verse.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered lists for search and selectors
  const filteredVehicles = vehicles.filter(v => 
    v.brand_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  );

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.transaction_reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = paymentFilter === 'all' || p.status === paymentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = incidentFilter === 'all' || i.status === incidentFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate Driver Scores for Leaderboard
  const getLeaderboardDrivers = () => {
    return drivers.map(d => {
      const dPayments = payments.filter(p => p.driver_name === d.name);
      const dApproved = dPayments.filter(p => p.status === 'approved');
      const dRejected = dPayments.filter(p => p.status === 'rejected');
      const dIncidents = incidents.filter(i => i.driver_name === d.name);
      const pendingInc = dIncidents.filter(i => i.status === 'pending');
      const resolvedInc = dIncidents.filter(i => i.status === 'resolved');
      
      const v = vehicles.find(veh => veh.id === d.vehicle_id);
      let oilPenalty = 0;
      if (v) {
        const driven = v.current_mileage - v.last_oil_change_mileage;
        if (driven >= 5000) oilPenalty = -40;
        else if (driven >= 4500) oilPenalty = -10;
      }
      
      const paymentScore = dApproved.length * 100;
      const rejectPenalty = dRejected.length * 50;
      const incidentScore = (resolvedInc.length * 30) - (pendingInc.length * 40);
      const totalScore = Math.max(0, paymentScore - rejectPenalty + incidentScore + oilPenalty);
      
      const totalSubs = dPayments.length;
      const complianceRate = totalSubs > 0 ? Math.round((dApproved.length / totalSubs) * 100) : 100;

      const monthlyRev = dApproved
        .filter(p => p.date.startsWith(currentMonthPrefix))
        .reduce((sum, p) => sum + p.amount, 0);

      const dailyRev = dApproved
        .filter(p => p.date === todayStr)
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        ...d,
        score: totalScore,
        complianceRate,
        approvedCount: dApproved.length,
        monthlyRevenue: monthlyRev,
        dailyRevenue: dailyRev,
        vehiclePlate: v ? v.license_plate : 'Non assigné'
      };
    })
    .sort((a, b) => b.score - a.score);
  };

  const leaderboard = getLeaderboardDrivers().slice(0, 3);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // --- CHART CONFIGURATIONS ---
  // 1. Line Chart: Evolution of revenues (Last 6 Months)
  const lineChartData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: [450000, 520000, 610000, 580000, 710000, Math.max(earningsMonth, 780000)],
        borderColor: '#6D4AFF',
        backgroundColor: 'rgba(109, 74, 255, 0.04)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#6D4AFF',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { size: 11, family: 'Plus Jakarta Sans' },
        bodyFont: { size: 12, family: 'Plus Jakarta Sans', weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748B' } },
      y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748B' } }
    }
  };

  // 2. Bar Chart: Drivers Earnings Comparison
  const barChartData = {
    labels: drivers.map(d => d.name),
    datasets: [
      {
        label: 'Revenu Mensuel (FCFA)',
        data: drivers.map(d => {
          const dApproved = payments.filter(p => p.status === 'approved' && p.driver_name === d.name);
          return Math.max(dApproved.reduce((sum, p) => sum + p.amount, 0), 15000); // minimum 15000 for visuals
        }),
        backgroundColor: '#6D4AFF',
        borderRadius: 8,
        hoverBackgroundColor: '#5636E5',
        barPercentage: 0.5,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { size: 11, family: 'Plus Jakarta Sans' },
        bodyFont: { size: 12, family: 'Plus Jakarta Sans', weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748B' } },
      y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748B' } }
    }
  };

  // 3. Donut Chart: Vehicle Status Distribution
  const getVehicleDistribution = () => {
    let online = 0;
    let offline = 0;
    let maintenance = 0;
    let inactive = 0;

    vehicles.forEach(v => {
      if (v.status === 'maintenance') {
        maintenance++;
      } else if (v.status === 'active' && v.driver_id) {
        online++;
      } else if (v.status === 'active') {
        offline++;
      } else {
        inactive++;
      }
    });

    // Make sure we have numbers to render
    if (vehicles.length === 0) return [0, 0, 0, 0];
    return [online, offline, maintenance, inactive];
  };

  const donutChartData = {
    labels: ['En ligne', 'Hors ligne', 'Maintenance', 'Inactif'],
    datasets: [
      {
        data: getVehicleDistribution(),
        backgroundColor: ['#10B981', '#64748B', '#F59E0B', '#EF4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }
    ]
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { size: 10, family: 'Plus Jakarta Sans', weight: '600' },
          color: '#334155'
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 8,
        cornerRadius: 6,
        bodyFont: { size: 11, family: 'Plus Jakarta Sans' }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans select-none">
      
      {/* --- SIDEBAR BAR --- */}
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 fixed top-0 bottom-0 left-0 z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6D4AFF] text-white flex items-center justify-center font-bold shadow-md shadow-[#6D4AFF]/20">
              K
            </div>
            <span className="font-bold text-[17px] tracking-tight text-slate-900">Kollëré</span>
            <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
              {fleetName}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'vehicles', label: 'Véhicules', icon: Car },
            { id: 'drivers', label: 'Chauffeurs', icon: Users },
            { id: 'payments', label: 'Paiements', icon: Landmark },
            { id: 'courses', label: 'Courses', icon: Navigation },
            { id: 'revenus', label: 'Revenus', icon: TrendingUp },
            { id: 'stats', label: 'Statistiques', icon: Landmark },
            { id: 'alertes', label: 'Alertes', icon: AlertTriangle },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'settings', label: 'Paramètres', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchTerm('');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#6D4AFF] text-white shadow-lg shadow-[#6D4AFF]/15' 
                    : 'text-slate-600 hover:text-[#6D4AFF] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#6D4AFF]'}`} />
                {item.label}
                {item.id === 'alertes' && incidents.filter(i => i.status === 'pending').length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {incidents.filter(i => i.status === 'pending').length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Owner Info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-[#6D4AFF]/10 text-[#6D4AFF] flex items-center justify-center font-extrabold text-xs">
              OP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Propriétaire</p>
              <p className="text-[10px] text-slate-400 truncate">owner@verse.local</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Responsive mobile sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden flex">
          <div className="w-64 bg-white flex flex-col h-full shadow-2xl animate-fade-in">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6D4AFF] text-white flex items-center justify-center font-bold">
                  K
                </div>
                <span className="font-bold text-md text-slate-900">Kollëré</span>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'vehicles', label: 'Véhicules', icon: Car },
                { id: 'drivers', label: 'Chauffeurs', icon: Users },
                { id: 'payments', label: 'Paiements', icon: Landmark },
                { id: 'courses', label: 'Courses', icon: Navigation },
                { id: 'revenus', label: 'Revenus', icon: TrendingUp },
                { id: 'stats', label: 'Statistiques', icon: Landmark },
                { id: 'alertes', label: 'Alertes', icon: AlertTriangle },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'settings', label: 'Paramètres', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#6D4AFF] text-white' 
                        : 'text-slate-600 hover:text-[#6D4AFF] hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen bg-[#F8FAFC]">
        
        {/* Top Header Bar */}
        <header className="h-16 px-6 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-[15px] font-extrabold text-slate-800 capitalize tracking-wide flex items-center gap-1.5">
              {activeTab === 'dashboard' ? 'Tableau de bord général' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Search Input (Global to page context) */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl py-1.5 pl-9 pr-4 text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/15 transition-all placeholder-slate-400"
              />
            </div>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    markAllNotificationsAsRead();
                  }
                }}
                className="w-9 h-9 rounded-xl border border-slate-200/60 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-40 overflow-hidden py-1 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Notifications</span>
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-[9px] font-bold text-[#6D4AFF] hover:text-[#5636E5] cursor-pointer"
                    >
                      Tout lire
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-3.5 text-xs transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-[#6D4AFF]/5' : ''}`}>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-bold text-slate-800">{notif.title}</span>
                          <span className="text-[9px] text-slate-400 font-medium font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">{notif.body}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-6 text-center text-[10px] text-slate-400 font-bold italic">
                        Aucune notification.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick action: Add Vehicle / Driver */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#6D4AFF] hover:bg-[#5636E5] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 hover:shadow-lg hover:shadow-[#6D4AFF]/20 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau</span>
            </button>

            {/* Driver portal quick link */}
            <button
              onClick={() => navigate('/driver/portal')}
              className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold hidden sm:block"
            >
              Portail Chauffeur 📱
            </button>

          </div>
        </header>

        {/* --- MAIN SCROLLABLE CONTAINER --- */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">

          {/* ----------------- TAB: GENERAL DASHBOARD ----------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Welcome Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/10">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900">Bienvenue sur votre espace Versé 👋</h2>
                  <p className="text-xs text-slate-500 font-semibold">Suivi de rentabilité, gestion de flotte et indicateurs clés en temps réel.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Flotte Connectée
                  </span>
                </div>
              </div>

              {/* 2. ZONE DE RÉSUMÉ (6 Cards) */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { title: 'Véhicules', value: vehicles.length, desc: 'Actifs en flotte', icon: Car, color: 'text-indigo-600 bg-indigo-50 border-indigo-100/50' },
                  { title: 'Chauffeurs', value: drivers.filter(d => d.status === 'active').length, desc: 'En ligne', icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50' },
                  { title: 'Gains (Jour)', value: `${earningsToday.toLocaleString()} F`, desc: 'Dépôts approuvés', icon: DollarSign, color: 'text-purple-600 bg-purple-50 border-purple-100/50' },
                  { title: 'Gains (Mois)', value: `${earningsMonth.toLocaleString()} F`, desc: 'Dépôts mensuels', icon: Landmark, color: 'text-blue-600 bg-blue-50 border-blue-100/50' },
                  { title: 'Courses', value: mockCourses.length, desc: 'Déclarées aujourd\'hui', icon: Navigation, color: 'text-amber-600 bg-amber-50 border-amber-100/50' },
                  { title: 'Rentabilité', value: `${profitabilityRate}%`, desc: 'Bénéfice net', icon: TrendingUp, color: 'text-rose-600 bg-rose-50 border-rose-100/50' },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32 group">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{kpi.title}</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="space-y-0.5 mt-2">
                        <span className="text-lg font-black text-slate-900 tracking-tight font-mono block group-hover:text-[#6D4AFF] transition-colors">{kpi.value}</span>
                        <span className="text-[8.5px] text-slate-400 font-bold tracking-wide block truncate">{kpi.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. GRAPHIQUES & LEADERBOARD GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution curve (Line Chart) */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Évolution Mensuelle des Revenus</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Analyse comparative du chiffre d'affaires cumulé.</p>
                    </div>
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200/30 px-2 py-0.5 rounded font-bold font-mono">2026</span>
                  </div>
                  <div className="h-56">
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </div>

                {/* Top 3 Drivers Leaderboard */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">🏆 Classement Chauffeurs</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Calculé selon les versements, la sécurité et le respect.</p>
                    </div>
                    <span className="text-[9px] bg-[#6D4AFF]/10 text-[#6D4AFF] px-2 py-0.5 rounded font-black uppercase">Top 3</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {leaderboard.map((driver, index) => {
                      const badges = [
                        { rank: '🥇 1er', style: 'bg-amber-100/60 border border-amber-200 text-amber-600 font-extrabold' },
                        { rank: '🥈 2e', style: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold' },
                        { rank: '🥉 3e', style: 'bg-amber-50 text-amber-700 border border-amber-200/50 font-semibold' }
                      ];
                      const badge = badges[index] || { rank: '•', style: 'bg-slate-50 text-slate-400' };
                      
                      return (
                        <div key={driver.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] px-2 py-1 rounded-lg ${badge.style}`}>{badge.rank}</span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 leading-tight">{driver.name}</h4>
                              <span className="text-[8.5px] text-slate-400 font-bold block">
                                Plaque : <strong className="text-slate-600">{driver.vehiclePlate}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-xs font-extrabold font-mono text-[#6D4AFF] block">{driver.score} pts</span>
                            <span className="text-[8.5px] text-emerald-600 font-bold block">{driver.complianceRate}% Respect</span>
                          </div>
                        </div>
                      );
                    })}

                    {drivers.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400 italic">
                        Aucun chauffeur enregistré pour le moment.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Console d'approbation des reçus (Paiements en attente) */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Console d'Approbation des Versements</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Validez ou rejetez les versements et relevés de kilométrages reçus.</p>
                  </div>
                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-mono font-bold">
                    {payments.filter(p => p.status === 'pending').length} En attente
                  </span>
                </div>

                {payments.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-bold">Tous les versements du jour sont validés !</p>
                    <p className="text-[9.5px] text-slate-400 mt-1">Les relevés des chauffeurs apparaîtront instantanément.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payments.filter(p => p.status === 'pending').map((pay) => {
                      const v = vehicles.find(veh => veh.id === pay.vehicle_id);
                      return (
                        <div key={pay.id} className="border border-slate-100 p-4 rounded-xl flex flex-col justify-between gap-4 bg-slate-50/40 hover:bg-white hover:shadow-sm transition-all duration-300">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-800">{pay.driver_name}</span>
                              <span className="text-[9px] font-mono bg-white border border-slate-100 text-[#6D4AFF] px-2 py-0.5 rounded font-extrabold">{v ? v.license_plate : 'N/A'}</span>
                            </div>

                            <div className="text-[10px] text-slate-500 space-y-1 font-semibold">
                              <div className="flex justify-between">
                                <span>Versement :</span>
                                <strong className="text-emerald-600 font-mono font-bold">{pay.amount.toLocaleString()} FCFA</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Réf transaction :</span>
                                <span className="font-mono text-slate-700 bg-white border border-slate-100 px-1 py-0.5 rounded">{pay.transaction_reference}</span>
                              </div>
                              {pay.odometer && (
                                <div className="flex justify-between">
                                  <span>Km déclaré :</span>
                                  <span className="text-slate-800 font-mono">{pay.odometer} km <span className="text-[9px] text-slate-400">(précédent : {v?.current_mileage})</span></span>
                                </div>
                              )}
                              <p className="text-[9px] text-slate-400 mt-2 italic">Soumis le {pay.submitted_at}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button 
                              onClick={() => setSelectedReceipt(pay)}
                              className="text-[9.5px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex-1"
                            >
                              Voir Reçu
                            </button>
                            <button 
                              onClick={() => handleApprovePayment(pay.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer flex-1"
                            >
                              Approuver
                            </button>
                            <button 
                              onClick={() => handleRejectPayment(pay.id)}
                              className="bg-red-500/10 hover:bg-red-650 border border-red-500/20 text-red-500 hover:text-white px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer flex-1"
                            >
                              Rejeter
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ----------------- TAB: VÉHICULES ----------------- */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-slate-900">Registre des Véhicules</h2>
                  <p className="text-xs text-slate-500 font-semibold">Suivi d'état, kilomètres et rappels de maintenance pour chaque actif.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#6D4AFF] hover:bg-[#5636E5] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter Véhicule & Chauffeur</span>
                </button>
              </div>

              {/* Vehicles Table (Premium UI) */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3.5 px-4 whitespace-nowrap">Modèle</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Chauffeur</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Index Odomètre</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Prochaine Vidange</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Statut Flotte</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredVehicles.map((v) => {
                        const driver = drivers.find(d => d.vehicle_id === v.id);
                        const oilStatus = getOilChangeStatus(v);
                        
                        // Status mapping
                        let statusText = 'En ligne';
                        let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                        if (v.status === 'maintenance') {
                          statusText = 'Maintenance';
                          statusColor = 'text-amber-700 bg-amber-50 border-amber-100';
                        } else if (!driver) {
                          statusText = 'Hors ligne';
                          statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
                        } else if (v.status === 'inactive') {
                          statusText = 'Inactif';
                          statusColor = 'text-red-700 bg-red-50 border-red-150';
                        }

                        // Simulated vehicle model image matching
                        return (
                          <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Photo, Model & License plate */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#6D4AFF]/8 border border-[#6D4AFF]/10 flex items-center justify-center shrink-0">
                                  <Car className="w-5 h-5 text-[#6D4AFF]" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-850">{v.brand_model}</div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[9px] font-extrabold font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                      {v.license_plate}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">Année {v.year || '2022'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Assigned Driver details */}
                            <td className="py-4 px-4">
                              {driver ? (
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-800">{driver.name}</div>
                                  <div className="flex items-center gap-2 text-[9px] font-mono font-bold">
                                    <a href={`tel:${driver.phone}`} className="text-slate-500 hover:text-[#6D4AFF] flex items-center gap-0.5">
                                      <Phone className="w-2.5 h-2.5" />
                                      {driver.phone}
                                    </a>
                                    <a href={`https://wa.me/221${driver.phone}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600">
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-red-500/80 bg-red-50/50 border border-red-100 px-2 py-0.5 rounded font-bold italic">
                                  Chauffeur non assigné
                                </span>
                              )}
                            </td>

                            {/* Mileage current */}
                            <td className="py-4 px-4 font-mono font-extrabold text-slate-800">
                              {v.current_mileage.toLocaleString()} km
                              {v.pending_mileage && (
                                <span className="text-[9px] font-sans block mt-0.5 text-amber-500 font-bold">
                                  ⏳ En cours : {v.pending_mileage} km
                                </span>
                              )}
                            </td>

                            {/* Oil change progress bar */}
                            <td className="py-4 px-4">
                              <div className="space-y-1 max-w-[130px]">
                                <div className="flex justify-between text-[9px] font-mono font-bold">
                                  <span className="text-slate-400">Vidange dans</span>
                                  <span className={oilStatus.urgent ? 'text-red-500 font-extrabold' : 'text-slate-500'}>
                                    {oilStatus.remaining} km
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 border border-slate-200/40 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-1.5 rounded-full ${oilStatus.barColor}`} 
                                    style={{ width: `${Math.min(oilStatus.percentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            {/* Status badge */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[9.5px] font-extrabold border ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>

                            {/* Actions delete */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <button 
                                onClick={() => {
                                  if (confirm(`Voulez-vous vraiment désactiver le véhicule ${v.brand_model} (${v.license_plate}) ?`)) {
                                    handleDeleteVehicle(v.id);
                                  }
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-red-200/30 transition-all cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredVehicles.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-bold italic bg-slate-50/25">
                            Aucun véhicule correspondant trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: CHAUFFEURS ----------------- */}
          {activeTab === 'drivers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-slate-900">Registre des Chauffeurs</h2>
                  <p className="text-xs text-slate-500 font-semibold">Gérez les comptes d'accès, suivez le respect des versements et visualisez l'activité.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#6D4AFF] hover:bg-[#5636E5] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enrôler Nouveau Chauffeur</span>
                </button>
              </div>

              {/* Drivers Table (Premium UI) */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3.5 px-4 whitespace-nowrap">Nom / Contact</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Véhicule Assigné</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Gains Cumulés (Mois)</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Lien Magique</th>
                        <th className="py-3.5 px-4 whitespace-nowrap text-center">Versement Aujourd'hui</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Respect</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredDrivers.map((d) => {
                        const v = vehicles.find(veh => veh.id === d.vehicle_id);
                        
                        // Calculate compliance rate
                        const dPayments = payments.filter(p => p.driver_name === d.name);
                        const dApproved = dPayments.filter(p => p.status === 'approved');
                        const totalSubs = dPayments.length;
                        const complianceRate = totalSubs > 0 ? Math.round((dApproved.length / totalSubs) * 100) : 100;
                        
                        // Monthly revenues
                        const dMonthRev = dApproved
                          .filter(p => p.date.startsWith(currentMonthPrefix))
                          .reduce((sum, p) => sum + p.amount, 0);

                        // Verification payment state for today
                        const isPaid = d.paid_today !== undefined ? d.paid_today : dApproved.filter(p => p.date === todayStr).length > 0;
                        
                        // Avatar color index
                        const isMoussa = d.name.toLowerCase().includes('moussa');
                        const isAmadou = d.name.toLowerCase().includes('amadou');
                        const avatarBg = isMoussa ? 'bg-indigo-50 text-indigo-700' : isAmadou ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700';

                        return (
                          <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Profile details */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center border border-slate-100 ${avatarBg}`}>
                                  {d.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-850">{d.name}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono text-slate-500 font-bold">
                                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{d.phone}</span>
                                    <a href={`https://wa.me/221${d.phone}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600">
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* License plate */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              {v ? (
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-extrabold font-mono bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 text-[#6D4AFF] px-2 py-0.5 rounded">
                                    {v.license_plate}
                                  </span>
                                  <span className="text-[9px] text-slate-400 block font-semibold">{v.brand_model}</span>
                                </div>
                              ) : (
                                <span className="text-red-500 italic text-[10px] font-semibold bg-red-50 px-2 py-0.5 rounded">Aucun véhicule</span>
                              )}
                            </td>

                            {/* Cumulative revenue */}
                            <td className="py-4 px-4 font-mono font-extrabold text-slate-800">
                              {dMonthRev.toLocaleString()} F
                            </td>

                            {/* Magic link token management */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => {
                                    const linkVal = d.magic_token || d.id;
                                    const magicLink = window.location.origin + `/driver/login?token=${linkVal}`;
                                    navigator.clipboard.writeText(magicLink).then(() => {
                                      triggerNotification("Lien magique copié", `Lien de connexion pour ${d.name} sauvegardé.`);
                                    });
                                  }}
                                  className="bg-[#6D4AFF]/10 hover:bg-[#6D4AFF]/20 text-[#6D4AFF] text-[9.5px] font-extrabold px-3 py-1.5 rounded-lg border border-[#6D4AFF]/20 transition-all cursor-pointer"
                                >
                                  Copier Lien
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`Voulez-vous réinitialiser le lien d'accès pour ${d.name} ? L'ancien lien cessera d'être valide.`)) {
                                      handleRegenerateMagicToken(d.id);
                                    }
                                  }}
                                  className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-500 text-[9.5px] font-bold px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                                  title="Générer un nouveau jeton"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Today's paid status toggle */}
                            <td className="py-4 px-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleTogglePaymentStatus(d.id)}
                                className={`inline-block px-3 py-1.5 rounded-lg text-[9px] font-extrabold border transition-all cursor-pointer ${
                                  isPaid 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                                    : 'bg-red-50 text-red-600 border-red-200/60 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                                }`}
                              >
                                {isPaid ? '✔️ Payé' : '❌ Non reçu'}
                              </button>
                            </td>

                            {/* Compliance score */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[10px] font-extrabold border ${
                                complianceRate >= 90 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                  : complianceRate >= 70 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-600 border-red-200'
                              }`}>
                                {complianceRate}%
                              </span>
                            </td>

                            {/* Deactivate button */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <button 
                                onClick={() => {
                                  if (confirm(`Désactiver le chauffeur ${d.name} ?`)) {
                                    handleDeleteDriver(d.id);
                                  }
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-red-200/30 transition-all cursor-pointer"
                              >
                                Désactiver
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredDrivers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-bold italic bg-slate-50/25">
                            Aucun chauffeur correspondant trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: PAIEMENTS ----------------- */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">Registre des Paiements</h2>
                  <p className="text-xs text-slate-500 font-semibold">Historique comptable global des versements par Wave, Orange Money et espèces.</p>
                </div>

                <div className="flex gap-2">
                  {['all', 'approved', 'pending', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setPaymentFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        paymentFilter === status 
                          ? 'bg-[#6D4AFF] border-[#6D4AFF] text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'all' ? 'Tous' : status === 'approved' ? 'Validés' : status === 'pending' ? 'En attente' : 'Rejetés'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payments History Table */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3.5 px-4 whitespace-nowrap">Chauffeur</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Montant</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Date & Heure</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Méthode</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Référence Unique</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Statut</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredPayments.map((p) => {
                        // Dynamically assign methods for visuals based on refs
                        const isWave = p.transaction_reference.startsWith('WAVE');
                        const isOM = p.transaction_reference.startsWith('OM') || p.transaction_reference.includes('ORANGE');
                        const method = isWave ? 'Wave' : isOM ? 'Orange Money' : 'Carte Bancaire';
                        const methodColor = isWave ? 'bg-blue-50 text-blue-600 border-blue-100' : isOM ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-700 border-slate-200';

                        let statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                        let statusText = 'Approuvé';
                        if (p.status === 'pending') {
                          statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          statusText = 'En attente';
                        } else if (p.status === 'rejected') {
                          statusColor = 'bg-red-50 text-red-650 border-red-100';
                          statusText = 'Rejeté';
                        }

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">{p.driver_name}</td>
                            <td className="py-4 px-4 font-mono font-extrabold text-slate-900">{p.amount.toLocaleString()} FCFA</td>
                            <td className="py-4 px-4 text-slate-500 font-semibold">{p.submitted_at || p.date}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[9px] font-extrabold border ${methodColor}`}>
                                {method}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-slate-650">{p.transaction_reference}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[9.5px] font-extrabold border ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setSelectedReceipt(p)}
                                className="text-[10px] font-bold text-[#6D4AFF] hover:text-[#5636E5] bg-white border border-[#6D4AFF]/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                              >
                                Reçu
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPayments.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-bold italic bg-slate-50/25">
                            Aucun paiement enregistré pour cette recherche/filtre.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: COURSES ----------------- */}
          {activeTab === 'courses' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Registre des Courses & Activités</h2>
                <p className="text-xs text-slate-500 font-semibold">Consultez les trajets déclarés par les chauffeurs sur les plateformes VTC associées.</p>
              </div>

              {/* Courses Table */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3.5 px-4 whitespace-nowrap">Chauffeur</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Trajet</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Date / Heure</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Montant Estimé</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Plateforme VTC</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Statut Course</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {mockCourses.map((c) => {
                        const platColor = c.platform === 'Uber' ? 'bg-slate-900 text-white border-slate-950' : c.platform === 'Yango' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100';

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{c.driver}</div>
                              <span className="text-[9px] font-mono text-slate-400 font-bold block mt-0.5">{c.vehicle}</span>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {c.route}
                            </td>
                            <td className="py-4 px-4 text-slate-500 font-semibold">{c.date} à {c.time}</td>
                            <td className="py-4 px-4 font-mono font-extrabold text-[#6D4AFF]">{c.amount.toLocaleString()} F</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[9px] font-extrabold border ${platColor}`}>
                                {c.platform}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Terminé
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: REVENUS (COMPTABILITÉ) ----------------- */}
          {activeTab === 'revenus' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Suivi des Revenus & Dépenses</h2>
                <p className="text-xs text-slate-500 font-semibold">Bilan financier complet. Rapprochez les gains bruts et les frais de vidange/réparation.</p>
              </div>

              {/* Summary of revenue and expenses */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Gains Réels Bruts</span>
                  <span className="text-xl font-black text-slate-900 font-mono block">{totalEarnings.toLocaleString()} FCFA</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-3 flex items-center gap-1 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    Revenus vérifiés Wave/OM
                  </span>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Frais de Maintenance</span>
                  <span className="text-xl font-black text-slate-900 font-mono block">{totalSpend.toLocaleString()} FCFA</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-3 flex items-center gap-1 text-red-500">
                    <ArrowDownRight className="w-4 h-4" />
                    Maintenance et dépenses
                  </span>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Bénéfice Net</span>
                  <span className="text-xl font-black text-[#6D4AFF] font-mono block">{netProfit.toLocaleString()} FCFA</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-3 flex items-center gap-1 text-indigo-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Solde caisse disponible
                  </span>
                </div>
              </div>

              {/* Maintenance costs list */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800">Registre des frais et réparations</h3>
                  <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded font-extrabold font-mono">Dépenses déclarées</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-2.5 px-4 whitespace-nowrap">ID Véhicule</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Type d'Entretien</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Kilométrage</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Date d'intervention</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Description</th>
                        <th className="py-2.5 px-4 text-right whitespace-nowrap">Coût</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {maintenances.map((m) => {
                        const v = vehicles.find(veh => veh.id === m.vehicle_id);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#6D4AFF]">{v ? v.license_plate : m.vehicle_id}</td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-block px-2.5 py-0.5 rounded-xl text-[9px] font-extrabold border bg-slate-100 text-slate-700 border-slate-200">
                                {m.type === 'oil_change' ? 'Vidange moteur' : 'Freins & Plaquettes'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono">{m.mileage_at_maintenance.toLocaleString()} km</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-500">{m.maintenance_date}</td>
                            <td className="py-3.5 px-4 text-slate-500 font-medium">{m.description}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-extrabold text-red-500">-{m.cost.toLocaleString()} F</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: STATISTIQUES (ANALYTICS) ----------------- */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Analyses Statistiques Flotte</h2>
                <p className="text-xs text-slate-500 font-semibold">Visualisez la répartition de votre activité et les performances financières cumulées.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Driver Revenue Comparison */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-800">Comparaison des Chauffeurs</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Revenus cumulés déclarés et validés par chauffeur.</p>
                  </div>
                  <div className="h-56">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>

                {/* Vehicle Distribution */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-800">Répartition des Véhicules</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Statuts opérationnels actuels de la flotte de taxis.</p>
                  </div>
                  <div className="h-56">
                    <Doughnut data={donutChartData} options={donutChartOptions} />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------- TAB: ALERTES & INCIDENTS ----------------- */}
          {activeTab === 'alertes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">Registre des Incidents & Alertes</h2>
                  <p className="text-xs text-slate-500 font-semibold">Visualisez et résolvez les pannes, pépins policiers ou accidents déclarés par les chauffeurs.</p>
                </div>

                <div className="flex gap-2">
                  {['all', 'pending', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setIncidentFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        incidentFilter === status 
                          ? 'bg-[#6D4AFF] border-[#6D4AFF] text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'all' ? 'Tous' : status === 'pending' ? 'Actifs' : 'Résolus'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incidents table */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3.5 px-4 whitespace-nowrap">Chauffeur</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Catégorie</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Description</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Date d'incident</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Statut</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredIncidents.map((i) => {
                        const typeLabels = {
                          police: 'Police / Contrôle',
                          accident: 'Accident routier',
                          engine: 'Panne mécanique / Moteur',
                          late: 'Retard de versement'
                        };
                        const typeColors = {
                          police: 'bg-indigo-50 text-indigo-700 border-indigo-150',
                          accident: 'bg-red-50 text-red-600 border-red-150',
                          engine: 'bg-orange-50 text-orange-700 border-orange-150',
                          late: 'bg-amber-50 text-amber-700 border-amber-150'
                        };

                        const label = typeLabels[i.type] || i.type;
                        const badgeColor = typeColors[i.type] || 'bg-slate-100 text-slate-700 border-slate-200';

                        const isPending = i.status === 'pending';

                        return (
                          <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">{i.driver_name}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[9px] font-extrabold border ${badgeColor}`}>
                                {label}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-650 max-w-[250px] truncate" title={i.description}>
                              {i.description}
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-500">{i.date}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                                isPending 
                                  ? 'bg-red-100 text-red-600 border border-red-200' 
                                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {isPending ? 'Actif' : 'Résolu'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              {isPending ? (
                                <button
                                  onClick={() => handleResolveIncident(i.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-600 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                                >
                                  Marquer Résolu
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold italic">Aucune action</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredIncidents.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-bold italic bg-slate-50/25">
                            Aucun incident signalé à afficher.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: DOCUMENTS ----------------- */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-slate-900">Portefeuille de Documents</h2>
                  <p className="text-xs text-slate-500 font-semibold">Pièces administratives de chaque véhicule — assurance, carte grise, licence VTC, visite technique.</p>
                </div>
                <div className="flex items-center gap-2">
                  {documents.filter(d => !getDocStatus(d.expiry).isValid).length > 0 && (
                    <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9.5px] font-extrabold px-3 py-1.5 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {documents.filter(d => !getDocStatus(d.expiry).isValid).length} document(s) à renouveler
                    </span>
                  )}
                </div>
              </div>

              {/* Un bloc par véhicule */}
              <div className="space-y-6">
                {vehicles.map((v) => {
                  const vehicleDocs = documents.filter(d => d.vehicle_id === v.id);
                  const driver = drivers.find(d => d.id === v.driver_id);
                  const hasAlert = vehicleDocs.some(d => !getDocStatus(d.expiry).isValid);

                  return (
                    <div key={v.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${hasAlert ? 'border-amber-200' : 'border-slate-100'}`}>
                      {/* En-tête véhicule */}
                      <div className={`px-5 py-3.5 flex justify-between items-center border-b ${hasAlert ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/70 border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#6D4AFF]/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#6D4AFF]" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900">{v.brand_model}</span>
                            <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded ml-2">{v.license_plate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {driver && (
                            <span className="text-[9.5px] text-slate-500 font-semibold">{driver.name}</span>
                          )}
                          {hasAlert && (
                            <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Attention
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Grille des 4 documents */}
                      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
                        {vehicleDocs.map((doc) => {
                          const { label: docLabel, isExpired, isExpiring, isValid, daysLeft } = getDocStatus(doc.expiry);
                          const isUrgent = !isValid;

                          return (
                            <div key={doc.id} className={`p-4 flex flex-col gap-3 ${isExpiring || isExpired ? 'bg-amber-50/30' : ''}`}>
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-1">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase ${
                                    isExpired  ? 'bg-red-100 text-red-600 border border-red-200' :
                                    isExpiring ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  }`}>
                                    {isExpired ? '✕ Expiré' : isExpiring ? '⚠ Bientôt' : '✓ Valide'}
                                  </span>
                                </div>
                                <h5 className="text-[10.5px] font-bold text-slate-800 leading-tight">{doc.type}</h5>
                                <p className="text-[9px] text-slate-400 font-mono">{doc.file}</p>
                              </div>

                              <div className="mt-auto space-y-2">
                                <div className={`text-[9px] font-bold flex items-center gap-1 ${isUrgent ? 'text-amber-600' : 'text-slate-500'}`}>
                                  <span>Expire :</span>
                                  <span className="font-mono">{doc.expiry}</span>
                                </div>
                                {isUrgent && (
                                  <div className={`text-[8.5px] font-bold ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                                    {isExpired ? `Expiré depuis ${Math.abs(daysLeft)} j` : `J-${daysLeft} jours`}
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDownloadDocPdf({ ...doc, vehicle: v.license_plate })}
                                  className="w-full bg-slate-50 hover:bg-[#6D4AFF] hover:text-white text-slate-600 text-[8.5px] font-bold py-1 rounded-lg border border-slate-200 hover:border-[#6D4AFF] transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  Télécharger
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {vehicleDocs.length === 0 && (
                          <div className="col-span-4 py-8 text-center text-xs text-slate-400 font-bold italic">
                            Aucun document enregistré pour ce véhicule.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- TAB: PARAMÈTRES ----------------- */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div>
                <h2 className="text-base font-black text-slate-900">Paramètres Flotte</h2>
                <p className="text-xs text-slate-500 font-semibold">Configurez le nom de votre flotte et vos préférences de relance WhatsApp.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Fleet details configuration */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Nom de la Flotte</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={fleetName} 
                      onChange={(e) => setFleetName(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#6D4AFF] focus:bg-white"
                    />
                    <button 
                      onClick={() => {
                        const ownerProfile = localStorage.getItem('verse_owner_profile') || '{}';
                        const parsed = JSON.parse(ownerProfile);
                        parsed.fleetName = fleetName;
                        localStorage.setItem('verse_owner_profile', JSON.stringify(parsed));
                        triggerNotification("Paramètres sauvegardés", "Le nom de la flotte a été mis à jour.");
                      }}
                      className="bg-[#6D4AFF] hover:bg-[#5636E5] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>

                {/* Subscriptions info */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Abonnement SaaS Versé</h4>
                  
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold block uppercase">Formule Professionnelle</span>
                      <strong className="text-xs font-bold text-slate-800 block">Facturation Mensuelle</strong>
                      <span className="text-[10px] text-slate-500 font-semibold block">Prochain prélèvement automatique le 2026-07-01</span>
                    </div>

                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                      Abonnement Actif
                    </span>
                  </div>
                </div>

                {/* Task Engine and config reminders */}
                <div className="border-t border-slate-100 pt-5 space-y-2 text-xs text-slate-500">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Automatisation WhatsApp</h4>
                  <p className="font-semibold">Le script d'automatisation <strong className="text-[#6D4AFF]">relance_vtc.py</strong> est planifié pour s'exécuter à 22h00.</p>
                  <p className="font-semibold">En cas de non-déclaration, une relance WhatsApp ferme est transmise à chaque chauffeur inactif.</p>
                </div>

              </div>
            </div>
          )}

        </main>
        
        {/* Footer info */}
        <footer className="py-6 border-t border-slate-100 bg-white text-center text-[10px] text-slate-400 font-bold mt-auto">
          &copy; 2026 Kollëré SaaS Fleet Management. Dakar, Sénégal.
        </footer>

      </div>

      {/* --- POPUPS & MODALS --- */}
      <ReceiptModal 
        selectedReceipt={selectedReceipt} 
        setSelectedReceipt={() => setSelectedReceipt(null)} 
      />

      <AddVehicleModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddVehicleAndDriver} 
      />

    </div>
  );
}
