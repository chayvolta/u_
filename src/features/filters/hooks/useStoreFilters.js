import { useState, useMemo } from 'react';

export function useStoreFilters(stores) {
  const [filters, setFilters] = useState({
    chain: '',
    store_format: '',
    state_normalized: '',
    needs_review: false,
  });

  // Extraer opciones únicas para los selects de manera dinámica
  const options = useMemo(() => {
    const chains = new Set();
    const formats = new Set();
    const states = new Set();

    stores.forEach(s => {
      if (s.chain) chains.add(s.chain);
      if (s.store_format) formats.add(s.store_format);
      if (s.state_normalized) states.add(s.state_normalized);
    });

    return {
      chains: Array.from(chains).sort(),
      formats: Array.from(formats).sort(),
      states: Array.from(states).sort(),
    };
  }, [stores]);

  // Aplicar filtros
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      if (filters.chain && store.chain !== filters.chain) return false;
      if (filters.store_format && store.store_format !== filters.store_format) return false;
      if (filters.state_normalized && store.state_normalized !== filters.state_normalized) return false;
      if (filters.needs_review && !store.needs_review) return false;
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
      needs_review: false,
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredStores,
    options
  };
}
