import { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function AddVehicleModal({ isOpen, onClose, onAdd }) {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [error, setError] = useState('');

  // États de l'écran de succès
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdDriver, setCreatedDriver] = useState(null); // { name, phone, magicLink }
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plate || !model || !mileage || !driverName || !driverPhone || !driverPin) {
      setError("Veuillez remplir tous les champs.");
      setTimeout(() => setError(''), 2000);
      return;
    }

    const newDriverId = 'd_' + Date.now();
    const newVehicleId = 'v_' + Date.now();
    const magicToken = 'mt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const magicLink = window.location.origin + `/driver/login?token=${magicToken}`;

    onAdd({
      id: newDriverId,
      vehicleId: newVehicleId,
      magicToken,
      plate,
      model,
      mileage: parseInt(mileage),
      driverName,
      driverPhone,
      driverPin
    });

    setCreatedDriver({
      name: driverName,
      phone: driverPhone,
      magicLink: magicLink
    });
    setShowSuccess(true);

    // Réinitialiser les champs du formulaire
    setPlate('');
    setModel('');
    setMileage('');
    setDriverName('');
    setDriverPhone('');
    setDriverPin('');
  };

  // Vue de succès
  if (showSuccess && createdDriver) {
    const shareMessage = `Bonjour ${createdDriver.name}, voici ton lien d'accès sécurisé à ton espace chauffeur Kollëré : ${createdDriver.magicLink}`;
    const whatsappUrl = `https://wa.me/221${createdDriver.phone}?text=${encodeURIComponent(shareMessage)}`;

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-100 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <Check className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-900">Chauffeur enregistré !</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Le compte de <strong>{createdDriver.name}</strong> a été configuré. Partagez-lui son lien d'accès sécurisé pour qu'il puisse déclarer ses versements.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2">
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Message d'invitation</span>
            <p className="text-[10.5px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200/50 font-mono select-all break-all leading-relaxed">
              {shareMessage}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareMessage);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer active:scale-98 ${
                copied 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                  : 'bg-[#6D4AFF] hover:bg-[#5636E5] border-[#6D4AFF] text-white shadow-md shadow-[#6D4AFF]/10'
              }`}
            >
              {copied ? "✔️ Message copié !" : "Copier le message"}
            </button>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center block active:scale-98 shadow-sm no-underline"
            >
              💬 Partager sur WhatsApp
            </a>
          </div>

          <button
            onClick={() => {
              setShowSuccess(false);
              setCreatedDriver(null);
              onClose();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200/40"
          >
            Fermer le formulaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-fade-in">
        
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">Ajouter un véhicule & chauffeur</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-650 text-xs p-3 rounded-xl font-bold animate-fadeIn">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Plaque d'immatriculation</label>
              <input 
                type="text" 
                placeholder="Ex: DK-3421-A"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/10 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Marque & Modèle</label>
              <input 
                type="text" 
                placeholder="Ex: Peugeot 301"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Kilométrage Actuel (km)</label>
            <input 
              type="number" 
              placeholder="Ex: 45000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/10 transition-all"
            />
          </div>

          <div className="border-t border-slate-100 my-4 pt-5">
            <h4 className="text-[10.5px] font-extrabold text-slate-500 mb-4 uppercase tracking-widest">Informations Chauffeur</h4>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Nom Complet</label>
                <input 
                  type="text" 
                  placeholder="Ex: Moussa Diop"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/10 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Téléphone (WhatsApp)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 771234567"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Code PIN de connexion</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder="Ex: 1234"
                    value={driverPin}
                    onChange={(e) => setDriverPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono text-center tracking-widest focus:outline-none focus:bg-white focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/10 transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-[#6D4AFF]/15 cursor-pointer mt-4 active:scale-98"
          >
            Créer l'assignation & Mettre en ligne
          </button>

        </form>
      </div>
    </div>
  );
}
