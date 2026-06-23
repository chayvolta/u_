import { useState, useMemo } from 'react';

// Extrae el tipo de cerveza de la descripción (la palabra después de "CERVEZA ")
// Ej: "CERVEZA CLARA KOZEL..." → "CLARA"
function extractBeerType(description) {
  if (!description) return null;
  const match = description.toUpperCase().match(/^CERVEZA\s+([A-ZÁÉÍÓÚÑÜ]+)/);
  return match ? match[1] : null;
}

export function useStoreFilters(stores) {
  const [filters, setFilters] = useState({
    chain: '',
    store_format: '',
    state_normalized: '',
    beer_type: '',
  });

  // Extraer opciones únicas para los selects de manera dinámica
  const options = useMemo(() => {
    const chains    = new Set();
    const formats   = new Set();
    const states    = new Set();
    const beerTypes = new Set();

    stores.forEach(s => {
      if (s.chain)            chains.add(s.chain);
      if (s.store_format)     formats.add(s.store_format);
      if (s.state_normalized) states.add(s.state_normalized);

      // Extraer tipos de cerveza de los productos catalogados
      (s.catalog_products || []).forEach(prod => {
        const type = extractBeerType(prod.description);
        if (type) beerTypes.add(type);
      });
    });

    return {
      chains:    Array.from(chains).sort(),
      formats:   Array.from(formats).sort(),
      states:    Array.from(states).sort(),
      beerTypes: Array.from(beerTypes).sort(),
    };
  }, [stores]);

  // Aplicar filtros
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      if (filters.chain          && store.chain            !== filters.chain)            return false;
      if (filters.store_format   && store.store_format     !== filters.store_format)     return false;
      if (filters.state_normalized && store.state_normalized !== filters.state_normalized) return false;

      // Filtro por tipo de cerveza: la tienda debe tener al menos un producto de ese tipo
      if (filters.beer_type) {
        const hasBeerType = (store.catalog_products || []).some(
          prod => extractBeerType(prod.description) === filters.beer_type
        );
        if (!hasBeerType) return false;
      }

      return true;
    });
  }, [stores, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      chain: '',
      store_format: '',
      state_normalized: '',
      beer_type: '',
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredStores,
    options,
  };
}
