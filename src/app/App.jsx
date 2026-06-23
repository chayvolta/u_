import { useState, useCallback } from 'react';
import { SlidersHorizontal, X, MapPin, Navigation } from 'lucide-react';
import { useStoresMapData } from '../features/map/hooks/useStoresMapData';
import { useStoreFilters } from '../features/filters/hooks/useStoreFilters';
import { useUserLocation } from '../hooks/useUserLocation';
import { MapView } from '../features/map/components/MapView';
import { FilterPanel } from '../features/filters/components/FilterPanel';
import { NearestStoreCard } from '../features/map/components/NearestStoreCard';
import { calculateDistanceKm, formatDistanceKm } from '../lib/mapUtils';

export function App() {
  const { stores, loading } = useStoresMapData();
  const { filters, updateFilter, clearFilters, filteredStores, options } = useStoreFilters(stores);
  const userLoc = useUserLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Enriquecer tiendas con distancia si hay ubicación del usuario
  const visibleStores = userLoc.location
    ? filteredStores
        .map((store) => {
          if (!store.latitude || !store.longitude)
            return { ...store, distanceKm: null, distanceLabel: 'Sin coordenadas' };
          const distanceKm = calculateDistanceKm(userLoc.location, {
            lat: store.latitude,
            lng: store.longitude,
          });
          return { ...store, distanceKm, distanceLabel: formatDistanceKm(distanceKm) };
        })
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    : filteredStores;

  const nearestStore = userLoc.location ? visibleStores[0] ?? null : null;

  // Contar filtros activos para la insignia del FAB
  const activeFilterCount = [
    filters.chain,
    filters.store_format,
    filters.state_normalized,
    filters.beer_type,
  ].filter(Boolean).length;

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Panel lateral compartido entre desktop y mobile drawer
  const SideContent = (
    <div className="flex flex-col gap-5">
      <FilterPanel
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        options={options}
        totalResults={visibleStores.length}
      />

      {/* Sección de ubicación */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="min-h-9 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-1"
            disabled={userLoc.loading}
            onClick={userLoc.requestLocation}
            type="button"
          >
            {userLoc.loading ? 'Ubicando...' : '📍 Usar mi ubicación'}
          </button>
          <button
            className="min-h-9 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
            disabled={!userLoc.location}
            onClick={userLoc.clearLocation}
            type="button"
          >
            Quitar ubicación
          </button>
        </div>

        {userLoc.error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            {userLoc.error}
          </p>
        )}

        <NearestStoreCard
          nearestStore={nearestStore}
          userLocation={userLoc.location}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-euro-dark text-white font-sans">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="h-14 md:h-16 flex justify-between items-center px-4 md:px-6 border-b border-white/10 bg-gradient-to-r from-black to-euro-dark shadow-md z-30 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-euro-primary to-euro-accent shadow-[0_0_15px_rgba(230,161,29,0.5)] flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-black leading-none text-sm">E</span>
          </div>
          <h1 className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-wide truncate">
            Eurocervezas Geoportal
          </h1>
          <span className="hidden sm:inline ml-1 text-[10px] uppercase tracking-wider bg-euro-accent/20 border border-euro-accent/50 px-2 py-0.5 rounded-full text-euro-accent font-bold backdrop-blur-md flex-shrink-0">
            BETA
          </span>
        </div>

        {/* Contador de tiendas en header — solo mobile */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-400">
            <span className="text-white font-bold">{visibleStores.length}</span> tiendas
          </span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 relative flex overflow-hidden min-h-0">

        {/* ── Panel lateral — SOLO DESKTOP (md+) ──────────── */}
        <aside className="w-[340px] bg-white/95 text-euro-dark border-r border-white/20 hidden md:flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.3)] z-20 backdrop-blur-xl">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {SideContent}
          </div>
        </aside>

        {/* ── Mapa (full-screen en mobile) ─────────────────── */}
        <section className="flex-1 relative z-10 bg-gray-100 min-h-0">
          <MapView
            stores={visibleStores}
            loading={loading}
            userLocation={userLoc.location}
            userLocationLoading={userLoc.loading}
            onRequestUserLocation={userLoc.requestLocation}
            onClearUserLocation={userLoc.clearLocation}
            nearestStore={nearestStore}
          />
        </section>

        {/* ── Overlay oscuro al abrir drawer — SOLO MOBILE ── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
        )}

        {/* ── Bottom Drawer — SOLO MOBILE ───────────────────── */}
        <div
          className={`
            fixed bottom-0 left-0 right-0 z-50 md:hidden
            bg-white text-euro-dark rounded-t-3xl shadow-2xl
            transition-transform duration-300 ease-out
            ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
          style={{ maxHeight: '82dvh' }}
          role="dialog"
          aria-label="Panel de filtros"
          aria-modal="true"
        >
          {/* Handle de arrastre visual */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Cabecera del drawer */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-euro-accent" />
              <span className="font-bold text-euro-dark text-sm">Filtros y Ubicación</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-euro-accent text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              onClick={closeDrawer}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Cerrar filtros"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Contenido scrollable */}
          <div className="mobile-drawer-scroll overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(82dvh - 90px)' }}>
            {SideContent}
          </div>
        </div>
      </main>

      {/* ── FAB de filtros — SOLO MOBILE ──────────────────── */}
      <div className="mobile-fab-area md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-3">
        {/* Botón principal de filtros */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-euro-dark text-white font-bold text-sm shadow-2xl border border-white/10 active:scale-95 transition-transform"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(230,161,29,0.3)' }}
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal size={16} className="text-euro-primary" />
          <span>Filtros</span>
          {activeFilterCount > 0 ? (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-euro-accent text-white text-[10px] font-bold -mr-1">
              {activeFilterCount}
            </span>
          ) : (
            <span className="text-[11px] text-gray-400 font-normal -mr-1">
              {visibleStores.length} tiendas
            </span>
          )}
        </button>

        {/* Botón rápido de ubicación */}
        <button
          onClick={userLoc.location ? userLoc.clearLocation : userLoc.requestLocation}
          disabled={userLoc.loading}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border transition-all active:scale-95 ${
            userLoc.location
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-euro-dark border-white/10 text-gray-300'
          }`}
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          aria-label={userLoc.location ? 'Quitar ubicación' : 'Usar mi ubicación'}
        >
          {userLoc.loading ? (
            <span className="animate-spin text-xs">⟳</span>
          ) : (
            <Navigation size={18} className={userLoc.location ? 'text-white' : 'text-gray-400'} />
          )}
        </button>
      </div>
    </div>
  );
}
