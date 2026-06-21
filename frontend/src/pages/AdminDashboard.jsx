import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CreditCard, CheckCircle2, XCircle, Loader2, LogOut } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // We'll need to create these endpoints, but for now we can mock or just show structure
      const usersRes = await apiService.getMe();
      const paymentsRes = await apiService.getMySubscriptionPayments();
      // We'll update this when backend has proper admin endpoints
      setUsers([]);
      setPayments([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const approvePayment = async (paymentId) => {
    // Placeholder for when backend has this
    alert('Approve payment ' + paymentId);
  };

  const rejectPayment = async (paymentId) => {
    // Placeholder
    alert('Reject payment ' + paymentId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-2xl font-black">Admin Dashboard</h1>
                <p className="text-indigo-200 text-sm">Gestion des abonnements et paiements</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#6D4AFF]" />
              <h2 className="text-lg font-bold text-slate-900">Utilisateurs</h2>
            </div>
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Liste des utilisateurs à venir...</p>
            </div>
          </div>

          {/* Payments Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#6D4AFF]" />
              <h2 className="text-lg font-bold text-slate-900">Paiements en attente</h2>
            </div>
            <div className="text-center py-8 text-slate-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Liste des paiements à venir...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
