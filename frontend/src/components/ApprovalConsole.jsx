
export default function ApprovalConsole({ 
  payments, 
  vehicles, 
  handleApprovePayment, 
  handleRejectPayment, 
  setSelectedReceipt,
  setActiveTab
}) {
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="bg-slate-900 border border-white/5 rounded-xl p-5 shadow-sm text-slate-100">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h2 className="text-sm font-bold text-white">Validation des Versements</h2>
        <span className="text-[10px] bg-slate-950 text-slate-300 border border-white/5 px-2 py-0.5 rounded font-mono font-bold">
          {pendingPayments.length} En attente
        </span>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-slate-950/40">
          <p className="text-xs text-slate-300 font-bold">Tous les versements du jour sont validés !</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Les déclarations s'afficheront ici en direct.</p>
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('driver')}
              className="mt-4 text-[10px] bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg hover:bg-amber-350 transition-all font-bold cursor-pointer"
            >
              Simuler une déclaration chauffeur
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {pendingPayments.map((pay) => {
            const v = vehicles.find(veh => veh.id === pay.vehicle_id);
            return (
              <div key={pay.id} className="bg-slate-950 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all">
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{pay.driver_name}</span>
                    <span className="text-[9px] bg-slate-900 border border-white/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold inline-block whitespace-nowrap">{v ? v.license_plate : 'N/A'}</span>
                  </div>
                  
                  <div className="space-y-0.5 font-medium">
                    <p>Déclaration : <strong className="text-emerald-400 font-mono font-bold">{pay.amount.toLocaleString()} FCFA</strong></p>
                    <p>Code transaction : <span className="font-mono text-slate-200 bg-slate-900 border border-white/5 px-1 py-0.5 rounded">{pay.transaction_reference}</span></p>
                    {pay.odometer && (
                      <p>Odomètre : <strong className="text-white font-mono">{pay.odometer} km</strong> <span className="text-[9px] text-slate-500 font-normal">(Précédent : {v?.current_mileage} km)</span></p>
                    )}
                    <p className="text-[9px] text-slate-500 mt-1.5">
                      Soumis le {pay.submitted_at}
                    </p>
                  </div>
                </div>
                
                {/* Actions et vue du reçu de versement */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                  <button 
                    onClick={() => setSelectedReceipt(pay)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-white/5 transition-all cursor-pointer"
                  >
                    Voir Reçu
                  </button>
                  <button 
                    onClick={() => handleApprovePayment(pay.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Approuver
                  </button>
                  <button 
                    onClick={() => handleRejectPayment(pay.id)}
                    className="bg-red-500/10 hover:bg-red-650 border border-red-500/20 text-red-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Rejeter
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
