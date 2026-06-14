
export default function StatCard({ title, value, subtext, gradient }) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group">
      
      {/* Barre d'accentuation visuelle */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient || 'from-indigo-500 to-indigo-600'}`}></div>
      
      <div className="space-y-1.5 relative z-10">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block group-hover:text-slate-300 transition-colors">{title}</span>
        <span className="text-2xl font-black text-white font-mono tracking-tight block">
          {value}
        </span>
      </div>
      {subtext && (
        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400 font-bold tracking-wide">
          {subtext}
        </div>
      )}
    </div>
  );
}
