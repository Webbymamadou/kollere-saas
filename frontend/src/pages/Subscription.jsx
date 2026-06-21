import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, Clock, Star, Shield, Zap, Users, Truck, Smartphone, CreditCard, Copy, CheckCircle2, ArrowLeft, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function Subscription() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [plan, setPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, verified
  const [copied, setCopied] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const merchantPhone = '770778341';

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const features = [
    { text: 'Gestion illimitée de véhicules', included: true },
    { text: 'Gestion illimitée de chauffeurs', included: true },
    { text: 'Suivi des versements en temps réel', included: true },
    { text: 'Maintenance et notifications', included: true },
    { text: 'Application mobile pour chauffeurs', included: true },
    { text: 'Rapports financiers détaillés', included: true },
    { text: 'Support client 24/7', included: true },
    { text: 'Sauvegarde cloud automatique', included: true }
  ];

  const paymentMethods = [
    { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', textColor: 'text-white' },
    { id: 'wave', name: 'Wave', color: 'bg-blue-600', textColor: 'text-white' },
    { id: 'moov', name: 'Moov Money', color: 'bg-green-600', textColor: 'text-white' },
    { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500', textColor: 'text-black' }
  ];

  const price = plan === 'monthly' ? 9900 : 95040;

  const startFreeTrial = async () => {
    try {
      const data = await apiService.getMe();
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const data = await apiService.createSubscriptionPayment(plan, paymentMethod);
      setCurrentPayment(data.payment);
      setShowPaymentModal(true);
      setPaymentStatus('pending');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(merchantPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const simulatePaymentVerification = async () => {
    setPaymentStatus('verified');
    // Wait a bit then redirect
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowPaymentModal(false);
    setLoading(false);
    // Refresh user data to check subscription status
    try {
      const data = await apiService.getMe();
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // If user has active subscription, show success screen
  if (user && user.subscription_status === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Abonnement actif ! 🎉</h1>
            <p className="text-slate-600 text-sm font-medium">Votre accès à Verse est activé et prêt à l'emploi.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-sm py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#6D4AFF]/20 active:scale-98"
          >
            Accéder au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top section */}
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 text-white p-6 pb-12 border-b border-indigo-700">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Verse</h1>
                <p className="text-xs text-indigo-200 font-semibold">Gestion de flotte VTC</p>
              </div>
            </div>
            <div className="w-24"></div>
          </div>

          {/* Trial info or welcome */}
          {user && user.subscription_status === 'trial' && user.days_left_on_trial > 0 ? (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-300" />
                <h2 className="font-bold text-sm">Essai gratuit de 7 jours</h2>
              </div>
              <p className="text-xs text-indigo-100 font-medium mb-3">
                Il vous reste {user.days_left_on_trial} {user.days_left_on_trial === 1 ? 'jour' : 'jours'} pour découvrir toutes les fonctionnalités gratuitement.
              </p>
              {user.days_left_on_trial > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${(user.days_left_on_trial / 7) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-amber-300 font-mono">{user.days_left_on_trial}/7</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <h2 className="font-bold text-sm">Bienvenue !</h2>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                Choisissez votre abonnement ou commencez votre essai gratuit de 7 jours.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing section */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Choisissez votre abonnement</h3>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPlan('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${plan === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setPlan('yearly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${plan === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Annuel
                  <span className="ml-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-[9px] font-black">-20%</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Price */}
            <div className="text-center space-y-1">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-black text-slate-900">
                  {plan === 'monthly' ? '9,900' : '95,040'}
                </span>
                <span className="text-lg text-slate-600 font-bold">FCFA</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {plan === 'monthly' ? 'par mois' : 'par an (2 mois gratuits!)'}
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ce qui est inclus</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs text-slate-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* If not in trial, show start trial button */}
              {!user || (user.subscription_status !== 'trial' && user.subscription_status !== 'active') ? (
                <button
                  onClick={startFreeTrial}
                  className="w-full bg-white border-2 border-[#6D4AFF] text-[#6D4AFF] hover:bg-indigo-50 font-black text-sm py-4.5 rounded-2xl transition-all cursor-pointer active:scale-98"
                >
                  Commencer l'essai gratuit de 7 jours
                </button>
              ) : (
                // If in trial and days left, show continue button
                user && user.days_left_on_trial > 0 && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm py-4.5 rounded-2xl transition-all cursor-pointer active:scale-98"
                  >
                    Continuer l'essai gratuit
                  </button>
                )
              )}

              {/* Subscribe button always visible */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-black text-sm py-4.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#6D4AFF]/20 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement en cours...
                  </span>
                ) : (
                  'S\'abonner maintenant'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {paymentStatus === 'pending' ? (
              <>
                <div className="bg-gradient-to-r from-[#6D4AFF] to-indigo-700 p-6 text-white">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="mb-4 flex items-center gap-2 text-sm font-bold opacity-90 hover:opacity-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                  <h2 className="text-xl font-black">Paiement mobile</h2>
                  <p className="text-indigo-100 text-sm font-medium mt-1">Choisissez votre méthode de paiement</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'border-[#6D4AFF] bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className={`w-10 h-10 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                          <Smartphone className={`w-5 h-5 ${method.textColor}`} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">{method.name}</p>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-600">Montant à payer</span>
                      <span className="text-2xl font-black text-slate-900">{price} FCFA</span>
                    </div>
                    <div className="h-px bg-slate-200"></div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500">Instructions :</p>
                      <ol className="text-xs text-slate-600 space-y-2">
                        <li className="flex gap-2">
                          <span className="w-5 h-5 bg-[#6D4AFF] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">1</span>
                          Ouvrez votre application de paiement mobile
                        </li>
                        <li className="flex gap-2">
                          <span className="w-5 h-5 bg-[#6D4AFF] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">2</span>
                          Transférez <span className="font-bold text-slate-900">{price} FCFA</span> au numéro :
                        </li>
                      </ol>
                      <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{merchantPhone}</span>
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center gap-1 text-xs font-bold text-[#6D4AFF] hover:text-[#5636E5]"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copié !' : 'Copier'}
                        </button>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center pt-2">
                        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                          <QRCodeSVG
                            value={`${paymentMethod}:${merchantPhone}?amount=${price}`}
                            size={150}
                            level="H"
                            fgColor="#4C1D95"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Scanner le QR Code</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={simulatePaymentVerification}
                    className="w-full bg-gradient-to-r from-[#6D4AFF] to-indigo-700 hover:from-[#5636E5] hover:to-indigo-800 text-white font-black py-4 rounded-2xl transition-all cursor-pointer active:scale-98"
                  >
                    J'ai effectué le paiement
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Paiement vérifié !</h3>
                  <p className="text-sm text-slate-600 font-medium">Votre abonnement est maintenant activé. Redirection en cours...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
