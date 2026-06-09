'use client';

import React from 'react';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getCitySlug } from '@/lib/utils';

import {
  Map,
  MapClusterLayer,
  MapPopup,
  MapControls,
  type MapRef,
} from '@/components/ui/map';
import { Badge } from '@/components/ui/badge';
import { Building2, Bed, Home, Hotel, Users, ExternalLink, Star, ArrowLeft, Coins, Thermometer } from 'lucide-react';

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
  coworking: { label: 'Coworking', color: '#3b82f6', icon: Building2 },
};

const CATEGORY_COLORS: Record<string, string> = {
  coliving: '#8b5cf6',
  hostel: '#f59e0b',
  apartment: '#10b981',
  guesthouse: '#ec4899',
  coworking: '#3b82f6',
};

interface SelectedPoint {
  coordinates: [number, number];
  properties: POI;
}

const TableRow = React.memo(function TableRow({ poi, index }: { poi: POI; index: number }) {
  const qualityDots = Math.min(Math.round(poi.quality / 2), 5);
  return (
    <tr className="border-t border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
      <td className="px-4 py-2.5 text-zinc-400 dark:text-zinc-500 text-xs font-mono">{index + 1}</td>
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
          {Array.from({ length: qualityDots }).map((_, i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
          ))}
          {Array.from({ length: 5 - qualityDots }).map((_, i) => (
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
  );
});

const CITY_IMAGES: Record<string, string> = {
  'chiang-mai': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=400&q=80',
  'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80',
  'da-nang': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
  'koh-phangan': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
  'kuala-lumpur': 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?auto=format&fit=crop&w=400&q=80',
  'manila': 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=400&q=80',
  'penang': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
  'phnom-penh': 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=400&q=80',
  'siem-reap': 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=400&q=80',
  'hanoi': 'https://images.unsplash.com/photo-1568093858174-0f391ea21c45?auto=format&fit=crop&w=400&q=80',
  'cebu': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=400&q=80',
  'playa-del-carmen': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
  'ho-chi-minh-city': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
  'taipei': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80',
  'zanzibar': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=400&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80',
  'las-palmas': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80',
  'medellin': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80',
  'phuket': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
  'tulum': 'https://images.unsplash.com/photo-1504730030853-eff311f57d3c?auto=format&fit=crop&w=400&q=80',
  'canggu': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
  'marrakech': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80',
  'cartagena': 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?auto=format&fit=crop&w=400&q=80',
  'oaxaca': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80',
  'cape-town': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
  'kathmandu': 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=400&q=80',
  'buenos-aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=400&q=80',
  'mexico-city': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80',
  'accra': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80',
  'bansko': 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=80',
  'hoi-an': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
  'siargao': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=400&q=80',
  'bali-cangguubud': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
};

function CityCard({ city }: { city: any }) {
  const imageUrl = CITY_IMAGES[city.slug] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80';
  
  // Custom neon gradients for score ranges to look premium
  let badgeGradient = 'from-zinc-700 to-zinc-800 text-zinc-200 border-zinc-600/50';
  let badgeGlow = '';
  if (city.nomad_score >= 95) {
    badgeGradient = 'from-emerald-400 via-teal-400 to-cyan-500 text-emerald-950 font-black';
    badgeGlow = 'shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-pulse';
  } else if (city.nomad_score >= 90) {
    badgeGradient = 'from-emerald-500 to-teal-500 text-white font-extrabold';
    badgeGlow = 'shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  } else if (city.nomad_score >= 80) {
    badgeGradient = 'from-teal-600 to-cyan-600 text-white font-bold';
  }

  return (
    <Link
      href={`/nomad/${city.slug}`}
      className="group relative h-72 rounded-3xl overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/60 hover:shadow-2xl dark:hover:shadow-white/5 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-end p-4"
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={city.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-opacity duration-300 group-hover:via-black/55" />

      {/* Content Container (Glassmorphic) */}
      <div className="relative z-10 w-full bg-white/5 dark:bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg space-y-3 transition-colors duration-300 group-hover:bg-white/10 group-hover:dark:bg-black/45 animate-fade-in">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white tracking-tight truncate filter drop-shadow-md">
              {city.name}
            </h3>
            <p className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 mt-1">
              <span className="shrink-0 rounded-full bg-white/10 backdrop-blur-sm w-5 h-5 flex items-center justify-center text-xs shadow-inner">
                {city.emoji}
              </span>
              <span className="truncate filter drop-shadow-sm">{city.country}</span>
            </p>
          </div>
          <span className={`bg-gradient-to-r ${badgeGradient} ${badgeGlow} text-[9px] px-2 py-1 rounded-full shadow-sm shrink-0 uppercase tracking-widest font-black border border-white/10`} title="Nomad Score">
            Score: {city.nomad_score}
          </span>
        </div>

        {/* Quick Stats Pods */}
        <div className="grid grid-cols-3 gap-2 pt-1.5 text-white">
          <div className="flex flex-col items-center justify-center bg-white/5 dark:bg-black/40 backdrop-blur-sm rounded-xl py-2 px-1 border border-white/5 group-hover:border-white/10 transition-all">
            <span className="text-[8px] text-zinc-300 font-semibold tracking-wider uppercase flex items-center gap-0.5 mb-0.5">
              <Coins className="w-2.5 h-2.5 text-amber-400" /> Cost
            </span>
            <span className="text-xs font-black">${city.cost.monthly_total.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-white/5 dark:bg-black/40 backdrop-blur-sm rounded-xl py-2 px-1 border border-white/5 group-hover:border-white/10 transition-all">
            <span className="text-[8px] text-zinc-300 font-semibold tracking-wider uppercase flex items-center gap-0.5 mb-0.5">
              <Thermometer className="w-2.5 h-2.5 text-orange-400" /> Temp
            </span>
            <span className="text-xs font-black">{Math.round(city.weather.avg_temp)}°C</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-white/5 dark:bg-black/40 backdrop-blur-sm rounded-xl py-2 px-1 border border-white/5 group-hover:border-white/10 transition-all">
            <span className="text-[8px] text-zinc-300 font-semibold tracking-wider uppercase flex items-center gap-0.5 mb-0.5">
              <Building2 className="w-2.5 h-2.5 text-sky-400" /> Spaces
            </span>
            <span className="text-xs font-black">{city.spaces.total}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NomadMap({ data, cityFilter }: { data: POI[]; cityFilter?: string }) {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (cityFilter) {
      const match = data.find(p => getCitySlug(p.city) === cityFilter.toLowerCase());
      return match ? match.city : cityFilter;
    }
    return 'all';
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(Object.keys(CATEGORY_CONFIG)));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityMetadata, setCityMetadata] = useState<any[]>([]);
  const [visibleCityCount, setVisibleCityCount] = useState(12);
  const mapRef = useRef<MapRef>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const citySentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/nomad-cities.json')
      .then(res => res.json())
      .then(data => setCityMetadata(data))
      .catch(err => console.error(err));
  }, []);

  const filteredCities = useMemo(() => {
    let sorted = [...cityMetadata].sort((a, b) => b.nomad_score - a.nomad_score);
    if (citySearchQuery.trim()) {
      const q = citySearchQuery.toLowerCase();
      sorted = sorted.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }
    return sorted;
  }, [cityMetadata, citySearchQuery]);

  // Reset city visible count when search query changes
  useEffect(() => {
    setVisibleCityCount(12);
  }, [citySearchQuery]);

  // Infinite scroll for top cities grid
  useEffect(() => {
    const sentinel = citySentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCityCount(prev => Math.min(prev + 12, filteredCities.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredCities.length, selectedCity]);

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
    setVisibleCount(50);
  }, [selectedCity, selectedCategories, searchQuery]);

  // Infinite scroll via IntersectionObserver on viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 50, filteredData.length));
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
        {!cityFilter && (
          <>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {cities.length} cities
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {new Set(data.map(d => d.country)).size} countries
            </Badge>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* City selector */}
        {!cityFilter && (
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
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${cityFilter ? 'w-full' : 'w-full md:w-64'}`}
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
          key="nomad-map-stable"
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

      {/* Conditional: Top Destinations Grid or Listings Table */}
      {selectedCity === 'all' ? (
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Explore Top Nomad Destinations
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Curated list of the best places to live, work, and explore.
              </p>
            </div>
            {/* Search Input within Top Cities */}
            <input
              type="text"
              placeholder="Search cities..."
              value={citySearchQuery}
              onChange={(e) => setCitySearchQuery(e.target.value)}
              className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCities.slice(0, visibleCityCount).map((city) => (
              <CityCard key={city.slug} city={city} />
            ))}
          </div>

          {/* Sentinel for infinite scroll of top cities */}
          {visibleCityCount < filteredCities.length && (
            <div ref={citySentinelRef} className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Loading more destinations…
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Spaces in {selectedCity}
            </h2>
            {!cityFilter && (
              <button
                onClick={() => handleCityChange('all')}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Top Cities
              </button>
            )}
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
                    <TableRow key={poi.osm_id} poi={poi} index={i} />
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
      )}
    </div>
  );
}
