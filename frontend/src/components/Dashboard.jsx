import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  LogOut, 
  Plus, 
  Wallet, 
  Activity, 
  AlertTriangle, 
  Users, 
  DollarSign,
  CheckCircle2,
  XCircle,
  Bell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import AddVehicleModal from './AddVehicleModal';
import VehicleTable from './VehicleTable';
import DriverTable from './DriverTable';
import ReceiptModal from './ReceiptModal';
import MaintenanceModal from './MaintenanceModal';
import IncidentLog from './IncidentLog';
import { useVehicles, useDrivers, usePayments, useFinancialMetrics } from '../hooks/useApi';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Hooks API
  const { vehicles, loading: loadingVehicles, refetch: refetchVehicles } = useVehicles();
  const { drivers, loading: loadingDrivers, refetch: refetchDrivers } = useDrivers();
  const { payments, loading: loadingPayments, refetch: refetchPayments } = usePayments();
  const { metrics, loading: loadingMetrics, refetch: refetchMetrics } = useFinancialMetrics();
  
  // États locaux
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Déconnexion
  const handleLogout = () => {
    logout();
  };

  // Approuver un paiement
  const handleApprovePayment = async (paymentId) => {
    try {
      await apiService.approvePayment(paymentId);
      refetchPayments();
      refetchMetrics();
    } catch (error) {
      console.error('Erreur lors de l\'approbation du paiement:', error);
    }
  };

  // Rejeter un paiement
  const handleRejectPayment = async (paymentId) => {
    try {
      await apiService.rejectPayment(paymentId);
      refetchPayments();
      refetchMetrics();
    } catch (error) {
      console.error('Erreur lors du rejet du paiement:', error);
    }
  };

  // Ajouter un véhicule et un chauffeur
  const handleAddVehicleAndDriver = async (data) => {
    try {
      // Créer d'abord le véhicule
      const vehicle = await apiService.createVehicle({
        license_plate: data.plate,
        brand_model: data.model,
        current_mileage: data.mileage,
        last_oil_change_mileage: data.mileage,
        status: 'active'
      });
      
      // Puis créer le chauffeur avec l'ID du véhicule
      await apiService.createDriver({
        vehicle_id: vehicle.id,
        name: data.driverName,
        phone: data.driverPhone,
        pin_code: data.driverPin,
        status: 'active',
        magic_token: data.magicToken
      });
      
      // Rafraîchir les données
      refetchVehicles();
      refetchDrivers();
      refetchMetrics();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  // Obtenir l'état de vidange
  const getOilChangeStatus = (vehicle) => {
    const driven = vehicle.current_mileage - vehicle.last_oil_change_mileage;
    const percentage = (driven / 5000) * 100;
    const urgent = percentage >= 90;
    return { driven, percentage, urgent };
  };

  // Notifications (à implémenter via API)
  const notifications = [
    { type: 'warning', title: 'Vidange bientôt nécessaire', vehicle: 'DK-3421-A' },
    { type: 'info', title: 'Nouveau versement en attente', driver: 'Moussa Diop' }
  ];

  // Chargement
  if (loadingVehicles || loadingDrivers || loadingPayments || loadingMetrics) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Chargement de la flotte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Barre de navigation supérieure */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                <Car className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xs font-black text-white uppercase tracking-widest">Kollëré</h1>
                <p className="text-[10px] text-slate-500 font-semibold">Versé VTC Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all border border-white/5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown notifications */}
        {showNotifications && (
          <div className="absolute top-16 right-4 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 z-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Notifications</h3>
            <div className="space-y-2">
              {notifications.map((n, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                  <div>
                    <p className="text-xs font-semibold text-white">{n.title}</p>
                    <p className="text-[10px] text-slate-500">{n.vehicle || n.driver}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Section en-tête avec CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Tableau de bord</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Suivi en temps réel de votre flotte VTC</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowMaintenanceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Enregistrer maintenance
            </button>
            <button 
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              Valider versements
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ajouter véhicule
            </button>
          </div>
        </div>

        {/* Carte des métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Revenus du Jour</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {(metrics?.todayRevenue || 0).toLocaleString()} <span className="text-xs text-slate-400 font-sans">F</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-300 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>+12% vs hier</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Véhicules Actifs</span>
              <Car className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {metrics?.activeVehicles || 0}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-2">
              {vehicles.length} au total
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Chauffeurs en ligne</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {metrics?.activeDrivers || 0}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-2">
              {drivers.length} enregistrés
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Versements en attente</span>
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {metrics?.pendingPayments || 0}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-2">
              À valider manuellement
            </div>
          </div>
        </div>

        {/* Graphique des revenus et incident log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white">Évolution des revenus (7 jours)</h3>
              <div className="flex gap-2">
                <span className="text-[10px] bg-slate-950 px-2 py-1 rounded-full border border-white/5 text-slate-400 font-bold">Total: {(metrics?.totalRevenue || 0).toLocaleString()} F</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.revenueGraph || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${val/1000}k`}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    formatter={(val) => [`${Number(val).toLocaleString()} F`, 'Revenus']}
                  />
                  <Bar dataKey="amount" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1">
            <IncidentLog />
          </div>
        </div>

        {/* Tableaux des véhicules et chauffeurs */}
        <div className="space-y-6">
          <VehicleTable 
            vehicles={vehicles} 
            drivers={drivers} 
            getOilChangeStatus={getOilChangeStatus}
            onDeleteVehicle={(id) => {
              if (confirm('Supprimer ce véhicule ?')) {
                apiService.deleteVehicle(id).then(() => {
                  refetchVehicles();
                  refetchMetrics();
                });
              }
            }}
          />
          
          <DriverTable 
            drivers={drivers} 
            vehicles={vehicles} 
            payments={payments}
            onTogglePaymentStatus={(driverId) => {
              // Cette fonctionnalité sera implémentée via API
            }}
            onRegenerateMagicToken={(driverId) => {
              // Cette fonctionnalité sera implémentée via API
            }}
            onDeleteDriver={(id) => {
              if (confirm('Désactiver ce chauffeur ?')) {
                apiService.deleteDriver(id).then(() => {
                  refetchDrivers();
                  refetchMetrics();
                });
              }
            }}
          />
        </div>

      </main>

      {/* Modals */}
      {showAddModal && (
        <AddVehicleModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddVehicleAndDriver}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal 
          isOpen={showReceiptModal} 
          onClose={() => setShowReceiptModal(false)}
          payments={payments.filter(p => p.status === 'pending')}
          onApprove={handleApprovePayment}
          onReject={handleRejectPayment}
        />
      )}

      {showMaintenanceModal && (
        <MaintenanceModal 
          isOpen={showMaintenanceModal} 
          onClose={() => setShowMaintenanceModal(false)}
          vehicles={vehicles}
          onAdd={(data) => {
            apiService.createMaintenance(data).then(() => {
              refetchVehicles();
              refetchMetrics();
              setShowMaintenanceModal(false);
            });
          }}
        />
      )}
    </div>
  );
}
