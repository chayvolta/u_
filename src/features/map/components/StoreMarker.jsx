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
export function StoreMarker({ store, isNearest = false, onSelectProduct }) {
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
      <Popup className="euro-popup" minWidth={280} maxWidth={340}>
        <div className="p-0.5 text-white flex flex-col gap-3.5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-euro-primary/20 to-euro-primary/5 border border-euro-primary/30 p-2.5 rounded-xl text-euro-primary flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-black text-white text-[17px] leading-tight truncate tracking-tight">
                {store.chain}
              </h3>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed mt-1 truncate">{store.center_name}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold tracking-wider bg-white/5 border border-white/10 text-neutral-300 px-2 py-1 rounded-md uppercase">
              {store.store_format}
            </span>
            <span className="text-[10px] font-bold tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md uppercase flex items-center gap-1">
              <MapPin size={10} strokeWidth={3} />
              {store.municipality || store.state_normalized}
            </span>
          </div>

          {/* KPI — catálogo */}
          <div className="bg-neutral-950/60 border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-euro-primary/10 p-1.5 rounded-lg text-euro-primary">
                 <Beer size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-neutral-300">Cervezas catalogadas</span>
            </div>
            <span className="font-black text-lg text-euro-primary drop-shadow-md">
              {store.cataloged_products_count}
            </span>
          </div>

          {/* Lista de productos */}
          {hasProducts && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-1">
                <Package size={12} className="text-neutral-400" strokeWidth={2.5} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Top Productos
                </p>
              </div>
              
              <div className="overflow-y-auto euro-popup-scroll rounded-xl bg-neutral-950/40 border border-white/5 p-1.5" style={{ maxHeight: '180px' }}>
                {store.catalog_products.map((prod, idx) => (
                  <div
                    key={idx}
                    className="group relative p-2.5 rounded-lg flex items-center justify-between gap-3 hover:bg-white/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/10"
                    onClick={() => onSelectProduct && onSelectProduct(prod)}
                  >
                    <p className="text-[11px] font-semibold text-neutral-200 leading-snug line-clamp-2 pr-1">
                      {prod.description}
                    </p>
                    <button
                      type="button"
                      className="shrink-0 bg-euro-primary/10 text-euro-primary group-hover:bg-euro-primary group-hover:text-neutral-900 border border-euro-primary/30 px-3 py-1.5 rounded-full text-[10px] font-black transition-all duration-300 whitespace-nowrap shadow-sm"
                    >
                      Ver más
                    </button>
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
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-neutral-200 text-neutral-950 py-3 text-[13px] font-black shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <ExternalLink size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            Cómo llegar
          </a>
        </div>
      </Popup>
    </Marker>
  );
}
