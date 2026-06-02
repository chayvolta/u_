import { useState, useEffect } from 'react';
import { mockStores } from '../../../data/mockStores';

export function useStoresMapData() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de red y filtrar tiendas que tienen coordenadas válidas
    const loadData = async () => {
      setLoading(true);
      try {
        // En el futuro, aquí se conectará a storesService.js (Supabase)
        const geocodedStores = mockStores.filter(
          store => store.latitude !== null && store.longitude !== null
        );
        setStores(geocodedStores);
      } catch (error) {
        console.error("Error al cargar tiendas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { stores, loading };
}
