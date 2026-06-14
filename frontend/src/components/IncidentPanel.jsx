import { Phone, MessageCircle } from 'lucide-react';

export default function IncidentPanel({ incidents, drivers = [], onResolveIncident }) {
  const pendingIncidents = incidents.filter(i => i.status === 'pending');

  return (
    <div className="bg-slate-900 border border-white/5 rounded-xl p-5 shadow-sm text-slate-100">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h2 className="text-sm font-bold text-white">Incidents & Alertes</h2>
        <span className="text-[9px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
          {pendingIncidents.length} Actifs
        </span>
      </div>

      {pendingIncidents.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-slate-950/40">
          <p className="text-xs text-slate-300 font-bold">Aucun incident à signaler !</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Les alertes des chauffeurs s'afficheront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingIncidents.map((inc) => {
            const driver = drivers.find(d => d.name === inc.driver_name);

            return (
              <div key={inc.id} className="bg-slate-950 border border-white/5 p-3 rounded-lg space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">{inc.driver_name}</span>
                  <span className="font-mono bg-slate-900 border border-white/10 text-amber-300 font-bold px-2 py-0.5 rounded text-[9px] shadow-sm">
                    {inc.vehicle_plate}
                  </span>
                </div>
                
                <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">
                  {inc.description}
                </p>
                
                <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-white/5 pt-1.5">
                  <span>Catégorie : <strong className="text-red-400 uppercase font-bold">{inc.type === 'engine' ? 'Moteur' : inc.type === 'accident' ? 'Accident' : 'Police'}</strong></span>
                  <span>{inc.date}</span>
                </div>

                {/* Actions de contact et de résolution d'incident */}
                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    {driver && (
                      <>
                        <a 
                          href={`tel:${driver.phone}`} 
                          className="flex items-center gap-1 text-[9px] font-bold text-slate-300 hover:text-white bg-slate-900 border border-white/5 px-2 py-1 rounded shadow-sm no-underline transition-all"
                          title="Appeler le chauffeur"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          Appeler
                        </a>
                        <a 
                          href={`https://wa.me/221${driver.phone}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-350 bg-slate-900 border border-white/5 px-2 py-1 rounded shadow-sm no-underline transition-all"
                          title="Ouvrir WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => onResolveIncident && onResolveIncident(inc.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Résoudre et effacer l'incident"
                  >
                    Résoudre
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
