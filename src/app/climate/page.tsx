'use client';
import { PAGE_CONTAINER } from '@/lib/utils';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import {
  ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown,
  Loader2, Thermometer, Droplets, CloudRain, Sun, Info,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MonthlyWeather {
  month: string;
  temp: number;
  humidity: number;
  rain: number;
}

interface City {
  slug: string;
  name: string;
  country: string;
  emoji: string;
  weather: {
    monthly: MonthlyWeather[];
    avg_temp: number;
    avg_humidity: number;
    annual_rain: number;
  };
  nomad_score: number;
  cost: { monthly_total: number };
}

type SortKey = 'name' | 'temp' | 'humidity' | 'rain' | 'nomad_score';
type SortDir = 'asc' | 'desc';
type HumidityFilter = 'any' | 'low' | 'med' | 'high';
type RainFilter = 'any' | 'dry' | 'mod' | 'rainy';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function currentMonthIndex(): number {
  return new Date().getMonth(); // 0-based
}

function tempColor(t: number): string {
  if (t < 15) return 'text-blue-600 dark:text-blue-400';
  if (t <= 25) return 'text-emerald-600 dark:text-emerald-400';
  if (t <= 32) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function humidityLabel(h: number): string {
  if (h < 40) return 'Low';
  if (h <= 65) return 'Medium';
  return 'High';
}

export default function ClimatePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const [monthIdx, setMonthIdx] = useState(currentMonthIndex());
  const [tempMin, setTempMin] = useState(20);
  const [tempMax, setTempMax] = useState(30);
  const [humidity, setHumidity] = useState<HumidityFilter>('any');
  const [rain, setRain] = useState<RainFilter>('any');

  const [sortKey, setSortKey] = useState<SortKey>('temp');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    fetch('/nomad-cities.json')
      .then(r => r.json())
      .then((data: City[]) => {
        setCities(data.filter(c => c.weather?.monthly?.length === 12));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getMonthData = (city: City) => city.weather.monthly[monthIdx];

  const filtered = useMemo(() => {
    return cities.filter(city => {
      const m = getMonthData(city);
      if (!m) return false;
      if (m.temp < tempMin || m.temp > tempMax) return false;
      if (humidity === 'low' && m.humidity >= 40) return false;
      if (humidity === 'med' && (m.humidity < 40 || m.humidity > 65)) return false;
      if (humidity === 'high' && m.humidity <= 65) return false;
      if (rain === 'dry' && m.rain > 50) return false;
      if (rain === 'mod' && (m.rain <= 50 || m.rain > 200)) return false;
      if (rain === 'rainy' && m.rain <= 200) return false;
      return true;
    });
  }, [cities, monthIdx, tempMin, tempMax, humidity, rain]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const am = getMonthData(a);
      const bm = getMonthData(b);
      let va: number | string, vb: number | string;
      switch (sortKey) {
        case 'name': va = a.name; vb = b.name; break;
        case 'temp': va = am.temp; vb = bm.temp; break;
        case 'humidity': va = am.humidity; vb = bm.humidity; break;
        case 'rain': va = am.rain; vb = bm.rain; break;
        case 'nomad_score': va = a.nomad_score; vb = b.nomad_score; break;
      }
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortHeader = ({ label, field, className = '' }: { label: string; field: SortKey; className?: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ${className}`}
    >
      {label}
      {sortKey === field ? (
        sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-zinc-900 dark:text-zinc-100" /> : <ArrowDown className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );

  const RadioGroup = <T extends string>({
    options,
    value,
    onChange,
  }: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
  }) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === o.value
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        <Link href="/nomad" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 mb-3 transition-colors">
            Climate Finder
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Filter {cities.length} digital nomad cities by temperature, humidity, and rainfall for any month of the year.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 md:p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Month */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    <Sun className="w-3.5 h-3.5" /> Month
                  </label>
                  <select
                    value={monthIdx}
                    onChange={e => setMonthIdx(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Temp Range */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    <Thermometer className="w-3.5 h-3.5" /> Temp Range (°C)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempMin}
                      onChange={e => setTempMin(Number(e.target.value))}
                      className="w-20 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                    />
                    <span className="text-zinc-400 text-sm">–</span>
                    <input
                      type="number"
                      value={tempMax}
                      onChange={e => setTempMax(Number(e.target.value))}
                      className="w-20 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                    />
                  </div>
                </div>

                {/* Humidity */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    <Droplets className="w-3.5 h-3.5" /> Humidity
                  </label>
                  <RadioGroup
                    options={[
                      { value: 'any' as HumidityFilter, label: 'Any' },
                      { value: 'low' as HumidityFilter, label: 'Low (<40%)' },
                      { value: 'med' as HumidityFilter, label: 'Med (40-65%)' },
                      { value: 'high' as HumidityFilter, label: 'High (>65%)' },
                    ]}
                    value={humidity}
                    onChange={setHumidity}
                  />
                </div>

                {/* Rain */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    <CloudRain className="w-3.5 h-3.5" /> Rainfall
                  </label>
                  <RadioGroup
                    options={[
                      { value: 'any' as RainFilter, label: 'Any' },
                      { value: 'dry' as RainFilter, label: 'Dry (<50mm)' },
                      { value: 'mod' as RainFilter, label: 'Moderate' },
                      { value: 'rainy' as RainFilter, label: 'Rainy (>200mm)' },
                    ]}
                    value={rain}
                    onChange={setRain}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <span className="text-2xl font-bold tabular-nums">{sorted.length}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 ml-1.5">
                    {sorted.length === 1 ? 'city matches' : 'cities match'} your climate preferences in {MONTHS[monthIdx]}
                  </span>
                </span>
              </div>
            </div>

            {/* Temp Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">Temperature:</span>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Cold (&lt;15°C)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pleasant (15-25°C)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warm (25-32°C)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Hot (&gt;32°C)</div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800/50">
                      <th className="text-left px-5 py-4">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">#</span>
                      </th>
                      <th className="text-left px-5 py-4"><SortHeader label="City" field="name" /></th>
                      <th className="text-right px-5 py-4"><SortHeader label="Temp" field="temp" /></th>
                      <th className="text-right px-5 py-4"><SortHeader label="Humidity" field="humidity" /></th>
                      <th className="text-right px-5 py-4"><SortHeader label="Rain" field="rain" /></th>
                      <th className="text-right px-5 py-4"><SortHeader label="Score" field="nomad_score" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((city, i) => {
                      const m = getMonthData(city);
                      return (
                        <tr key={city.slug} className="border-b border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{i + 1}</td>
                          <td className="px-5 py-3.5">
                            <Link href={`/${city.slug}`} className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
                              {city.emoji} {city.name}
                            </Link>
                            <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1.5 text-xs">{city.country}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`font-bold tabular-nums ${tempColor(m.temp)}`}>{m.temp}°C</span>
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                            {m.humidity}%
                            <span className="text-[10px] text-zinc-400 ml-1">{humidityLabel(m.humidity)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                            {m.rain}<span className="text-xs text-zinc-400 ml-0.5">mm</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                              city.nomad_score >= 70
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : city.nomad_score >= 50
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                            }`}>
                              {city.nomad_score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center text-zinc-400">
                          No cities match your climate filters. Try adjusting the temperature range or humidity.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source */}
            <div className="mt-8 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-2xl">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Climate data aggregated from historical weather stations and satellite data.
                Monthly averages may vary year to year. Last updated June 2026.
              </p>
            </div>
          </>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
