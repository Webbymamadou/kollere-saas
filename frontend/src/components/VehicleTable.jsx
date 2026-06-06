import { Phone, MessageCircle } from 'lucide-react';

export default function VehicleTable({ vehicles, drivers, getOilChangeStatus, onDeleteVehicle }) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-xl p-5 shadow-sm text-slate-100">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h2 className="text-sm font-bold text-white">Suivi de la Flotte & Maintenance</h2>
        <span className="text-[10px] bg-slate-950 text-slate-300 border border-white/5 px-2 py-0.5 rounded font-mono font-bold">
          {vehicles.length} Véhicules
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950">
              <th className="py-2.5 px-3 whitespace-nowrap">Véhicule</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Chauffeur</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Odomètre</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Vidange</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Statut</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
            {vehicles.map((v) => {
              const driver = drivers.find(d => d.vehicle_id === v.id);
              const oilStatus = getOilChangeStatus(v);
              
              let badgeColor = 'bg-emerald-500/10 text-emerald-350 border-emerald-500/20 text-emerald-300';
              if (oilStatus.urgent) {
                badgeColor = 'bg-red-500/10 text-red-300 border-red-500/20';
              } else if (v.current_mileage - v.last_oil_change_mileage >= 4500) {
                badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
              }

              return (
                <tr key={v.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-white">{v.brand_model}</div>
                    <span className="text-[9px] font-mono bg-slate-950 border border-white/5 text-amber-300 px-1.5 py-0.5 rounded font-bold inline-block mt-1 whitespace-nowrap">
                      {v.license_plate}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {driver ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-white">{driver.name}</div>
                        <div className="flex items-center gap-2 text-[9px] font-mono">
                          <a 
                            href={`tel:${driver.phone}`}
                            className="text-slate-350 hover:text-indigo-400 font-bold flex items-center gap-0.5 cursor-pointer no-underline transition-all"
                            title="Appeler le chauffeur"
                          >
                            <Phone className="w-2.5 h-2.5 text-slate-500" />
                            {driver.phone}
                          </a>
                          <a 
                            href={`https://wa.me/221${driver.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 flex items-center transition-all"
                            title="Envoyer un WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-red-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {v.current_mileage.toLocaleString()} km
                    {v.pending_mileage && (
                      <span className="text-[9px] font-sans block mt-0.5 text-amber-400 font-bold">
                        ⏳ En validation : {v.pending_mileage} km
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-1 max-w-[130px]">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-slate-400">{oilStatus.driven} km</span>
                        <span className={oilStatus.urgent ? 'text-red-400 font-bold' : 'text-slate-400'}>
                          {Math.round(oilStatus.percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 border border-white/5 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${oilStatus.urgent ? 'bg-red-500' : 'bg-amber-400'}`} 
                          style={{ width: `${Math.min(oilStatus.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                      {oilStatus.urgent ? 'Vidange urgente' : oilStatus.driven >= 4500 ? 'À prévoir' : 'Correct'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button 
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment effacer le véhicule ${v.brand_model} (${v.license_plate}) ?`)) {
                          onDeleteVehicle(v.id);
                        }
                      }}
                      className="bg-red-500/10 hover:bg-red-650 border border-red-500/20 text-red-300 hover:text-white text-[9px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Effacer le véhicule"
                    >
                      Effacer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
