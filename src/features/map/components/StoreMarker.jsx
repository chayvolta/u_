import { Popup, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Beer, Store, Package, ExternalLink } from 'lucide-react';
import { buildGoogleMapsDirectionsUrl } from '../../../lib/mapUtils';

// ── Paleta por cadena (inspirado en Maki / Felt) ────────────
// Colores curados para máxima legibilidad sobre mapas claros
const CHAIN_COLORS = {
  'Chedraui': { fill: '#D97706', ring: '#FEF3C7', label: '#fff' },
  'La Comer':  { fill: '#0E7490', ring: '#CFFAFE', label: '#fff' },
  default:     { fill: '#475569', ring: '#E2E8F0', label: '#fff' },
};

function getColors(chain) {
  return CHAIN_COLORS[chain] ?? CHAIN_COLORS.default;
}

// ── SVG limpio estilo Maki/Felt ──────────────────────────────
// Diseño: círculo sólido + borde blanco grueso + sombra + dot si tiene catálogo
function buildMarkerSvg(colors, hasCatalog, size = 28) {
  const { fill, label } = colors;
  const r = size / 2;
  const inner = r - 4; // radio del círculo interior
  const stroke = 3;    // grosor del borde blanco

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${size}" height="${size}"
     viewBox="0 0 ${size} ${size}">
  <defs>
    <filter id="sh-${fill.replace('#','')}" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.28)" flood-opacity="1"/>
    </filter>
  </defs>
  <!-- Borde blanco -->
  <circle
    cx="${r}" cy="${r}" r="${inner + stroke / 2}"
    fill="white"
    filter="url(#sh-${fill.replace('#','')})" 
  />
  <!-- Círculo principal -->
  <circle
    cx="${r}" cy="${r}" r="${inner - stroke / 2}"
    fill="${fill}"
  />
  <!-- Dot central blanco -->
  <circle cx="${r}" cy="${r}" r="${inner * 0.28}" fill="${label}" opacity="0.9"/>
  <!-- Indicador de catálogo: pequeño anillo verde -->
  ${hasCatalog ? `
  <circle cx="${size - 6}" cy="6" r="4.5" fill="#16a34a" stroke="white" stroke-width="1.5"/>
  ` : ''}
</svg>`.trim();
}

// ── Crear DivIcon ────────────────────────────────────────────
export function createStoreIcon(store, isNearest = false) {
  const colors    = getColors(store.chain);
  const hasCat    = (store.catalog_products?.length ?? 0) > 0;
  // La tienda más cercana es siempre un poco más grande
  const size      = isNearest ? 34 : hasCat ? 30 : 26;
  const svg       = buildMarkerSvg(colors, hasCat, size);
  const halfSize  = size / 2;

  // Wrapper: si es la más cercana, añade el anillo pulsante
  const nearestRing = isNearest
    ? `<div class="pulse-ring" style="width:${size}px;height:${size}px;border-color:${colors.fill};"></div>`
    : '';

  return L.divIcon({
    html: `<div class="euro-dot-wrap${isNearest ? ' euro-dot-nearest' : ''}">${nearestRing}${svg}</div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [halfSize, halfSize],
    popupAnchor:[0, -(halfSize + 6)],
  });
}

// ── Marcador ─────────────────────────────────────────────────
export function StoreMarker({ store, isNearest = false }) {
  const map = useMap();

  if (!store.latitude || !store.longitude) return null;

  const icon        = createStoreIcon(store, isNearest);
  const hasProducts = (store.catalog_products?.length ?? 0) > 0;

  return (
    <Marker
      position={[store.latitude, store.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => map.flyTo([store.latitude, store.longitude], 16, { duration: 1.0 }),
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

          {/* KPI — catálogo */}
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

          {/* Lista de productos */}
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
                    key={idx}
                    className={`px-2 py-1.5 ${
                      idx < store.catalog_products.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-gray-800 leading-snug">
                      {prod.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón Cómo llegar */}
          <a
            href={buildGoogleMapsDirectionsUrl(store.latitude, store.longitude)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-euro-accent px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-euro-accent/90 hover:shadow-md"
          >
            <ExternalLink size={12} />
            Cómo llegar
          </a>
        </div>
      </Popup>
    </Marker>
  );
}
