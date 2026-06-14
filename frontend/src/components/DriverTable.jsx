import { useState } from 'react';
import { Phone, MessageCircle, Link, Check } from 'lucide-react';

export default function DriverTable({ drivers, vehicles, payments = [], onDeleteDriver, onTogglePaymentStatus, onRegenerateMagicToken }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyMagicLink = (driver) => {
    // Générer l'URL de jeton sécurisé en utilisant le magic_token ou par défaut l'identifiant (id)
    const tokenVal = driver.magic_token || driver.id;
    const magicLink = window.location.origin + `/driver/login?token=${tokenVal}`;
    navigator.clipboard.writeText(magicLink).then(() => {
      setCopiedId(driver.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="bg-slate-900 border border-white/5 rounded-xl p-5 shadow-sm text-slate-100">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h2 className="text-sm font-bold text-white">Registre des Chauffeurs</h2>
        <span className="text-[10px] bg-slate-950 text-slate-300 border border-white/5 px-2 py-0.5 rounded font-mono font-bold">
          {drivers.length} Chauffeurs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950">
              <th className="py-2.5 px-3 whitespace-nowrap w-[15%]">Chauffeur</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-[15%]">Coordonnées</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-[20%]">Véhicule Assigné</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-[25%]">Lien Magique</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-[15%] text-center">Versement (Jour)</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-[10%]">Statut</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
            {drivers.map((d) => {
              const assignedVehicle = vehicles.find(v => v.id === d.vehicle_id);

              // Calculer les versements du jour (aujourd'hui)
              const todayStr = new Date().toISOString().split('T')[0];
              const driverPayments = payments.filter(p => 
                p.status === 'approved' && 
                p.driver_name === d.name &&
                p.date === todayStr
              );
              const totalPaidToday = driverPayments.reduce((sum, p) => sum + p.amount, 0);
              
              // Vérifier s'ils ont payé aujourd'hui
              const isPaid = d.paid_today !== undefined 
                ? d.paid_today 
                : totalPaidToday > 0;

              return (
                <tr key={d.id} className="hover:bg-slate-950/50 transition-colors">
                  {/* Nom du chauffeur */}
                  <td className="py-3 px-3 font-semibold text-white text-xs whitespace-nowrap w-[15%]">
                    {d.name}
                  </td>

                  {/* Numéro de téléphone et liens WhatsApp */}
                  <td className="py-3 px-3 font-mono whitespace-nowrap w-[15%]">
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${d.phone}`} 
                        className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 font-bold transition-colors no-underline"
                        title="Passer un appel direct"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {d.phone}
                      </a>
                      <a 
                        href={`https://wa.me/221${d.phone}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 hover:text-emerald-300 flex items-center transition-colors"
                        title="Ouvrir discussion WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      </a>
                    </div>
                  </td>

                  {/* Plaque d'immatriculation du véhicule assigné */}
                  <td className="py-3 px-3 whitespace-nowrap w-[20%]">
                    {assignedVehicle ? (
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono bg-slate-950 border border-white/5 text-amber-300 px-1.5 py-0.5 rounded font-bold inline-block whitespace-nowrap">
                          {assignedVehicle.license_plate}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-semibold whitespace-nowrap">{assignedVehicle.brand_model}</span>
                      </div>
                    ) : (
                      <span className="text-red-450 italic text-[10px] whitespace-nowrap">Aucun véhicule</span>
                    )}
                  </td>

                  {/* Copie du lien magique et réinitialisation */}
                  <td className="py-3 px-3 whitespace-nowrap w-[25%]">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleCopyMagicLink(d)}
                        className={`flex items-center justify-center gap-1 font-bold text-[9px] px-2.5 py-1.5 rounded-lg border cursor-pointer active:scale-95 transition-all shadow-sm shrink-0 w-24 text-center ${
                          copiedId === d.id 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-indigo-500/10 hover:bg-indigo-650/30 border-indigo-500/20 text-indigo-300 hover:text-white'
                        }`}
                      >
                        {copiedId === d.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Link className="w-3 h-3" />}
                        {copiedId === d.id ? "Copié !" : "Copier"}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Voulez-vous réinitialiser le lien d'accès pour ${d.name} ? L'ancien lien ne fonctionnera plus.`)) {
                            onRegenerateMagicToken && onRegenerateMagicToken(d.id);
                          }
                        }}
                        className="bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-slate-200 text-[9px] font-bold px-2 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm shrink-0 w-20 text-center"
                        title="Réinitialiser le lien d'accès (invalider l'ancien)"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </td>

                  {/* Bascule de l'état de versement quotidien */}
                  <td className="py-3 px-3 whitespace-nowrap w-[15%]">
                    <div className="flex flex-col items-center">
                      {isPaid ? (
                        <button
                          onClick={() => onTogglePaymentStatus && onTogglePaymentStatus(d.id)}
                          className="group relative flex items-center justify-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border bg-emerald-500/10 hover:bg-red-500/10 border-emerald-500/20 hover:border-red-500/20 text-emerald-400 hover:text-red-400 transition-all cursor-pointer shadow-sm w-28 active:scale-95"
                          title="Cliquer pour marquer comme impayé pour aujourd'hui"
                        >
                          <span className="group-hover:hidden flex items-center gap-1">✔️ Versement OK</span>
                          <span className="hidden group-hover:inline">Rendre Impayé</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onTogglePaymentStatus && onTogglePaymentStatus(d.id)}
                          className="group relative flex items-center justify-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border bg-red-500/10 hover:bg-emerald-500/10 border-red-500/20 hover:border-emerald-500/20 text-red-400 hover:text-emerald-400 transition-all cursor-pointer shadow-sm w-28 active:scale-95"
                          title="Cliquer pour marquer comme payé pour aujourd'hui"
                        >
                          <span className="group-hover:hidden flex items-center gap-1">❌ Pas de Versement</span>
                          <span className="hidden group-hover:inline">Rendre Payé</span>
                        </button>
                      )}
                      {totalPaidToday > 0 && (
                        <span className="text-[9px] text-slate-500 block mt-1 font-mono font-bold">
                          {totalPaidToday.toLocaleString()} F
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="py-3 px-3 whitespace-nowrap w-[10%]">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {d.status || 'actif'}
                    </span>
                  </td>

                  {/* Actions (Bouton désactiver) */}
                  <td className="py-3 px-3 text-right whitespace-nowrap w-[10%]">
                    <button 
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment désactiver le chauffeur ${d.name} ?`)) {
                          onDeleteDriver(d.id);
                        }
                      }}
                      className="bg-red-500/10 hover:bg-red-650 border border-red-500/20 text-red-300 hover:text-white text-[9px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm w-20 text-center"
                      title="Désactiver le chauffeur"
                    >
                      Désactiver
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
