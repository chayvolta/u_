import { useState } from 'react';
import { MapView } from '../features/map/components/MapView';
import { useStoresMapData } from '../features/map/hooks/useStoresMapData';
import { useStoreFilters } from '../features/filters/hooks/useStoreFilters';
import { useUserLocation } from '../hooks/useUserLocation';
import { FilterPanel } from '../features/filters/components/FilterPanel';
import { DashboardPanel } from '../features/dashboard/components/DashboardPanel';
import { NearestStoreCard } from '../features/map/components/NearestStoreCard';
import { calculateDistanceKm, formatDistanceKm } from '../lib/mapUtils';

export function App() {
  const { stores, loading } = useStoresMapData();
  const { filters, updateFilter, clearFilters, filteredStores, options } = useStoreFilters(stores);
  const userLoc = useUserLocation();
  const [activeTab, setActiveTab] = useState('filters');

  // Enriquecer tiendas con distancia si hay ubicación del usuario
  const visibleStores = userLoc.location
    ? filteredStores
        .map((store) => {
          if (!store.latitude || !store.longitude) return { ...store, distanceKm: null, distanceLabel: 'Sin coordenadas' };
          const distanceKm = calculateDistanceKm(userLoc.location, { lat: store.latitude, lng: store.longitude });
          return { ...store, distanceKm, distanceLabel: formatDistanceKm(distanceKm) };
        })
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    : filteredStores;

  const nearestStore = userLoc.location ? visibleStores[0] ?? null : null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-euro-dark text-white font-sans">
      {/* Header premium */}
      <header className="h-16 flex justify-between items-center px-6 border-b border-white/10 bg-gradient-to-r from-black to-euro-dark shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-euro-primary to-euro-accent shadow-[0_0_15px_rgba(230,161,29,0.5)] flex items-center justify-center">
            <span className="font-bold text-black leading-none">E</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-wide">Eurocervezas Geoportal</h1>
          <span className="ml-2 text-[10px] uppercase tracking-wider bg-euro-accent/20 border border-euro-accent/50 px-2 py-0.5 rounded-full text-euro-accent font-bold backdrop-blur-md">BETA</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex">
        {/* Panel lateral con pestañas tipo Glassmorphism */}
        <aside className="w-[340px] bg-white/95 text-euro-dark border-r border-white/20 hidden md:flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.3)] z-20 backdrop-blur-xl transition-all duration-300">
          
          {/* Navegación de Pestañas */}
          <div className="flex p-2 bg-gray-100/50 m-4 rounded-xl backdrop-blur-sm border border-gray-200/50">
            <button 
              onClick={() => setActiveTab('filters')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'filters' 
                  ? 'bg-white text-euro-accent shadow-sm scale-100' 
                  : 'text-gray-500 hover:text-gray-700 scale-95 hover:scale-100'
              }`}
            >
              Filtros
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-euro-accent shadow-sm scale-100' 
                  : 'text-gray-500 hover:text-gray-700 scale-95 hover:scale-100'
              }`}
            >
              Dashboard
            </button>
          </div>

          {/* Contenido Dinámico */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
            {activeTab === 'filters' ? (
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
            ) : (
              <DashboardPanel stores={visibleStores} />
            )}
          </div>
        </aside>

        {/* Mapa */}
        <section className="flex-1 relative z-10 bg-gray-100">
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
      </main>
    </div>
  );
}
