import { useState } from 'react';
import { X, CheckCircle, XCircle, ChevronLeft, Eye, ExternalLink } from 'lucide-react';

export default function ReceiptModal({ 
  isOpen, 
  onClose, 
  payments = [], 
  onApprove, 
  onReject,
  selectedReceipt, 
  setSelectedReceipt 
}) {
  // Mode d'inspection individuel de reçu (direct via accessoire d'état parent)
  const isInspectMode = !!selectedReceipt;
  const currentInspectReceipt = selectedReceipt;
  const closeInspect = () => setSelectedReceipt ? setSelectedReceipt(null) : null;

  // État local d'inspection au sein du gestionnaire de liste
  const [localInspectReceipt, setLocalInspectReceipt] = useState(null);

  // Si rien n'est censé être affiché, on s'arrête
  if (!isOpen && !selectedReceipt) return null;

  // Vue d'inspection de l'image du reçu
  if (isInspectMode || localInspectReceipt) {
    const receiptToShow = isInspectMode ? currentInspectReceipt : localInspectReceipt;
    const handleBack = isInspectMode ? closeInspect : () => setLocalInspectReceipt(null);

    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-fade-in text-slate-100">
          
          <div className="px-5 py-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50">
            <button 
              onClick={handleBack}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-bold cursor-pointer border-0 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
            <h3 className="font-extrabold text-white text-xs tracking-wider">Inspecteur de Reçu</h3>
            <button 
              onClick={() => {
                handleBack();
                if (onClose && !isInspectMode) onClose();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="border border-white/5 rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center shadow-inner relative group">
              <img 
                src={receiptToShow.receipt_image || receiptToShow.receipt_image_url} 
                alt="Reçu de versement" 
                className="w-full h-full object-contain"
              />
              <a 
                href={receiptToShow.receipt_image || receiptToShow.receipt_image_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            </div>
            
            <div className="space-y-2.5 text-xs bg-slate-950 p-4 border border-white/5 rounded-xl font-semibold text-slate-350">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Chauffeur :</span>
                <span className="font-bold text-white">{receiptToShow.driver_name || receiptToShow.vehicle?.driver?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Montant :</span>
                <span className="font-extrabold text-emerald-400 font-mono">{(receiptToShow.amount || 0).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Réf unique :</span>
                <span className="font-mono text-white bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[10px]">{receiptToShow.transaction_reference}</span>
              </div>
              {receiptToShow.odometer && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Index Km :</span>
                  <span className="font-mono text-white">{receiptToShow.odometer} km</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Heure dépôt :</span>
                <span className="text-slate-450 font-medium font-mono text-[10px]">{receiptToShow.submitted_at || receiptToShow.payment_date}</span>
              </div>
            </div>

            <button
              onClick={handleBack}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-400/10 text-center active:scale-98 border-0"
            >
              Fermer l'inspecteur
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue console de validation des versements en attente
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-fade-in text-slate-100 flex flex-col max-h-[85vh]">
        
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50">
          <div>
            <h3 className="font-black text-white text-sm tracking-wide uppercase">Validation des versements</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{payments.length} versement(s) en attente d'approbation</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {payments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-slate-950/40">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
              <p className="text-xs text-white font-bold">Aucun versement en attente</p>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold font-sans">Toutes les déclarations de vos chauffeurs sont validées.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((pay) => {
                const vehiclePlate = pay.vehicle?.license_plate || 'N/A';
                const vehicleModel = pay.vehicle?.brand_model || '';
                const driverName = pay.driver_name || pay.vehicle?.driver?.name || 'Chauffeur inconnu';

                return (
                  <div key={pay.id} className="bg-slate-950 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors">
                    <div className="space-y-1.5 text-xs text-slate-300 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-xs">{driverName}</span>
                        {vehiclePlate && (
                          <span className="text-[9px] bg-slate-900 border border-white/15 text-amber-300 px-2 py-0.5 rounded font-mono font-bold whitespace-nowrap">
                            {vehiclePlate} {vehicleModel && `(${vehicleModel})`}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400">
                        <p>Montant : <strong className="text-emerald-400 font-mono font-bold">{(pay.amount || 0).toLocaleString()} FCFA</strong></p>
                        <p>Référence : <span className="font-mono text-white bg-slate-900 border border-white/5 px-1 py-0.5 rounded">{pay.transaction_reference}</span></p>
                        {pay.odometer && (
                          <p>Odomètre : <strong className="text-white font-mono">{pay.odometer} km</strong></p>
                        )}
                        <p className="text-[9px] text-slate-500">Soumis le {pay.submitted_at || pay.payment_date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 shrink-0">
                      <button 
                        onClick={() => setLocalInspectReceipt(pay)}
                        className="text-[10px] font-bold text-slate-355 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg border border-white/5 transition-all cursor-pointer flex items-center gap-1 active:scale-95 border-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Voir Reçu
                      </button>
                      <button 
                        onClick={() => onApprove(pay.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 shadow-sm shadow-emerald-600/10 border-0"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => onReject(pay.id)}
                        className="bg-red-500/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500/0 text-red-300 hover:text-white px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95"
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

        <div className="px-6 py-4 border-t border-white/5 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
          >
            Fermer la liste
          </button>
        </div>

      </div>
    </div>
  );
}
