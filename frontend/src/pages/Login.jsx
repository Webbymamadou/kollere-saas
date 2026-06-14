import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, LogIn, AlertCircle, UserCheck, UserPlus } from 'lucide-react';
import taxiImage from '../assets/dakar_taxi_sunset.png';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  
  // États du formulaire de connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // États du formulaire d'inscription
  const [name, setName] = useState('');
  const [fleetName, setFleetName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Vérifier le profil du propriétaire enregistré ou utiliser le propriétaire de démonstration par défaut
    const registeredProfile = localStorage.getItem('verse_owner_profile');
    if (registeredProfile) {
      const profile = JSON.parse(registeredProfile);
      if (email === profile.email && password === 'password') { // pour faciliter les tests, n'importe quel email enregistré correspond au mot de passe 'password'
        localStorage.setItem('verse_auth_role', 'owner');
        navigate('/dashboard');
        return;
      }
    }

    if (email === 'owner@verse.local' && password === 'password') {
      localStorage.setItem('verse_auth_role', 'owner');
      navigate('/dashboard');
    } else {
      setShake(true);
      setError("Identifiants incorrects (owner@verse.local / password).");
      setTimeout(() => {
        setShake(false);
        setPassword('');
      }, 500);
      setTimeout(() => {
        setError('');
      }, 2500);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !fleetName || !phone || !email || !password) {
      setError("Veuillez remplir tous les champs du formulaire.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Sauvegarder les informations du propriétaire dans la base de données simulée
    const ownerProfile = { name, email, phone, fleetName };
    localStorage.setItem('verse_owner_profile', JSON.stringify(ownerProfile));
    
    // Connexion automatique du propriétaire inscrit
    localStorage.setItem('verse_auth_role', 'owner');
    navigate('/dashboard');
  };

  const handleDemoLogin = () => {
    localStorage.setItem('verse_auth_role', 'owner');
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative font-sans p-4"
      style={{ backgroundImage: `url(${taxiImage})` }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .shake-element {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {/* Superposition d'arrière-plan */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Conteneur de carte transparent */}
      <div className={`relative z-10 w-full max-w-sm bg-white/[0.02] border border-white/10 rounded-2xl p-7 backdrop-blur-md shadow-xl text-center space-y-5 ${shake ? 'shake-element' : ''}`}>
        
        {/* Icône d'en-tête */}
        <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/25">
          <Car className="w-4.5 h-4.5" />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest block font-serif">Kollëré</span>
          <h1 className="text-sm font-bold text-white uppercase tracking-wider">
            {isRegister ? "Créer un Compte Propriétaire" : "Espace Propriétaire"}
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/25 border border-red-500/35 text-red-250 text-[10px] p-2.5 rounded-xl flex gap-1.5 justify-start text-left font-semibold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Rendu de la vue d'inscription */}
        {isRegister ? (
          <form onSubmit={handleRegister} className="space-y-3">
            
            <div className="space-y-1 text-left">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white placeholder-slate-300"
                placeholder="Nom complet"
              />
            </div>

            <div className="space-y-1 text-left">
              <input 
                type="text" 
                value={fleetName}
                onChange={(e) => setFleetName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white placeholder-slate-300"
                placeholder="Nom de la flotte (ex: Dakar Express)"
              />
            </div>

            <div className="space-y-1 text-left">
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white font-mono placeholder-slate-300"
                placeholder="Téléphone WhatsApp"
              />
            </div>

            <div className="space-y-1 text-left">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white font-mono placeholder-slate-300"
                placeholder="Email de connexion"
              />
            </div>

            <div className="space-y-1 text-left">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white font-mono placeholder-slate-300"
                placeholder="Mot de passe"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-350 text-slate-950 text-xs font-bold py-3.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4"
            >
              <UserPlus className="w-3.5 h-3.5" />
              S'inscrire & Lancer Flotte
            </button>
            
          </form>
        ) : (
          /* Rendu de la vue de connexion */
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1 text-left">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white font-mono placeholder-slate-300"
                placeholder="Email de connexion"
              />
            </div>

            <div className="space-y-1 text-left">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all text-white font-mono placeholder-slate-300"
                placeholder="Mot de passe"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-350 text-slate-950 text-xs font-bold py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <LogIn className="w-3.5 h-3.5" />
                Se connecter
              </button>
              <button 
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                Accès Démo
              </button>
            </div>

          </form>
        )}

        {/* Liens de basculement inférieurs */}
        <div className="pt-4 border-t border-white/10 text-center flex flex-col gap-2.5">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }} 
            className="text-[10px] text-white hover:text-amber-300 font-extrabold transition-colors cursor-pointer"
          >
            {isRegister ? "Déjà inscrit ? Se connecter" : "Nouveau ? Créer un compte propriétaire"}
          </button>
          
          <button 
            onClick={() => navigate('/driver/login')} 
            className="text-[10px] text-amber-300 hover:text-amber-400 font-bold transition-colors cursor-pointer"
          >
            Portail Chauffeur 📱
          </button>
        </div>

      </div>
    </div>
  );
}
