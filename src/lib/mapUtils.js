export const DEFAULT_CENTER = [23.6345, -102.5528]
export const DEFAULT_ZOOM = 5

export function isValidCoordinate(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

export function calculateDistanceKm(origin, destination) {
  if (!origin || !destination) return null
  if (!isValidCoordinate(origin.lat, origin.lng)) return null
  if (!isValidCoordinate(destination.lat, destination.lng)) return null

  const earthRadiusKm = 6371
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const deltaLat = toRadians(destination.lat - origin.lat)
  const deltaLng = toRadians(destination.lng - origin.lng)
  const originLat = toRadians(origin.lat)
  const destinationLat = toRadians(destination.lat)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistanceKm(distanceKm) {
  if (!Number.isFinite(distanceKm)) return 'Distancia no disponible'
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000).toLocaleString('es-MX')} m aprox.`
  return `${distanceKm.toLocaleString('es-MX', { maximumFractionDigits: 1 })} km aprox.`
}

export function buildGoogleMapsDirectionsUrl(lat, lng) {
  if (!isValidCoordinate(lat, lng)) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function getStoresBounds(stores) {
  const points = stores
    .filter((s) => s.latitude && s.longitude && isValidCoordinate(s.latitude, s.longitude))
    .map((s) => [s.latitude, s.longitude])

  return points.length ? points : null
}
