import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Lock, 
  Smartphone, 
  Loader2, 
  ShieldAlert,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import apiService from '../services/api';

export default function DriverLogin() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const [loginMode, setLoginMode] = useState('pin'); // 'pin' ou 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const [validatingToken, setValidatingToken] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState('');

  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      const timer = setTimeout(async () => {
        setValidatingToken(true);
        try {
          const response = await apiService.driverLogin({ token });
          localStorage.setItem('verse_auth_role', 'driver');
          localStorage.setItem('verse_auth_driver_id', response.driver.id);
          localStorage.setItem('verse_auth_driver_data', JSON.stringify(response.driver));
          setValidatingToken(false);
          navigate('/driver/portal');
        } catch (err) {
          setValidatingToken(false);
          setMagicLinkError("Lien magique invalide ou expiré.");
          setTimeout(() => setMagicLinkError(''), 5000);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const triggerError = (msg) => {
    setShake(true);
    setError(msg);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setError(''), 4000);
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (lockoutTime > 0) {
      triggerError(`Connexion bloquée. Réessayez dans ${lockoutTime} secondes.`);
      return;
    }

    if (!phone || !pin) {
      triggerError("Veuillez remplir le numéro et le PIN.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.driverLogin({ phone, pin_code: pin });
      localStorage.setItem('verse_auth_role', 'driver');
      localStorage.setItem('verse_auth_driver_id', response.driver.id);
      localStorage.setItem('verse_auth_driver_data', JSON.stringify(response.driver));
      setFailedAttempts(0);
      navigate('/driver/portal');
    } catch (err) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setPin('');
      
      if (nextFailures >= 5) {
        setLockoutTime(300);
        triggerError("Trop de tentatives. Compte bloqué 5 minutes.");
      } else {
        triggerError(err.message || "Numéro ou PIN incorrect.");
      }
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 text-[#6D4AFF] animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Vérification en cours</h3>
          <p className="text-slate-600">Connexion via le lien magique...</p>
        </div>
      </div>
    );
  }

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

      <button 
        onClick={() => navigate('/')} 
        className="fixed top-4 left-4 flex items-center gap-1.5 text-slate-600 hover:text-[#6D4AFF] transition-colors z-50 text-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold">Retour</span>
      </button>

      <div className={`w-full max-w-sm mx-auto fade-in-up ${shake ? 'shake-element' : ''}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 lg:p-5 max-h-[460px] overflow-y-auto">
          
          <div className="text-center mb-4 lg:mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#6D4AFF] to-indigo-700 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-[#6D4AFF]/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 mb-0.5">Portail Chauffeur</h2>
            <p className="text-[11px] text-slate-500 font-medium">Connectez-vous pour accéder à votre espace</p>
          </div>

          {magicLinkError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">{magicLinkError}</span>
            </div>
          )}

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {lockoutTime > 0 && (
            <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-center text-[11px]">
              <p className="font-bold">Compte temporairement bloqué</p>
              <p className="mt-0.5">Réessayez dans {Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}</p>
            </div>
          )}

          <form onSubmit={handlePinLogin} className="space-y-2 lg:space-y-2">
            
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-700 ml-1">Numéro de téléphone</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all font-mono"
                  placeholder="+221 77 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-700 ml-1">Code PIN</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPin ? 'text' : 'password'} 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="w-full pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all text-center font-mono text-lg tracking-widest"
                  placeholder="••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || lockoutTime > 0}
              className="w-full bg-gradient-to-r from-[#6D4AFF] to-indigo-700 hover:from-[#5636E5] hover:to-indigo-800 text-white font-black py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-[11px] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center">
            <button 
              onClick={() => navigate('/login')} 
              className="text-slate-500 hover:text-[#6D4AFF] font-bold text-[11px] transition-colors"
            >
              Espace propriétaire →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
