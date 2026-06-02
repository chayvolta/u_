export function FilterPanel({ filters, updateFilter, clearFilters, options, totalResults }) {
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-euro-primary to-euro-accent mb-2 drop-shadow-sm">Filtros</h2>
        <p className="text-xs text-gray-500 mb-4 bg-gray-100/50 rounded-full px-3 py-1 inline-block backdrop-blur-sm border border-gray-200">
          Mostrando <span className="font-bold text-euro-dark">{totalResults}</span> tienda{totalResults !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 group">
        <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent">Cadena Comercial</label>
        <select 
          className="p-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white text-gray-800 focus:ring-2 focus:ring-euro-primary/50 focus:border-euro-primary transition-all duration-300 outline-none shadow-sm backdrop-blur-md cursor-pointer"
          value={filters.chain}
          onChange={(e) => updateFilter('chain', e.target.value)}
        >
          <option value="">Todas las cadenas</option>
          {options.chains.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 group">
        <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent">Formato</label>
        <select 
          className="p-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white text-gray-800 focus:ring-2 focus:ring-euro-primary/50 focus:border-euro-primary transition-all duration-300 outline-none shadow-sm backdrop-blur-md cursor-pointer"
          value={filters.store_format}
          onChange={(e) => updateFilter('store_format', e.target.value)}
        >
          <option value="">Todos los formatos</option>
          {options.formats.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 group">
        <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent">Estado</label>
        <select 
          className="p-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white text-gray-800 focus:ring-2 focus:ring-euro-primary/50 focus:border-euro-primary transition-all duration-300 outline-none shadow-sm backdrop-blur-md cursor-pointer"
          value={filters.state_normalized}
          onChange={(e) => updateFilter('state_normalized', e.target.value)}
        >
          <option value="">Todos los estados</option>
          {options.states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input 
          type="checkbox" 
          id="needs_review"
          checked={filters.needs_review}
          onChange={(e) => updateFilter('needs_review', e.target.checked)}
          className="w-4 h-4 text-euro-accent rounded focus:ring-euro-primary"
        />
        <label htmlFor="needs_review" className="text-sm text-gray-700 cursor-pointer">
          Solo tiendas con advertencias
        </label>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-end">
        <button 
          onClick={clearFilters}
          className="text-xs text-euro-accent hover:text-euro-dark font-semibold px-2 py-1"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
