import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { StoreMarker } from './StoreMarker';

// Centro geográfico de México aproximadamente
const DEFAULT_CENTER = [23.6345, -102.5528];
const DEFAULT_ZOOM = 5;

// Auto-zoom a las tiendas filtradas
function MapUpdater({ stores }) {
  const map = useMap();

  useEffect(() => {
    if (!stores || stores.length === 0) return;
    
    // Extraer lat/lng válidos
    const validStores = stores.filter(s => s.latitude && s.longitude);
    if (validStores.length === 0) return;

    const bounds = L.latLngBounds(validStores.map(s => [s.latitude, s.longitude]));
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5, maxZoom: 15 });
    }
  }, [stores, map]);

  return null;
}

// Componente para Reset View
function ResetViewButton() {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[400]">
      <button 
        onClick={() => map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.5 })}
        className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200 text-euro-dark hover:text-euro-accent hover:bg-white transition-all group flex items-center justify-center"
        title="Vista General"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
      </button>
    </div>
  );
}

export function MapView({ stores, loading }) {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-euro-accent font-semibold">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResetViewButton />
        <MapUpdater stores={stores} />
        {stores.map((store) => (
          <StoreMarker key={store.id} store={store} />
        ))}
      </MapContainer>
    </div>
  );
}
