'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Map,
  MapClusterLayer,
  MapPopup,
  MapControls,
  type MapRef,
} from '@/components/ui/map';
import { Badge } from '@/components/ui/badge';
import { Building2, Bed, Home, Hotel, Users, ExternalLink, Star } from 'lucide-react';

interface POI {
  osm_id: number;
  name: string;
  category: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  address: string;
  phone: string;
  website: string;
  opening_hours: string;
  wifi: string;
  quality: number;
  cost_tier: number;
  timezone: string;
  visa: string;
  osm_url: string;
  google_rating?: number;
  google_review_count?: number;
  review_summary?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof Building2 }> = {
  coliving: { label: 'Coliving', color: '#8b5cf6', icon: Users },
  hostel: { label: 'Hostels', color: '#f59e0b', icon: Bed },
  apartment: { label: 'Apartments', color: '#10b981', icon: Home },
  guesthouse: { label: 'Guesthouses', color: '#ec4899', icon: Hotel },
};

const CATEGORY_COLORS: Record<string, string> = {
  coliving: '#8b5cf6',
  hostel: '#f59e0b',
  apartment: '#10b981',
  guesthouse: '#ec4899',
};

interface SelectedPoint {
  coordinates: [number, number];
  properties: POI;
}

export function NomadMap({ data }: { data: POI[] }) {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(Object.keys(CATEGORY_CONFIG)));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  const mapRef = useRef<MapRef>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => {
    const citySet = new globalThis.Map<string, { country: string; count: number; lat: number; lon: number }>();
    for (const poi of data) {
      const existing = citySet.get(poi.city);
      if (existing) {
        existing.count++;
      } else {
        citySet.set(poi.city, { country: poi.country, count: 1, lat: poi.lat, lon: poi.lon });
      }
    }
    return Array.from(citySet.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    if (selectedCity !== 'all') {
      filtered = filtered.filter(p => p.city === selectedCity);
    }
    filtered = filtered.filter(p => selectedCategories.has(p.category));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [data, selectedCity, selectedCategories, searchQuery]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(100);
  }, [selectedCity, selectedCategories, searchQuery]);

  // Infinite scroll via IntersectionObserver on viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 100, filteredData.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredData.length]);

  // Convert filtered data to GeoJSON for the cluster layer
  const geojsonData = useMemo((): GeoJSON.FeatureCollection<GeoJSON.Point, POI> => ({
    type: 'FeatureCollection',
    features: filteredData.map(poi => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [poi.lon, poi.lat],
      },
      properties: poi,
    })),
  }), [filteredData]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const source = selectedCity === 'all' ? data : data.filter(p => p.city === selectedCity);
    for (const poi of source) {
      counts[poi.category] = (counts[poi.category] || 0) + 1;
    }
    return counts;
  }, [data, selectedCity]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const mapCenter = useMemo((): [number, number] => {
    if (selectedCity !== 'all') {
      const city = cities.find(c => c.name === selectedCity);
      if (city) return [city.lon, city.lat]; // mapcn uses [lng, lat]
    }
    return [20, 20];
  }, [selectedCity, cities]);

  const mapZoom = selectedCity === 'all' ? 2 : 13;

  const handlePointClick = useCallback((
    feature: GeoJSON.Feature<GeoJSON.Point, POI>,
    coordinates: [number, number],
  ) => {
    setSelectedPoint({
      coordinates,
      properties: feature.properties,
    });
  }, []);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    setSelectedPoint(null);
    if (city !== 'all') {
      const cityInfo = cities.find(c => c.name === city);
      if (cityInfo && mapRef.current) {
        mapRef.current.flyTo({
          center: [cityInfo.lon, cityInfo.lat],
          zoom: 13,
          duration: 1200,
        });
      }
    } else if (mapRef.current) {
      mapRef.current.flyTo({
        center: [20, 20],
        zoom: 2,
        duration: 1200,
      });
    }
  }, [cities]);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="outline" className="text-sm px-3 py-1">
          {filteredData.length.toLocaleString()} places
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {cities.length} cities
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {new Set(data.map(d => d.country)).size} countries
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* City selector */}
        <div className="flex-1">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full md:w-auto h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Cities ({data.length.toLocaleString()} places)</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>
                {city.name}, {city.country} ({city.count})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-64"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const active = selectedCategories.has(key);
          const count = categoryCounts[key] || 0;
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                active
                  ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                  : 'bg-white dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {config.label}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="w-full h-[350px] sm:h-[450px] md:h-[600px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Map
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          key={`${selectedCity}-${mapZoom}`}
        >
          <MapClusterLayer<POI>
            data={geojsonData}
            clusterRadius={50}
            clusterMaxZoom={14}
            clusterColors={['#3b82f6', '#8b5cf6', '#ef4444']}
            clusterThresholds={[50, 200]}
            pointColor="#3b82f6"
            onPointClick={handlePointClick}
          />

          {selectedPoint && (
            <MapPopup
              key={`${selectedPoint.coordinates[0]}-${selectedPoint.coordinates[1]}`}
              longitude={selectedPoint.coordinates[0]}
              latitude={selectedPoint.coordinates[1]}
              onClose={() => setSelectedPoint(null)}
              closeOnClick={false}
              focusAfterOpen={false}
              closeButton
              className="w-72"
            >
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-base leading-tight">
                    {selectedPoint.properties.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[selectedPoint.properties.category] || '#666' }}
                    >
                      {CATEGORY_CONFIG[selectedPoint.properties.category]?.label || selectedPoint.properties.category}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                      {selectedPoint.properties.city}, {selectedPoint.properties.country}
                    </span>
                  </div>
                </div>

                {/* Google rating */}
                {selectedPoint.properties.google_rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{selectedPoint.properties.google_rating}</span>
                    {selectedPoint.properties.google_review_count && (
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                        ({selectedPoint.properties.google_review_count.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* AI review summary */}
                {selectedPoint.properties.review_summary && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic border-l-2 border-primary/30 pl-2">
                    {selectedPoint.properties.review_summary}
                  </p>
                )}

                {selectedPoint.properties.address && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedPoint.properties.address}</p>
                )}

                {selectedPoint.properties.opening_hours && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Hours: {selectedPoint.properties.opening_hours}
                  </p>
                )}

                {selectedPoint.properties.phone && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Phone: {selectedPoint.properties.phone}
                  </p>
                )}

                {/* Quality dots */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Quality:</span>
                  {Array.from({ length: Math.min(Math.round(selectedPoint.properties.quality / 2), 5) }).map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
                  ))}
                  {Array.from({ length: 5 - Math.min(Math.round(selectedPoint.properties.quality / 2), 5) }).map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  {selectedPoint.properties.website && selectedPoint.properties.website !== 'https://' && selectedPoint.properties.website !== 'http://' && (
                    <a
                      href={selectedPoint.properties.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Website
                    </a>
                  )}
                  <a
                    href={selectedPoint.properties.osm_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    OpenStreetMap
                  </a>
                </div>
              </div>
            </MapPopup>
          )}

          <MapControls showZoom showLocate />
        </Map>
      </div>

      {/* Listings table */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">City</th>
                <th className="text-left px-4 py-3 font-medium">Rating</th>
                <th className="text-left px-4 py-3 font-medium">Quality</th>
                <th className="text-left px-4 py-3 font-medium">Links</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, visibleCount).map((poi, i) => (
                <tr key={poi.osm_id} className="border-t border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-4 py-2.5 text-zinc-400 dark:text-zinc-500 text-xs font-mono">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">{poi.name}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[poi.category] || '#666' }}
                    >
                      {CATEGORY_CONFIG[poi.category]?.label || poi.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{poi.city}</td>
                  <td className="px-4 py-2.5">
                    {poi.google_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{poi.google_rating}</span>
                        {poi.google_review_count && (
                          <span className="text-zinc-500 dark:text-zinc-400 text-[10px]">
                            ({poi.google_review_count})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs"> - </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(Math.round(poi.quality / 2), 5) }).map((_, i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
                      ))}
                      {Array.from({ length: 5 - Math.min(Math.round(poi.quality / 2), 5) }).map((_, i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      {poi.website && poi.website !== 'https://' && poi.website !== 'http://' && (
                        <a href={poi.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                          Web
                        </a>
                      )}
                      <a href={poi.osm_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                        Map
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Sentinel for infinite scroll */}
        {visibleCount < filteredData.length && (
          <div ref={sentinelRef} className="py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Loading more…
          </div>
        )}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 py-2 border-t">
          {Math.min(visibleCount, filteredData.length).toLocaleString()} of {filteredData.length.toLocaleString()} places
        </p>
      </div>
    </div>
  );
}
