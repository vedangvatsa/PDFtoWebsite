'use client';

import { useEffect, useState } from 'react';

export function useNomadCities<T = unknown>() {
  const [cities, setCities] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/nomad-cities.json')
      .then((r) => r.json())
      .then((data: T[]) => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  return { cities, loading };
}
