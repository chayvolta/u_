import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Beer, AlertTriangle, Store, Package } from 'lucide-react';

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

  const hasProducts = store.catalog_products && store.catalog_products.length > 0;

  return (
    <Marker
      position={[store.latitude, store.longitude]}
      eventHandlers={{
        click: () => {
          map.flyTo([store.latitude, store.longitude], 16, { duration: 1.2 });
        },
      }}
    >
      <Popup className="euro-popup" minWidth={260} maxWidth={320}>
        <div className="p-1 min-w-[240px]">

          {/* Header */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="bg-euro-primary/20 p-1.5 rounded-lg text-euro-primary flex-shrink-0">
              <Store size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-euro-dark text-[15px] leading-tight truncate">
                {store.chain}
              </p>
              <p className="text-xs text-gray-500 font-medium leading-tight">{store.center_name}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
              {store.store_format}
            </span>
            <span className="text-[10px] font-bold tracking-wider bg-euro-accent/10 text-euro-accent px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <MapPin size={10} />
              {store.municipality || store.state_normalized}
            </span>
          </div>

          {/* KPI Mini — productos totales */}
          <div className="bg-gradient-to-r from-euro-dark to-gray-800 rounded-xl p-2 flex items-center justify-between text-white shadow-md mb-3">
            <div className="flex items-center gap-2">
              <Beer size={16} className="text-euro-primary" />
              <span className="text-xs font-medium text-gray-300">Catálogo</span>
            </div>
            <span className="font-bold text-sm">
              {store.cataloged_products_count}{' '}
              <span className="text-[10px] text-gray-400 font-normal">prod.</span>
            </span>
          </div>

          {/* Lista de productos del JOIN */}
          {hasProducts && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Package size={12} className="text-euro-accent" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-euro-accent">
                  Productos catalogados ({store.catalog_products.length})
                </p>
              </div>
              <div
                className="overflow-y-auto rounded-lg border border-gray-100 bg-gray-50"
                style={{ maxHeight: '160px' }}
              >
                {store.catalog_products.map((prod, idx) => (
                  <div
                    key={prod.upc || idx}
                    className={`px-2 py-1.5 ${
                      idx < store.catalog_products.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-gray-800 leading-snug">
                      {prod.description}
                    </p>
                    {prod.upc && (
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                        UPC: {prod.upc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advertencia si aplica */}
          {store.needs_review && (
            <div className="mt-2 flex items-start gap-1.5 text-red-500 bg-red-50 p-1.5 rounded-lg border border-red-100">
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
