import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Beer, AlertTriangle, Store } from 'lucide-react';

// Arreglar iconos default de Leaflet en React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export function StoreMarker({ store }) {
  const map = useMap();

  if (!store.latitude || !store.longitude) return null;

  return (
    <Marker 
      position={[store.latitude, store.longitude]}
      eventHandlers={{
        click: () => {
          map.flyTo([store.latitude, store.longitude], 16, { duration: 1.2 });
        }
      }}
    >
      <Popup className="euro-popup">
        <div className="p-1 min-w-[220px]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="bg-euro-primary/20 p-1.5 rounded-lg text-euro-primary">
              <Store size={18} />
            </div>
            <div>
              <p className="font-extrabold text-euro-dark text-[15px] leading-tight">{store.chain}</p>
              <p className="text-xs text-gray-500 font-medium">{store.center_name}</p>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
              {store.store_format}
            </span>
            <span className="text-[10px] font-bold tracking-wider bg-euro-accent/10 text-euro-accent px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <MapPin size={10} /> {store.state_normalized}
            </span>
          </div>
          
          {/* KPI Mini */}
          <div className="bg-gradient-to-r from-euro-dark to-gray-800 rounded-xl p-2 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-2">
              <Beer size={16} className="text-euro-primary" />
              <span className="text-xs font-medium text-gray-300">Catálogo</span>
            </div>
            <span className="font-bold text-sm">{store.cataloged_products_count} <span className="text-[10px] text-gray-400 font-normal">prod.</span></span>
          </div>

          {/* Advertencia si aplica */}
          {store.needs_review && (
            <div className="mt-3 flex items-start gap-1.5 text-red-500 bg-red-50 p-1.5 rounded-lg border border-red-100">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-semibold leading-tight">
                Coordenadas bajo revisión (posible desvío).
              </p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
