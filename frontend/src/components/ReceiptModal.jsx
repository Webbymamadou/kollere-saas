import { X } from 'lucide-react';

export default function ReceiptModal({ selectedReceipt, setSelectedReceipt }) {
  if (!selectedReceipt) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-fade-in">
        
        <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-xs tracking-wider">Visualisation du reçu</h3>
          <button 
            onClick={() => setSelectedReceipt(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="border border-slate-100 rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center shadow-inner">
            <img 
              src={selectedReceipt.receipt_image} 
              alt="Reçu Wave/OM" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-2.5 text-xs bg-slate-50 p-4 border border-slate-100 rounded-xl font-semibold text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Chauffeur :</span>
              <span className="font-bold text-slate-800">{selectedReceipt.driver_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Montant :</span>
              <span className="font-extrabold text-emerald-600 font-mono">{selectedReceipt.amount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Réf unique :</span>
              <span className="font-mono text-slate-800 bg-white border border-slate-200/50 px-1.5 py-0.5 rounded text-[10px]">{selectedReceipt.transaction_reference}</span>
            </div>
            {selectedReceipt.odometer && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Index Km :</span>
                <span className="font-mono text-slate-800">{selectedReceipt.odometer} km</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Heure dépôt :</span>
              <span className="text-slate-500 font-medium font-mono text-[10px]">{selectedReceipt.submitted_at}</span>
            </div>
          </div>

          <button
            onClick={() => setSelectedReceipt(null)}
            className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#6D4AFF]/10 text-center active:scale-98"
          >
            Fermer l'inspecteur
          </button>
        </div>
      </div>
    </div>
  );
}
