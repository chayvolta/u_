import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { buildGoogleMapsDirectionsUrl } from '../../../lib/mapUtils';

export function NearestStoreCard({ nearestStore, userLocation, onFlyToStore }) {
  const directionsUrl = nearestStore
    ? buildGoogleMapsDirectionsUrl(nearestStore.latitude, nearestStore.longitude)
    : null;

  return (
    <div className="rounded-2xl border border-euro-accent/20 bg-gradient-to-br from-euro-accent/5 to-white p-4 shadow-sm backdrop-blur-sm">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-euro-accent">
          <Navigation size={12} className="inline mr-1 -mt-0.5" />
          Tienda más cercana
        </p>
        {nearestStore ? (
          <div className="mt-2">
            <p className="font-extrabold text-euro-dark text-sm leading-tight">
              {nearestStore.center_name}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {nearestStore.chain}
              </span>
              <span className="shrink-0 rounded-full bg-euro-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {nearestStore.distanceLabel}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs font-semibold text-gray-500">
            Activa tu ubicación para encontrarla
          </p>
        )}
      </div>

      {userLocation?.accuracy ? (
        <p className="mt-2 text-[10px] text-gray-400 text-center">
          Precisión: ~{Math.round(userLocation.accuracy).toLocaleString('es-MX')} m
        </p>
      ) : null}

      {nearestStore ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="min-h-9 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-euro-dark border border-gray-200 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md flex items-center justify-center gap-1"
            onClick={() => onFlyToStore && onFlyToStore(nearestStore)}
            type="button"
          >
            <MapPin size={12} /> Ver en mapa
          </button>
          <a
            className="min-h-9 inline-flex items-center justify-center rounded-xl bg-euro-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-euro-accent/90 hover:shadow-md gap-1"
            href={directionsUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink size={12} /> Cómo llegar
          </a>
        </div>
      ) : null}
    </div>
  );
}
