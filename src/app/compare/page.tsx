'use client';
import { PAGE_CONTAINER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/utils';

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowLeft,
  DollarSign,
  Home,
  Utensils,
  Bus,
  Laptop,
  Thermometer,
  Droplets,
  CloudRain,
  Star,
  Building2,
  Wifi,
  Search,
  ChevronDown,
  MapPin,
  Clock,
  ArrowRight,
  Globe,
  X,
} from 'lucide-react';

/* ---------- types ---------- */
interface CityWeatherMonth {
  month: string;
  temp: number;
  humidity: number;
  rain: number;
}

interface CityData {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  lat: number;
  lon: number;
  emoji: string;
  weather: {
    monthly: CityWeatherMonth[];
    avg_temp: number;
    avg_humidity: number;
    annual_rain: number;
  };
  cost: {
    monthly_total: number;
    rent: number;
    food: number;
    transport: number;
    coworking: number;
    other: number;
  };
  spaces: {
    coliving: number;
    hostel: number;
    apartment: number;
    guesthouse: number;
    coworking: number;
    total: number;
  };
  nomad_score: number;
  nearby: string[];
  internet?: {
    download_mbps: number;
    upload_mbps: number;
    latency_ms: number;
    test_count: number;
    quarter: string;
  };
}

/* ---------- constants ---------- */
const COST_COLORS: Record<string, string> = {
  rent: '#8b5cf6',
  food: '#10b981',
  transport: '#3b82f6',
  coworking: '#f59e0b',
  other: '#6b7280',
};

const CITY_A_COLOR = '#8b5cf6';
const CITY_B_COLOR = '#3b82f6';

/* ---------- helpers ---------- */
/** Estimate UTC offset in hours from longitude (rough, no DST). */
function lonToUtcOffset(lon: number): number {
  return Math.round(lon / 15);
}

function formatUtcOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `UTC${sign}${abs}`;
}

function tempColor(temp: number): string {
  if (temp < 15) return '#3b82f6';
  if (temp <= 28) return '#10b981';
  return '#f97316';
}

