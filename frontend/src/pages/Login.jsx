import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, LogIn, AlertCircle, UserPlus, ArrowLeft, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import taxiImage from '../assets/dakar_taxi_sunset.png';

export default function Login() {
  const [isRegister, setIsRegister] = useState(() => {
    const showRegister = localStorage.getItem('verse_show_register');
    if (showRegister) {
      localStorage.removeItem('verse_show_register');
      return true;
    }
    return false;
  });

  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, user, hasActiveAccess } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (hasActiveAccess) {
        navigate('/dashboard');
      } else {
        navigate('/subscription');
      }
    }
  }, [user, hasActiveAccess, navigate]);

  if (user) {
    return null;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      const hasAccess = res.user.has_active_access || res.user.subscription_status === 'active' || (res.user.subscription_status === 'trial' && res.user.days_left_on_trial > 0);
      if (hasAccess) {
        navigate('/dashboard');
      } else {
        navigate('/subscription');
      }
    } catch (err) {
      setShake(true);
      setError(err.message || 'Identifiants incorrects.');
      setTimeout(() => {
        setShake(false);
        setPassword('');
      }, 500);
      setTimeout(() => {
        setError('');
      }, 3000);
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !email || !password) {
      setError('Veuillez remplir tous les champs du formulaire.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, phone, password);
      const hasAccess = res.user.subscription_status === 'active' || (res.user.subscription_status === 'trial' && res.user.days_left_on_trial > 0);
      if (hasAccess) {
        navigate('/dashboard');
      } else {
        navigate('/subscription');
      }
    } catch (err) {
      setShake(true);
      setError(err.message || "Erreur lors de l'inscription.");
      setTimeout(() => {
        setShake(false);
      }, 500);
      setTimeout(() => {
        setError('');
      }, 3000);
      setLoading(false);
    }
  };
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center p-2 sm:p-4 font-sans">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shake-element {
          animation: shake 0.4s ease-in-out;
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 flex items-center gap-1.5 text-slate-600 hover:text-[#6D4AFF] transition-colors z-50 text-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold">Retour</span>
      </button>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto grid lg:grid-cols-12 gap-4 lg:gap-6 items-stretch max-h-[92vh]">

        {/* Left Side - Hero */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between text-white relative overflow-hidden rounded-2xl shadow-xl max-h-[500px] p-5 fade-in-up">
          {/* Background image & gradient overlay */}
          <img 
            src={taxiImage} 
            alt="Dakar Taxi Sunset" 
            className="w-full h-full object-cover absolute inset-0 z-0" 
          />
          <div className="bg-gradient-to-t from-slate-950 via-indigo-950/85 to-indigo-900/60 absolute inset-0 z-10"></div>
          
          <div className="relative z-20 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 backdrop-blur-md">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider">Verse</h2>
                <p className="text-[9px] text-slate-305 font-semibold">Gestion de flotte VTC</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl lg:text-2xl font-extrabold text-white leading-tight">
                Bienvenue dans <span className="text-amber-400">l'avenir</span> de la gestion
              </h1>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Gérez en temps réel vos véhicules, chauffeurs et revenus.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/40 border border-white/10 backdrop-blur-md p-2 rounded-xl">
              {[
                { num: '50+', label: 'Propriétaires' },
                { num: '200+', label: 'Véhicules' },
                { num: '99%', label: 'Satisfaction' },
                { num: '24/7', label: 'Support' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-1.5 rounded-lg text-center">
                  <p className="text-base font-black text-amber-400">{stat.num}</p>
                  <p className="text-[8px] text-slate-300 font-semibold tracking-wide uppercase mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={`lg:col-span-7 flex flex-col justify-center fade-in-up max-h-[500px] ${shake ? 'shake-element' : ''}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 lg:p-5 max-h-[500px] overflow-y-auto">

            {/* Form Header */}
            <div className="text-center mb-4 lg:mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#6D4AFF] to-indigo-700 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-[#6D4AFF]/20">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 mb-0.5">
                {isRegister ? 'Créer un compte' : 'Se connecter'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {isRegister
                  ? "Essai gratuit de 7 jours"
                  : "Accédez à votre tableau de bord"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-2 lg:space-y-2">

              {isRegister && (
                <>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-700 ml-1">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-700 ml-1">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all font-mono"
                        placeholder="+221 77 123 45 67"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-700 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-700 ml-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6D4AFF] to-indigo-700 hover:from-[#5636E5] hover:to-indigo-800 text-white font-black py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-[11px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {isRegister ? "Création..." : "Connexion..."}
                  </>
                ) : (
                  <>
                    {isRegister ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                    {isRegister ? "Créer un compte" : "Se connecter"}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-2.5 lg:my-2 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[9px] text-slate-400 font-bold">OU</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Switch Mode */}
            <div className="text-center space-y-1 lg:space-y-1">
              <p className="text-[11px] text-slate-600">
                {isRegister ? "Vous avez déjà un compte ?" : "Vous n'avez pas de compte ?"}
              </p>
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                  setPhone('');
                }}
                className="text-[#6D4AFF] font-black hover:text-[#5636E5] transition-colors text-[11px]"
              >
                {isRegister ? "Se connecter" : "Créer un compte gratuitement"}
              </button>

              <div className="pt-2 lg:pt-1.5 border-t border-slate-200">
                <button
                  onClick={() => navigate('/driver/login')}
                  className="text-slate-500 hover:text-[#6D4AFF] font-bold text-[11px] transition-colors"
                >
                  Accès chauffeur →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
