import { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, PenTool, Check } from 'lucide-react';

export default function MaintenanceModal({ isOpen, onClose, vehicles = [], onAdd }) {
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('oil_change');
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleId || !type || !mileage || !cost || !date) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setTimeout(() => setError(''), 3000);
      return;
    }

    onAdd({
      vehicle_id: vehicleId,
      type,
      mileage_at_maintenance: parseInt(mileage),
      cost: parseFloat(cost),
      maintenance_date: date,
      description
    });

    // Reset fields
    setVehicleId('');
    setType('oil_change');
    setMileage('');
    setCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-fade-in text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center border border-amber-400/25">
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-black text-white text-sm tracking-wide uppercase">Enregistrer une maintenance</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl font-bold animate-fadeIn">
              {error}
            </div>
          )}

          {/* Vehicle Selection */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Véhicule concerné *</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-150 focus:outline-none focus:border-amber-400 transition-all"
            >
              <option value="" disabled>Sélectionner un véhicule</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand_model} ({v.license_plate})
                </option>
              ))}
            </select>
          </div>

          {/* Type & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Type d'opération *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-150 focus:outline-none focus:border-amber-400 transition-all"
              >
                <option value="oil_change">Vidange</option>
                <option value="repair">Réparation</option>
                <option value="inspection">Contrôle technique</option>
                <option value="tires">Pneumatiques</option>
                <option value="brakes">Freins</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-150 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>
          </div>

          {/* Mileage & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Odomètre (km) *</label>
              <input
                type="number"
                placeholder="Ex: 52000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-150 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Coût (FCFA) *</label>
              <input
                type="number"
                placeholder="Ex: 25000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-150 focus:outline-none focus:border-amber-400 transition-all font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Description / Notes</label>
            <textarea
              rows="3"
              placeholder="Détails de l'intervention (ex: Remplacement filtre à huile et huile 10W40)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-150 focus:outline-none focus:border-amber-400 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-3 rounded-xl transition-all cursor-pointer mt-4 active:scale-98 border-0 flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/10"
          >
            <Check className="w-4 h-4" />
            Enregistrer l'opération
          </button>
        </form>

      </div>
    </div>
  );
}
