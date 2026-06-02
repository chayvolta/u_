export function KpiCard({ title, value, alert = false }) {
  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
      alert 
        ? 'bg-red-50/70 border-red-200 shadow-red-500/10' 
        : 'bg-white/70 border-white/50 shadow-black/5'
    }`}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-euro-dark'}`}>
        {value}
      </p>
    </div>
  );
}
