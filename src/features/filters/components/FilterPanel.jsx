import { Beer } from 'lucide-react';

const SELECT_CLASS =
  'p-2.5 text-sm border border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white text-gray-800 focus:ring-2 focus:ring-euro-primary/50 focus:border-euro-primary transition-all duration-300 outline-none shadow-sm backdrop-blur-md cursor-pointer';

const BEER_TYPE_LABELS = {
  CLARA:   'Clara',
  OSCURA:  'Oscura',
  ÁMBAR:   'Ámbar',
  AMBER:   'Ámbar',
  NEGRA:   'Negra',
  BLANCA:  'Blanca',
  ROJA:    'Roja',
};

function beerTypeLabel(type) {
  return BEER_TYPE_LABELS[type] ?? type.charAt(0) + type.slice(1).toLowerCase();
}

export function FilterPanel({ filters, updateFilter, clearFilters, options, totalResults }) {
  const hasActiveFilters =
    filters.chain || filters.store_format || filters.state_normalized || filters.beer_type;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-euro-primary to-euro-accent mb-2 drop-shadow-sm">
          Filtros
        </h2>
        <p className="text-xs text-gray-500 mb-1 bg-gray-100/50 rounded-full px-3 py-1 inline-block backdrop-blur-sm border border-gray-200">
          Mostrando <span className="font-bold text-euro-dark">{totalResults}</span> tienda{totalResults !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Cadena */}
      <div className="flex flex-col gap-1.5 group">
        <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent">
          Cadena Comercial
        </label>
        <select
          className={SELECT_CLASS}
          value={filters.chain}
          onChange={(e) => updateFilter('chain', e.target.value)}
        >
          <option value="">Todas las cadenas</option>
          {options.chains.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Formato */}
      <div className="flex flex-col gap-1.5 group">
        <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent">
          Formato
        </label>
        <select
          className={SELECT_CLASS}
          value={filters.store_format}
          onChange={(e) => updateFilter('store_format', e.target.value)}
        >
          <option value="">Todos los formatos</option>
          {options.formats.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div className="flex flex-col gap-1.5 group">
        <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent">
          Estado
        </label>
        <select
          className={SELECT_CLASS}
          value={filters.state_normalized}
          onChange={(e) => updateFilter('state_normalized', e.target.value)}
        >
          <option value="">Todos los estados</option>
          {options.states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Tipo de cerveza */}
      {options.beerTypes.length > 0 && (
        <div className="flex flex-col gap-1.5 group">
          <label className="text-xs font-semibold text-gray-700 transition-colors group-focus-within:text-euro-accent flex items-center gap-1.5">
            <Beer size={13} className="text-euro-accent" />
            Tipo de Cerveza
          </label>
          <select
            className={SELECT_CLASS}
            value={filters.beer_type}
            onChange={(e) => updateFilter('beer_type', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {options.beerTypes.map(t => (
              <option key={t} value={t}>{beerTypeLabel(t)}</option>
            ))}
          </select>
          {filters.beer_type && (
            <p className="text-[10px] text-gray-400 pl-1">
              Solo tiendas con cerveza <span className="font-bold text-euro-accent">{beerTypeLabel(filters.beer_type)}</span> catalogada
            </p>
          )}
        </div>
      )}

      {/* Limpiar filtros */}
      <div className="mt-2 pt-4 border-t flex justify-end">
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="text-xs text-euro-accent hover:text-euro-dark font-semibold px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
