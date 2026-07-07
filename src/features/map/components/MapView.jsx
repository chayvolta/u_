import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { StoreMarker } from './StoreMarker';
import { DEFAULT_CENTER, DEFAULT_ZOOM, getStoresBounds } from '../../../lib/mapUtils';

// ── Icono de cluster premium ─────────────────────────────────
function createClusterIcon(cluster) {
  const count = cluster.getChildCount();

  // Tamaño escalonado según densidad
  let size, fontSize, ringSize;
  if (count < 5)        { size = 40; fontSize = 13; ringSize = 50; }
  else if (count < 15)  { size = 46; fontSize = 14; ringSize = 58; }
  else if (count < 40)  { size = 52; fontSize = 15; ringSize = 66; }
  else                  { size = 58; fontSize = 16; ringSize = 74; }

  const html = `
    <div class="euro-cluster" style="width:${size}px;height:${size}px;">
      <div class="euro-cluster__ring" style="width:${ringSize}px;height:${ringSize}px;"></div>
      <span class="euro-cluster__count" style="font-size:${fontSize}px;">${count}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
  });
}

// ── Ajustar bounds al cambiar filtros ────────────────────────
function FitStoreBounds({ stores, userLocation }) {
  const map = useMap();
  const fittedOnceRef = useRef(false);

  const boundsKey = `${stores.map(s => s.id).join('|')}|${userLocation?.lat ?? ''}`;
  const bounds = useMemo(() => {
    const storeBounds = getStoresBounds(stores) ?? [];
    const userPoint = userLocation ? [[userLocation.lat, userLocation.lng]] : [];
    const points = [...storeBounds, ...userPoint];
    return points.length ? points : null;
  }, [boundsKey, stores, userLocation]);

  useEffect(() => {
    if (!fittedOnceRef.current && bounds?.length) {
      fittedOnceRef.current = true;
      map.invalidateSize({ animate: false });
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: false });
      } else {
        map.setView(bounds[0], 14, { animate: false });
      }
    }
  }, [bounds, map]);

  return null;
}

// ── Botón "Vista General" ────────────────────────────────────
function ResetViewControl({ stores, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'topright' });

    control.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-control map-ctrl');
      const button = L.DomUtil.create('button', 'map-ctrl-btn', container);
      button.type = 'button';
      button.title = 'Restablecer vista general';
      button.setAttribute('aria-label', 'Restablecer vista general');
      button.innerHTML = `
        <svg aria-hidden="true" class="map-ctrl-icon" viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
      `;
      const label = L.DomUtil.create('span', 'map-ctrl-label', container);
      label.textContent = 'Vista general';

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.preventDefault(e);
        map.closePopup();
        const storeBounds = getStoresBounds(stores) ?? [];
        const userPoint = userLocation ? [[userLocation.lat, userLocation.lng]] : [];
        const points = [...storeBounds, ...userPoint];
        if (points.length > 1) {
          map.flyToBounds(points, { padding: [50, 50], maxZoom: 14, duration: 1.2 });
        } else if (points.length === 1) {
          map.flyTo(points[0], 14, { duration: 1.2 });
        } else {
          map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
        }
      });
      return container;
    };

    control.addTo(map);
    return () => control.remove();
  }, [map, stores, userLocation]);

  return null;
}

// ── Botón "Mi ubicación" ─────────────────────────────────────
function UserLocationControl({ hasLocation, loading, onRequestLocation, onClearLocation }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'topright' });

    control.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-control map-ctrl');
      const button = L.DomUtil.create(
        'button',
        `map-ctrl-btn map-ctrl-btn--location${hasLocation ? ' is-active' : ''}`,
        container
      );
      button.type = 'button';
      button.title = hasLocation ? 'Quitar mi ubicación' : 'Usar mi ubicación';
      button.setAttribute('aria-label', hasLocation ? 'Quitar mi ubicación' : 'Usar mi ubicación');
      button.setAttribute('aria-busy', loading ? 'true' : 'false');
      button.innerHTML = `
        <svg aria-hidden="true" class="map-ctrl-icon map-ctrl-icon--fill" viewBox="0 0 24 24" focusable="false">
          <path fill="currentColor" fill-rule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      const label = L.DomUtil.create('span', 'map-ctrl-label', container);
      label.textContent = 'Mi ubicación';

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.preventDefault(e);
        if (loading) return;
        if (hasLocation) onClearLocation();
        else onRequestLocation();
      });

      return container;
    };

    control.addTo(map);
    return () => control.remove();
  }, [hasLocation, loading, map, onClearLocation, onRequestLocation]);

  return null;
}

// ── Fly to user + nearest store ──────────────────────────────
function FlyToUserAndNearest({ userLocation, nearestStore }) {
  const map = useMap();
  const prevLocationRef = useRef(null);

  useEffect(() => {
    if (!userLocation) return;
    if (
      prevLocationRef.current?.lat === userLocation.lat &&
      prevLocationRef.current?.lng === userLocation.lng
    ) return;
    prevLocationRef.current = userLocation;

    const userPoint = [userLocation.lat, userLocation.lng];
    if (nearestStore?.latitude && nearestStore?.longitude) {
      const storePoint = [nearestStore.latitude, nearestStore.longitude];
      const bounds = L.latLngBounds([userPoint, storePoint]);
      map.flyToBounds(bounds, { padding: [80, 80], duration: 1.5, maxZoom: 15 });
    } else {
      map.flyTo(userPoint, 14, { duration: 1.5 });
    }
  }, [userLocation, nearestStore, map]);

  return null;
}

// ── Marcador del usuario ─────────────────────────────────────
function UserLocationMarker({ location }) {
  if (!location) return null;

  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      className="user-location-marker"
      pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 0.85, weight: 3 }}
      radius={10}
    >
      <Popup>
        <div className="font-sans text-sm font-bold text-slate-900">Tu ubicación aproximada</div>
      </Popup>
    </CircleMarker>
  );
}

// ── Componente principal ─────────────────────────────────────
export function MapView({
  stores,
  loading,
  userLocation,
  userLocationLoading,
  onRequestUserLocation,
  onClearUserLocation,
  nearestStore,
  onSelectProduct,
}) {
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
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitStoreBounds stores={stores} userLocation={userLocation} />
        <ResetViewControl stores={stores} userLocation={userLocation} />
        <UserLocationControl
          hasLocation={Boolean(userLocation)}
          loading={userLocationLoading}
          onRequestLocation={onRequestUserLocation}
          onClearLocation={onClearUserLocation}
        />
        <FlyToUserAndNearest userLocation={userLocation} nearestStore={nearestStore} />
        <UserLocationMarker location={userLocation} />

        {/* ── Cluster premium ──────────────────────────────── */}
        <MarkerClusterGroup
          iconCreateFunction={createClusterIcon}
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          animate
          animateAddingMarkers={false}
          removeOutsideVisibleBounds
        >
          {stores.map((store) => (
            <StoreMarker
              key={store.id}
              store={store}
              isNearest={Boolean(nearestStore && nearestStore.id === store.id)}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
