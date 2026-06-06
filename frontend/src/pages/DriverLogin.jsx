import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Lock, 
  UserCheck, 
  KeyRound, 
  MessageSquareCode, 
  Sun, 
  Moon, 
  Smartphone, 
  Link2, 
  Loader2, 
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { getFromDb, saveToDb } from '../utils/mockDb';

export default function DriverLogin() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  // OTP flow states
  const [loginMode, setLoginMode] = useState('pin'); // 'pin' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [smsNotification, setSmsNotification] = useState(null); // { body }

  // Security brute-force lock states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0); // in seconds
  
  // Magic link check state
  const [validatingToken, setValidatingToken] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState('');

  // Styling & Error handling states
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  
  const navigate = useNavigate();

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailedAttempts(0); // Reset attempts on expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // Magic Link token automatic login on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Use setTimeout to defer setState out of render flow
      const timer = setTimeout(() => {
        setValidatingToken(true);
        setTimeout(() => {
          const drivers = getFromDb('drivers', []);
          const driver = drivers.find(d => 
            (d.magic_token && d.magic_token === token.trim()) || 
            d.id === token.trim()
          );
          if (driver) {
            // Log security audit
            const audits = getFromDb('audits', []);
            const newAudit = {
              id: 'au_' + Date.now(),
              date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR').substring(0, 5),
              type: 'login_magic',
              driver_name: driver.name,
              details: 'Connexion réussie via Magic Link WhatsApp'
            };
            saveToDb('audits', [newAudit, ...audits]);

            localStorage.setItem('verse_auth_role', 'driver');
            localStorage.setItem('verse_auth_driver_id', driver.id);
            setValidatingToken(false);
            navigate('/driver/portal');
          } else {
            setValidatingToken(false);
            setMagicLinkError("Lien magique invalide ou expiré.");
            setTimeout(() => setMagicLinkError(''), 5000);
          }
        }, 1500); // Simulated delay for premium security verification look
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // Helper trigger errors with shake animation
  const triggerError = (msg) => {
    setShake(true);
    setError(msg);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setError(''), 4000);
  };

  // Handle standard PIN Login
  const handlePinLogin = (e) => {
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

    const drivers = getFromDb('drivers', []);
    const driver = drivers.find(d => d.phone === phone.trim() && d.pin_code === pin.trim());

    if (driver) {
      // Log security audit
      const audits = getFromDb('audits', []);
      const newAudit = {
        id: 'au_' + Date.now(),
        date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR').substring(0, 5),
        type: 'login_pin',
        driver_name: driver.name,
        details: 'Connexion réussie via numéro de téléphone et PIN'
      };
      saveToDb('audits', [newAudit, ...audits]);

      localStorage.setItem('verse_auth_role', 'driver');
      localStorage.setItem('verse_auth_driver_id', driver.id);
      setFailedAttempts(0);
      navigate('/driver/portal');
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setPin('');
      
      if (nextFailures >= 3) {
        setLockoutTime(30); // block for 30s
        triggerError("Trop de tentatives incorrectes. Clavier verrouillé pour 30s.");
      } else {
        triggerError(`Code PIN incorrect. Tentatives restantes : ${3 - nextFailures}`);
      }
    }
  };

  // Propose/Generate simulated SMS OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      triggerError("Veuillez saisir votre numéro de téléphone.");
      return;
    }

    const drivers = getFromDb('drivers', []);
    const driver = drivers.find(d => d.phone === phone.trim());

    if (!driver) {
      triggerError("Ce numéro ne correspond à aucun chauffeur enregistré.");
      return;
    }

    // Generate a random 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);

    // Simulate SMS delivery toast
    setTimeout(() => {
      setSmsNotification({
        body: `[SMS Versé] Votre code de connexion sécurisé est : ${code}`
      });
      // Auto dismiss SMS notification after 8 seconds
      setTimeout(() => setSmsNotification(null), 8000);
    }, 800);
  };

  // Validate SMS OTP Login
  const handleOtpLogin = (e) => {
    e.preventDefault();
    setError('');

    if (lockoutTime > 0) {
      triggerError(`Connexion bloquée. Réessayez dans ${lockoutTime} secondes.`);
      return;
    }

    if (!otpCode) {
      triggerError("Veuillez saisir le code reçu par SMS.");
      return;
    }

    if (otpCode.trim() === generatedOtp) {
      const drivers = getFromDb('drivers', []);
      const driver = drivers.find(d => d.phone === phone.trim());
      if (driver) {
        // Log security audit
        const audits = getFromDb('audits', []);
        const newAudit = {
          id: 'au_' + Date.now(),
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR').substring(0, 5),
          type: 'login_otp',
          driver_name: driver.name,
          details: 'Connexion réussie via OTP SMS'
        };
        saveToDb('audits', [newAudit, ...audits]);

        localStorage.setItem('verse_auth_role', 'driver');
        localStorage.setItem('verse_auth_driver_id', driver.id);
        setFailedAttempts(0);
        navigate('/driver/portal');
      }
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setOtpCode('');
      
      if (nextFailures >= 3) {
        setLockoutTime(30);
        triggerError("Trop de tentatives incorrectes. Clavier verrouillé pour 30s.");
      } else {
        triggerError(`Code de validation SMS incorrect. Tentatives restantes : ${3 - nextFailures}`);
      }
    }
  };

  const selectDemoAccount = (demoPhone, demoPin) => {
    setPhone(demoPhone);
    setPin(demoPin);
    triggerError("Remplissage automatique. Appuyez sur Se connecter.");
  };

  // Simulation parameters for Magic link
  const simulateMagicLink = (driverId) => {
    setValidatingToken(true);
    setTimeout(() => {
      const drivers = getFromDb('drivers', []);
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        // Log security audit
        const audits = getFromDb('audits', []);
        const newAudit = {
          id: 'au_' + Date.now(),
          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR').substring(0, 5),
          type: 'login_magic_simulated',
          driver_name: driver.name,
          details: 'Connexion simulée via Magic Link WhatsApp'
        };
        saveToDb('audits', [newAudit, ...audits]);

        localStorage.setItem('verse_auth_role', 'driver');
        localStorage.setItem('verse_auth_driver_id', driver.id);
        setValidatingToken(false);
        navigate('/driver/portal');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 sm:p-6 select-none font-sans relative overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Styles for shake and keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .shake-element {
          animation: shake 0.35s ease-in-out;
        }
        @keyframes slideDown {
          from { transform: translate(-50%, -30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-sms-toast {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* --- WHATSAPP SIMULATED SMS TOAST --- */}
      {smsNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xs bg-white border border-slate-200 text-slate-900 rounded-3xl p-4 shadow-xl z-50 flex gap-3.5 animate-sms-toast">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-650">SMS Réseau</span>
              <span className="text-[8px] text-slate-400 font-mono">À l'instant</span>
            </div>
            <p className="text-[11.5px] font-semibold text-slate-800 leading-normal select-all">{smsNotification.body}</p>
          </div>
        </div>
      )}

      {/* Magic link loading overlay */}
      {validatingToken && (
        <div className="fixed inset-0 bg-[#F8FAFC]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 text-[#6D4AFF] animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Validation de l'accès...</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-[240px] font-semibold leading-relaxed">
            Connexion sécurisée en cours. Veuillez ne pas fermer l'application.
          </p>
        </div>
      )}

      {/* Smartphone frame container */}
      <div className="w-full h-full min-h-screen sm:min-h-[740px] sm:max-w-[390px] overflow-hidden sm:shadow-2xl relative flex flex-col sm:border-[8px] sm:border-slate-250 sm:rounded-[50px] bg-[#F8FAFC] text-[#0F172A] shadow-slate-300/40">
        
        {/* Phone Notch */}
        <div className="hidden sm:flex h-5.5 w-32 mx-auto rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-40 items-center justify-center bg-slate-200">
          <span className="w-3 h-3 rounded-full bg-black/95 block mr-3"></span>
          <span className="w-8 h-1 rounded bg-black/20 block"></span>
        </div>

        {/* Status Bar */}
        <div className="pt-3 sm:pt-6 px-6 pb-2 flex justify-between items-center text-[10px] font-mono z-30 font-semibold text-slate-500 bg-[#F8FAFC]">
          <span>19:58</span>
          <div className="flex gap-2 items-center">
            <span>Orange SN 4G</span>
            <div className="w-5.5 h-2.5 border border-slate-350 rounded-sm p-0.5 flex">
              <div className="bg-emerald-500 h-full w-4/5 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Smartphone Screen Body */}
        <div className="flex-1 flex flex-col justify-between p-6 relative overflow-y-auto bg-[#F8FAFC]">
          
          {/* Top header navigation inside smartphone */}
          <div className="relative z-20 flex items-center justify-center mt-2">
            <span className="text-[11px] font-semibold border border-[#6D4AFF]/20 px-3.5 py-1 rounded-full uppercase tracking-wider bg-[#6D4AFF]/5 text-[#6D4AFF]">
              🚖 Versé Chauffeur
            </span>
          </div>

          {/* Form Container */}
          <div className={`relative z-20 flex-1 flex flex-col justify-center my-auto py-6 space-y-5 ${shake ? 'shake-element' : ''}`}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 bg-[#6D4AFF]/5 text-[#6D4AFF]">
                {loginMode === 'pin' ? <Lock className="w-5.5 h-5.5" /> : <KeyRound className="w-5.5 h-5.5" />}
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Espace Chauffeur
              </h2>
              <p className="text-xs max-w-[260px] mx-auto text-slate-500 font-medium leading-relaxed">
                Connectez-vous pour transmettre vos versements et trajets journaliers.
              </p>

            </div>

            {/* Error notifications */}
            {(error || magicLinkError) && (
              <div className="bg-red-50 border border-red-200 text-red-650 text-xs p-3 rounded-2xl flex gap-2.5 font-semibold animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error || magicLinkError}</span>
              </div>
            )}

            {/* Lockout status indicator */}
            {lockoutTime > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-850 text-xs p-3.5 rounded-2xl flex flex-col gap-1 items-center text-center font-semibold">
                <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>Clavier verrouillé pour des raisons de sécurité</span>
                <span className="text-[10px] text-slate-500">Veuillez patienter : <strong className="font-mono text-amber-600 text-xs">{lockoutTime}s</strong></span>
              </div>
            )}

            {/* Login Fields Form */}
            {loginMode === 'pin' ? (
              <form onSubmit={handlePinLogin} className="space-y-3">
                <div className="space-y-1">
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={phone}
                      disabled={lockoutTime > 0}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#6D4AFF] focus:bg-white transition-all font-mono placeholder-slate-400 text-center tracking-wider font-semibold disabled:opacity-40 min-h-[48px] bg-slate-50 text-slate-800"
                      placeholder="Téléphone (ex: 771234567)"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <input 
                      type={showPin ? "text" : "password"} 
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={pin}
                      disabled={lockoutTime > 0}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#6D4AFF] focus:bg-white transition-all font-mono tracking-widest text-center placeholder-slate-400 font-semibold disabled:opacity-40 min-h-[48px] bg-slate-50 text-slate-800"
                      placeholder="Code PIN à 4 chiffres"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-4 top-3 text-slate-400 hover:text-[#6D4AFF]"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={lockoutTime > 0}
                  className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] min-h-[48px] disabled:opacity-40"
                >
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </button>
              </form>
            ) : (
              /* SMS OTP Mode Form */
              <form onSubmit={otpSent ? handleOtpLogin : handleRequestOtp} className="space-y-3">
                <div className="space-y-1">
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={phone}
                      disabled={otpSent || lockoutTime > 0}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#6D4AFF] focus:bg-white transition-all font-mono placeholder-slate-400 text-center tracking-wider font-semibold disabled:opacity-40 min-h-[48px] bg-slate-50 text-slate-800"
                      placeholder="Téléphone (ex: 771234567)"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-1 animate-fadeIn">
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={4}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={otpCode}
                        disabled={lockoutTime > 0}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#6D4AFF] focus:bg-white transition-all font-mono tracking-widest text-center placeholder-slate-400 font-semibold min-h-[48px] bg-slate-50 text-slate-800"
                        placeholder="Code SMS reçu"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={lockoutTime > 0}
                  className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] min-h-[48px] disabled:opacity-40"
                >
                  <KeyRound className="w-4 h-4" />
                  {otpSent ? "Confirmer le code" : "Recevoir le code SMS"}
                </button>

                {otpSent && (
                  <button 
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="w-full text-[10px] font-bold text-center mt-2 cursor-pointer text-slate-500 hover:text-[#6D4AFF] transition-colors"
                  >
                    Changer de numéro
                  </button>
                )}
              </form>
            )}

            {/* Toggle Login Method */}
            <button
              onClick={() => {
                setLoginMode(loginMode === 'pin' ? 'otp' : 'pin');
                setOtpSent(false);
                setOtpCode('');
                setError('');
              }}
              className="text-[10px] font-bold text-center underline cursor-pointer text-[#6D4AFF] hover:text-[#5636E5] transition-colors"
            >
              {loginMode === 'pin' ? "S'authentifier plutôt par code SMS (OTP)" : "S'authentifier plutôt par code PIN"}
            </button>

            {/* Collapsible Demo Tools */}
            <div className="border border-slate-150 rounded-3xl bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDevTools(!showDevTools)}
                className="w-full px-4 py-3 flex justify-between items-center text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#6D4AFF]" />
                  Simulateurs & Remplissage démo
                </span>
                <span className="text-xs text-slate-400">{showDevTools ? '▲' : '▼'}</span>
              </button>

              {showDevTools && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 animate-fade-in">
                  {/* Magic Link Simulator */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Simulateur Magic Link (WhatsApp)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => simulateMagicLink('d1')}
                        className="text-[10px] font-bold py-2 rounded-xl text-center active:scale-95 border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        🔗 Moussa
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateMagicLink('d2')}
                        className="text-[10px] font-bold py-2 rounded-xl text-center active:scale-95 border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        🔗 Amadou
                      </button>
                    </div>
                  </div>

                  {/* Quick demo account connections */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Remplissage Auto (Démo PIN) :
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => selectDemoAccount('771234567', '1234')}
                        className="w-full border border-slate-200 text-[10px] font-bold py-2 rounded-xl text-center transition-all active:scale-95 cursor-pointer bg-slate-50 text-slate-700 hover:bg-slate-100"
                      >
                        🚗 Moussa (v1)
                      </button>
                      <button 
                        type="button"
                        onClick={() => selectDemoAccount('779876543', '5678')}
                        className="w-full border border-slate-200 text-[10px] font-bold py-2 rounded-xl text-center transition-all active:scale-95 cursor-pointer bg-slate-50 text-slate-700 hover:bg-slate-100"
                      >
                        🚕 Amadou (v2)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer inside mobile frame */}
          <div className="text-center pt-4 border-t border-slate-100 text-[9px] font-semibold mt-auto flex flex-col gap-0.5 text-slate-400">
            <span>PORTAIL MOBILE VERSÉ v2.0</span>
            <span>Sécurité HTTPS • Cryptage de bout en bout</span>
          </div>

        </div>

      </div>

      {/* Switch link back to owner space */}
      <button 
        onClick={() => navigate('/login')} 
        className="mt-6 text-xs font-bold transition-all cursor-pointer border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm mb-4 sm:mb-0 bg-white hover:bg-slate-50 text-slate-650"
      >
        Espace Propriétaire (Web) 🖥️
      </button>
    </div>
  );
}
