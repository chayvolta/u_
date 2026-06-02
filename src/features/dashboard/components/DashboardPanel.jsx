import { KpiCard } from './KpiCard';

export function DashboardPanel({ stores }) {
  const totalStores = stores.length;
  
  // Calcular promedios y contadores
  const storesNeedsReview = stores.filter(s => s.needs_review).length;
  const avgCatalog = totalStores > 0 
    ? Math.round(stores.reduce((acc, curr) => acc + curr.cataloged_products_count, 0) / totalStores)
    : 0;

  // Agrupar por cadena
  const chainCounts = stores.reduce((acc, store) => {
    acc[store.chain] = (acc[store.chain] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-euro-primary to-euro-accent mb-2 drop-shadow-sm">Dashboard</h2>
        <p className="text-xs text-gray-500 mb-4">Métricas de las tiendas actuales en vista.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiCard title="Total Tiendas" value={totalStores} />
        <KpiCard title="Promedio Catálogo" value={avgCatalog} />
        <KpiCard 
          title="Por Revisar" 
          value={storesNeedsReview} 
          alert={storesNeedsReview > 0} 
        />
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-euro-dark mb-3">Distribución por Cadena</h3>
        <div className="flex flex-col gap-2">
          {Object.entries(chainCounts).sort((a,b) => b[1]-a[1]).map(([chain, count]) => (
            <div key={chain} className="flex items-center justify-between bg-white/50 p-2 rounded-xl border border-white/40 shadow-sm backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
              <span className="text-sm font-medium text-gray-700">{chain}</span>
              <span className="text-sm font-bold text-euro-accent bg-euro-accent/10 px-2 py-0.5 rounded-full">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
