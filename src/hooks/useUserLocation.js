import { useCallback, useState } from 'react'

function getGeolocationErrorMessage(error) {
  if (error?.code === 1) return 'Permiso de ubicación rechazado.'
  if (error?.code === 2) return 'No se pudo determinar tu ubicación.'
  if (error?.code === 3) return 'La solicitud de ubicación tardó demasiado.'
  return 'Tu navegador no permitió obtener la ubicación.'
}

export function useUserLocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Este navegador no soporta geolocalización.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLoading(false)
      },
      (geolocationError) => {
        setError(getGeolocationErrorMessage(geolocationError))
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 12000,
      },
    )
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(null)
    setError(null)
    setLoading(false)
  }, [])

  return { location, loading, error, requestLocation, clearLocation }
}