/* ---------- searchable dropdown ---------- */
function CityPicker({
  cities,
  selected,
  onSelect,
  label,
  otherSlug,
}: {
  cities: CityData[];
  selected: CityData | null;
  onSelect: (city: CityData) => void;
  label: string;
  otherSlug: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cities.filter(
      (c) =>
        c.slug !== otherSlug &&
        (c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q))
    );
  }, [cities, query, otherSlug]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <button
        id={`picker-${label.toLowerCase().replace(/\s/g, '-')}`}
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all text-left"
      >
        {selected ? (
          <>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-zinc-900 truncate text-sm">
                {selected.name}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                {selected.country}
              </div>
            </div>
          </>
        ) : (
          <span className="text-sm text-zinc-400">
            Select a city…
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-72 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities..."
              className="flex-1 bg-transparent text-sm outline-none text-zinc-900 placeholder:text-zinc-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-zinc-400">
                No cities found
              </div>
            )}
            {filtered.map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50 transition-colors ${
                  selected?.slug === c.slug
                    ? 'bg-zinc-50'
                    : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">
                    {c.name}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {c.country} · ${c.cost.monthly_total.toLocaleString()}/mo
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- comparison metric row ---------- */
type WinnerDir = 'a' | 'b' | 'neutral';

interface MetricRow {
  icon: React.ReactNode;
  label: string;
  valueA: string;
  valueB: string;
  rawA: number;
  rawB: number;
  /** 'lower' = lower is better, 'higher' = higher is better, 'none' = neutral */
  better: 'lower' | 'higher' | 'none';
}

function getWinner(row: MetricRow): WinnerDir {
  if (row.better === 'none' || row.rawA === row.rawB) return 'neutral';
  if (row.better === 'lower') return row.rawA < row.rawB ? 'a' : 'b';
  return row.rawA > row.rawB ? 'a' : 'b';
}

function ComparisonRow({ row }: { row: MetricRow }) {
  const winner = getWinner(row);
  const aWin = winner === 'a';
  const bWin = winner === 'b';

  return (
    <div className="grid grid-cols-[1.3fr_1fr_1fr] sm:grid-cols-[1fr_1fr_1fr] gap-2 sm:gap-4 items-center py-3 border-b border-zinc-100 last:border-b-0">
      {/* Metric label */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-zinc-400 flex-shrink-0">
          {row.icon}
        </span>
        <span className="text-xs sm:text-sm font-medium text-zinc-600 leading-tight">
          {row.label}
        </span>
      </div>
      {/* City A value */}
      <div
        className={`text-center text-sm font-semibold rounded-lg py-1.5 px-2 transition-colors ${
          aWin
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-zinc-900'
        }`}
      >
        {row.valueA}
      </div>
      {/* City B value */}
      <div
        className={`text-center text-sm font-semibold rounded-lg py-1.5 px-2 transition-colors ${
          bWin
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-zinc-900'
        }`}
      >
        {row.valueB}
      </div>
    </div>
  );
}

/* ---------- main page ---------- */
function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityA, setCityA] = useState<CityData | null>(null);
  const [cityB, setCityB] = useState<CityData | null>(null);
  const [userTzOffset, setUserTzOffset] = useState<number | null>(null);

  // Fetch data
  useEffect(() => {
    fetch('/nomad-cities.json')
      .then((r) => r.json())
      .then((data: CityData[]) => {
        setCities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Detect user timezone
  useEffect(() => {
    try {
      const offset = -(new Date().getTimezoneOffset() / 60);
      setUserTzOffset(offset);
    } catch {
      // Silently fail
    }
  }, []);

  // Set defaults from URL params or fallback
  useEffect(() => {
    if (cities.length === 0) return;
    const paramA = searchParams.get('a');
    const paramB = searchParams.get('b');
    const a =
      cities.find((c) => c.slug === paramA) ||
      cities.find((c) => c.slug === 'bangkok') ||
      cities[0];
    const b =
      cities.find((c) => c.slug === paramB) ||
      cities.find((c) => c.slug === 'lisbon') ||
      cities[1];
    setCityA(a);
    setCityB(b);
  }, [cities, searchParams]);

  // Sync URL params
  const updateUrl = useCallback(
    (a: CityData | null, b: CityData | null) => {
      if (a && b) {
        const params = new URLSearchParams();
        params.set('a', a.slug);
        params.set('b', b.slug);
        router.replace(`/compare?${params.toString()}`, { scroll: false });
      }
    },
    [router]
  );

  const handleSelectA = useCallback(
    (c: CityData) => {
      setCityA(c);
      updateUrl(c, cityB);
    },
    [cityB, updateUrl]
  );

  const handleSelectB = useCallback(
    (c: CityData) => {
      setCityB(c);
      updateUrl(cityA, c);
    },
    [cityA, updateUrl]
  );

  // Build metric rows
  const metricRows: MetricRow[] = useMemo(() => {
    if (!cityA || !cityB) return [];
    return [
      {
        icon: <DollarSign className="w-4 h-4" />,
        label: 'Monthly Cost',
        valueA: `$${cityA.cost.monthly_total.toLocaleString()}`,
        valueB: `$${cityB.cost.monthly_total.toLocaleString()}`,
        rawA: cityA.cost.monthly_total,
        rawB: cityB.cost.monthly_total,
        better: 'lower',
      },
      {
        icon: <Home className="w-4 h-4" />,
        label: 'Rent',
        valueA: `$${cityA.cost.rent.toLocaleString()}`,
        valueB: `$${cityB.cost.rent.toLocaleString()}`,
        rawA: cityA.cost.rent,
        rawB: cityB.cost.rent,
        better: 'lower',
      },
      {
        icon: <Utensils className="w-4 h-4" />,
        label: 'Food',
        valueA: `$${cityA.cost.food.toLocaleString()}`,
        valueB: `$${cityB.cost.food.toLocaleString()}`,
        rawA: cityA.cost.food,
        rawB: cityB.cost.food,
        better: 'lower',
      },
      {
        icon: <Laptop className="w-4 h-4" />,
        label: 'Coworking',
        valueA: `$${cityA.cost.coworking.toLocaleString()}`,
        valueB: `$${cityB.cost.coworking.toLocaleString()}`,
        rawA: cityA.cost.coworking,
        rawB: cityB.cost.coworking,
        better: 'lower',
      },
      {
        icon: <Thermometer className="w-4 h-4" />,
        label: 'Avg Temperature',
        valueA: `${Math.round(cityA.weather.avg_temp)}°C`,
        valueB: `${Math.round(cityB.weather.avg_temp)}°C`,
        rawA: cityA.weather.avg_temp,
        rawB: cityB.weather.avg_temp,
        better: 'none',
      },
      {
        icon: <Droplets className="w-4 h-4" />,
        label: 'Humidity',
        valueA: `${Math.round(cityA.weather.avg_humidity)}%`,
        valueB: `${Math.round(cityB.weather.avg_humidity)}%`,
        rawA: cityA.weather.avg_humidity,
        rawB: cityB.weather.avg_humidity,
        better: 'lower',
      },
      {
        icon: <CloudRain className="w-4 h-4" />,
        label: 'Annual Rain',
        valueA: `${Math.round(cityA.weather.annual_rain).toLocaleString()}mm`,
        valueB: `${Math.round(cityB.weather.annual_rain).toLocaleString()}mm`,
        rawA: cityA.weather.annual_rain,
        rawB: cityB.weather.annual_rain,
        better: 'lower',
      },
      {
        icon: <Star className="w-4 h-4" />,
        label: 'Nomad Score',
        valueA: `${cityA.nomad_score}`,
        valueB: `${cityB.nomad_score}`,
        rawA: cityA.nomad_score,
        rawB: cityB.nomad_score,
        better: 'higher',
      },
      {
        icon: <Building2 className="w-4 h-4" />,
        label: 'Total Spaces',
        valueA: `${cityA.spaces.total}`,
        valueB: `${cityB.spaces.total}`,
        rawA: cityA.spaces.total,
        rawB: cityB.spaces.total,
        better: 'higher',
      },
      {
        icon: <Wifi className="w-4 h-4" />,
        label: 'Coworking Spaces',
        valueA: `${cityA.spaces.coworking}`,
        valueB: `${cityB.spaces.coworking}`,
        rawA: cityA.spaces.coworking,
        rawB: cityB.spaces.coworking,
        better: 'higher',
      },
      {
        icon: <Wifi className="w-4 h-4" />,
        label: 'Download Speed',
        valueA: cityA.internet?.download_mbps ? `${cityA.internet.download_mbps} Mbps` : 'N/A',
        valueB: cityB.internet?.download_mbps ? `${cityB.internet.download_mbps} Mbps` : 'N/A',
        rawA: cityA.internet?.download_mbps || 0,
        rawB: cityB.internet?.download_mbps || 0,
        better: 'higher',
      },
      {
        icon: <Wifi className="w-4 h-4" />,
        label: 'Upload Speed',
        valueA: cityA.internet?.upload_mbps ? `${cityA.internet.upload_mbps} Mbps` : 'N/A',
        valueB: cityB.internet?.upload_mbps ? `${cityB.internet.upload_mbps} Mbps` : 'N/A',
        rawA: cityA.internet?.upload_mbps || 0,
        rawB: cityB.internet?.upload_mbps || 0,
        better: 'higher',
      },
    ];
  }, [cityA, cityB]);

  // Temperature chart max
  const maxTemp = useMemo(() => {
    if (!cityA || !cityB) return 40;
    return Math.max(
      ...cityA.weather.monthly.map((m) => m.temp),
      ...cityB.weather.monthly.map((m) => m.temp),
      1
    );
  }, [cityA, cityB]);

  // Timezone offsets
  const tzA = cityA ? lonToUtcOffset(cityA.lon) : null;
  const tzB = cityB ? lonToUtcOffset(cityB.lon) : null;
  const tzDiff = tzA !== null && tzB !== null ? Math.abs(tzA - tzB) : null;

  /* ---------- render ---------- */
  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main
        id="main-content"
        className={PAGE_CONTAINER}
      >
        {/* Back link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1 className={PAGE_TITLE}>
            Compare Cities
          </h1>
          <p className={PAGE_SUBTITLE}>
            Side-by-side comparison of cost of living, weather, coworking
            spaces, and nomad scores.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm text-zinc-500">
                Loading cities…
              </span>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* City pickers */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <CityPicker
                cities={cities}
                selected={cityA}
                onSelect={handleSelectA}
                label="City A"
                otherSlug={cityB?.slug ?? null}
              />
              <div className="hidden sm:flex items-end pb-3">
                <span className="text-zinc-300 font-bold text-lg">
                  vs
                </span>
              </div>
              <CityPicker
                cities={cities}
                selected={cityB}
                onSelect={handleSelectB}
                label="City B"
                otherSlug={cityA?.slug ?? null}
              />
            </div>

            {cityA && cityB && (
              <>
                {/* Comparison Grid */}
                <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all p-5 sm:p-6 mb-8">
                  {/* Header row */}
                  <div className="grid grid-cols-[1.3fr_1fr_1fr] sm:grid-cols-[1fr_1fr_1fr] gap-2 sm:gap-4 items-center pb-3 border-b-2 border-zinc-200 mb-1">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Metric
                    </div>
                    <Link
                      href={`/${cityA.slug}`}
                      className="text-center group"
                    >
                      <div className="text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors truncate">
                        {cityA.name}
                      </div>
                    </Link>
                    <Link
                      href={`/${cityB.slug}`}
                      className="text-center group"
                    >
                      <div className="text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors truncate">
                        {cityB.name}
                      </div>
                    </Link>
                  </div>

                  {/* Metric rows */}
                  {metricRows.map((row) => (
                    <ComparisonRow key={row.label} row={row} />
                  ))}
                </div>

                {/* Weather Comparison */}
                <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all p-5 sm:p-6 mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-5">
                    12-Month Temperature Comparison
                  </h2>
                  <div className="flex items-end gap-1 sm:gap-2 h-52 mb-2">
                    {cityA.weather.monthly.map((mA, i) => {
                      const mB = cityB.weather.monthly[i];
                      const barMaxTemp = maxTemp + 5;
                      const heightA = Math.max(
                        (mA.temp / barMaxTemp) * 100,
                        6
                      );
                      const heightB = mB
                        ? Math.max((mB.temp / barMaxTemp) * 100, 6)
                        : 0;
                      return (
                        <div
                          key={mA.month}
                          className="flex-1 flex flex-col items-center h-full justify-end gap-0.5"
                        >
                          <div className="text-[9px] font-medium text-zinc-500">
                            {Math.round(mA.temp)}° / {mB ? Math.round(mB.temp) : '-'}°
                          </div>
                          <div className="flex gap-px w-full h-full items-end justify-center">
                            <div
                              className="flex-1 rounded-t-sm transition-all"
                              style={{
                                height: `${heightA}%`,
                                backgroundColor: CITY_A_COLOR,
                                opacity: 0.8,
                              }}
                              title={`${cityA.name}: ${Math.round(mA.temp)}°C`}
                            />
                            <div
                              className="flex-1 rounded-t-sm transition-all"
                              style={{
                                height: `${heightB}%`,
                                backgroundColor: CITY_B_COLOR,
                                opacity: 0.8,
                              }}
                              title={
                                mB
                                  ? `${cityB.name}: ${Math.round(mB.temp)}°C`
                                  : ''
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Month labels */}
                  <div className="flex gap-1 sm:gap-2 mb-4">
                    {cityA.weather.monthly.map((m) => (
                      <div
                        key={m.month}
                        className="flex-1 text-center text-[10px] text-zinc-400"
                      >
                        {m.month}
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-6 text-xs text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: CITY_A_COLOR,
                          opacity: 0.8,
                        }}
                      />
                      {cityA.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: CITY_B_COLOR,
                          opacity: 0.8,
                        }}
                      />
                      {cityB.name}
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Comparison */}
                <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all p-5 sm:p-6 mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-5">
                    Cost Breakdown Comparison
                  </h2>

                  {[
                    { city: cityA, color: CITY_A_COLOR },
                    { city: cityB, color: CITY_B_COLOR },
                  ].map(({ city }) => {
                    const total = city.cost.monthly_total;
                    const segments = [
                      { key: 'rent', value: city.cost.rent },
                      { key: 'food', value: city.cost.food },
                      { key: 'transport', value: city.cost.transport },
                      { key: 'coworking', value: city.cost.coworking },
                      { key: 'other', value: city.cost.other },
                    ];
                    return (
                      <div key={city.slug} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-zinc-900">
                            {city.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            · ${total.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="w-full h-5 rounded-full overflow-hidden flex">
                          {segments.map((s) => (
                            <div
                              key={s.key}
                              className="h-full transition-all"
                              style={{
                                width: `${(s.value / total) * 100}%`,
                                backgroundColor: COST_COLORS[s.key],
                              }}
                              title={`${s.key}: $${s.value}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Cost legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
                    {[
                      { key: 'rent', label: 'Rent' },
                      { key: 'food', label: 'Food' },
                      { key: 'transport', label: 'Transport' },
                      { key: 'coworking', label: 'Coworking' },
                      { key: 'other', label: 'Other' },
                    ].map((e) => (
                      <div key={e.key} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COST_COLORS[e.key] }}
                        />
                        <div>
                          <div className="text-xs text-zinc-500">
                            {e.label}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            ${cityA.cost[e.key as keyof typeof cityA.cost].toLocaleString()}{' '}
                            vs ${cityB.cost[e.key as keyof typeof cityB.cost].toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timezone Offset */}
                <div className="bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all p-5 sm:p-6 mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-4">
                    Timezone
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* City A tz */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          {cityA.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {tzA !== null ? formatUtcOffset(tzA) : '-'}
                        </div>
                      </div>
                    </div>
                    {/* Diff */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm font-bold text-zinc-900">
                          {tzDiff !== null
                            ? tzDiff === 0
                              ? 'Same timezone'
                              : `${tzDiff}h difference`
                            : '-'}
                        </span>
                      </div>
                    </div>
                    {/* City B tz */}
                    <div className="flex items-center gap-3 sm:justify-end">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 sm:text-right">
                          {cityB.name}
                        </div>
                        <div className="text-xs text-zinc-500 sm:text-right">
                          {tzB !== null ? formatUtcOffset(tzB) : '-'}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* User timezone offset */}
                  {userTzOffset !== null && tzA !== null && tzB !== null && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          Your timezone ({formatUtcOffset(userTzOffset)}):
                        </span>
                        <span className="font-medium text-zinc-700">
                          {Math.abs(userTzOffset - tzA) === 0
                            ? `Same as ${cityA.name}`
                            : `${Math.abs(userTzOffset - tzA)}h from ${cityA.name}`}
                        </span>
                        <span>·</span>
                        <span className="font-medium text-zinc-700">
                          {Math.abs(userTzOffset - tzB) === 0
                            ? `Same as ${cityB.name}`
                            : `${Math.abs(userTzOffset - tzB)}h from ${cityB.name}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/${cityA.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all text-sm font-semibold text-zinc-900"
                  >
                    View {cityA.name} Guide
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/${cityB.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all text-sm font-semibold text-zinc-900"
                  >
                    View {cityB.name} Guide
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/nomad"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all text-sm font-semibold"
                  >
                    <MapPin className="w-4 h-4" />
                    View on Map
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
