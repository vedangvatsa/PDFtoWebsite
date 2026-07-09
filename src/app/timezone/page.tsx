'use client';
import { PAGE_CONTAINER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/utils';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Clock, Plus, X, Globe } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  City timezone data                                                 */
/* ------------------------------------------------------------------ */

interface TZCity {
  name: string;
  offset: number; // UTC offset in hours
  emoji: string;
}

const TZ_CITIES: TZCity[] = [
  { name: 'New York', offset: -5, emoji: '🇺🇸' },
  { name: 'Los Angeles', offset: -8, emoji: '🇺🇸' },
  { name: 'Toronto', offset: -5, emoji: '🇨🇦' },
  { name: 'Vancouver', offset: -8, emoji: '🇨🇦' },
  { name: 'Mexico City', offset: -6, emoji: '🇲🇽' },
  { name: 'Bogota', offset: -5, emoji: '🇨🇴' },
  { name: 'Lima', offset: -5, emoji: '🇵🇪' },
  { name: 'Medellin', offset: -5, emoji: '🇨🇴' },
  { name: 'São Paulo', offset: -3, emoji: '🇧🇷' },
  { name: 'Buenos Aires', offset: -3, emoji: '🇦🇷' },
  { name: 'London', offset: 0, emoji: '🇬🇧' },
  { name: 'Lisbon', offset: 0, emoji: '🇵🇹' },
  { name: 'Paris', offset: 1, emoji: '🇫🇷' },
  { name: 'Berlin', offset: 1, emoji: '🇩🇪' },
  { name: 'Barcelona', offset: 1, emoji: '🇪🇸' },
  { name: 'Amsterdam', offset: 1, emoji: '🇳🇱' },
  { name: 'Prague', offset: 1, emoji: '🇨🇿' },
  { name: 'Budapest', offset: 1, emoji: '🇭🇺' },
  { name: 'Cairo', offset: 2, emoji: '🇪🇬' },
  { name: 'Cape Town', offset: 2, emoji: '🇿🇦' },
  { name: 'Istanbul', offset: 3, emoji: '🇹🇷' },
  { name: 'Nairobi', offset: 3, emoji: '🇰🇪' },
  { name: 'Dubai', offset: 4, emoji: '🇦🇪' },
  { name: 'Tbilisi', offset: 4, emoji: '🇬🇪' },
  { name: 'Mumbai', offset: 5.5, emoji: '🇮🇳' },
  { name: 'Bangkok', offset: 7, emoji: '🇹🇭' },
  { name: 'Chiang Mai', offset: 7, emoji: '🇹🇭' },
  { name: 'Ho Chi Minh', offset: 7, emoji: '🇻🇳' },
  { name: 'Singapore', offset: 8, emoji: '🇸🇬' },
  { name: 'Kuala Lumpur', offset: 8, emoji: '🇲🇾' },
  { name: 'Taipei', offset: 8, emoji: '🇹🇼' },
  { name: 'Manila', offset: 8, emoji: '🇵🇭' },
  { name: 'Bali', offset: 8, emoji: '🇮🇩' },
  { name: 'Seoul', offset: 9, emoji: '🇰🇷' },
  { name: 'Tokyo', offset: 9, emoji: '🇯🇵' },
  { name: 'Sydney', offset: 10, emoji: '🇦🇺' },
  { name: 'Auckland', offset: 12, emoji: '🇳🇿' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const COLORS = [
  { bar: 'bg-emerald-500/70', text: 'text-emerald-700' },
  { bar: 'bg-blue-500/70', text: 'text-blue-700' },
  { bar: 'bg-violet-500/70', text: 'text-violet-700' },
  { bar: 'bg-amber-500/70', text: 'text-amber-700' },
];

function formatHour(h: number): string {
  const norm = ((h % 24) + 24) % 24;
  if (norm === 0) return '12am';
  if (norm === 12) return '12pm';
  return norm < 12 ? `${norm}am` : `${norm - 12}pm`;
}

function isWorkHour(utcHour: number, offset: number): boolean {
  const local = ((utcHour + offset) % 24 + 24) % 24;
  return local >= 9 && local < 18;
}

export default function TimezonePage() {
  const [selected, setSelected] = useState<string[]>(['New York', 'London', 'Chiang Mai']);

  const addCity = (name: string) => {
    if (selected.length < 4 && !selected.includes(name)) {
      setSelected([...selected, name]);
    }
  };

  const removeCity = (name: string) => {
    setSelected(selected.filter(n => n !== name));
  };

  const selectedCities = useMemo(
    () => selected.map(name => TZ_CITIES.find(c => c.name === name)!).filter(Boolean),
    [selected],
  );

  const overlapHours = useMemo(() => {
    if (selectedCities.length < 2) return 0;
    return HOURS.filter(h =>
      selectedCities.every(city => isWorkHour(h, city.offset)),
    ).length;
  }, [selectedCities]);

  const availableCities = TZ_CITIES.filter(c => !selected.includes(c.name));

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        {/* Back link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className={PAGE_TITLE}>
            Timezone Overlap Tool
          </h1>
          <p className={PAGE_SUBTITLE}>
            Pick 2–4 cities and see their work hours (9 AM – 6 PM) across a 24-hour UTC bar. Find the best meeting times for distributed teams.
          </p>
        </div>

        {/* City Picker */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Selected Cities ({selected.length}/4)
            </span>
          </div>

          {/* Selected chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCities.map((city, i) => (
              <span
                key={city.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  i === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : i === 1
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : i === 2
                    ? 'bg-violet-50 border-violet-200 text-violet-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                {city.emoji} {city.name}
                <span className="text-xs opacity-60">UTC{city.offset >= 0 ? '+' : ''}{city.offset}</span>
                <button
                  onClick={() => removeCity(city.name)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${city.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add city dropdown */}
          {selected.length < 4 && (
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-zinc-400" />
              <select
                onChange={(e) => { addCity(e.target.value); e.target.value = ''; }}
                defaultValue=""
                className="text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                <option value="" disabled>Add a city…</option>
                {availableCities.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.emoji} {c.name} (UTC{c.offset >= 0 ? '+' : ''}{c.offset})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Overlap Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Work Hour Overlap</span>
            </div>
            <div className={`text-2xl font-bold ${overlapHours > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {overlapHours} <span className="text-sm font-normal text-zinc-400">hours</span>
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Cities Compared</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">
              {selectedCities.length}
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Max Spread</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">
              {selectedCities.length >= 2
                ? `${Math.abs(Math.max(...selectedCities.map(c => c.offset)) - Math.min(...selectedCities.map(c => c.offset)))}h`
                : '—'}
            </div>
          </div>
        </div>

        {/* 24-Hour Timeline */}
        {selectedCities.length >= 2 && (
          <div className="w-full max-w-full min-w-0 bg-white border border-zinc-200 rounded-xl p-4 md:p-6 overflow-x-auto">
            <div className="min-w-[700px]">
              {/* UTC Hour Labels */}
              <div className="flex items-center mb-1 pl-32 md:pl-40">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center text-[10px] text-zinc-400 font-mono">
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* City Bars */}
              {selectedCities.map((city, ci) => {
                const color = COLORS[ci];
                return (
                  <div key={city.name} className="flex items-center mb-2">
                    {/* City Label */}
                    <div className="w-32 md:w-40 shrink-0 pr-3 text-right">
                      <div className={`text-sm font-semibold truncate ${color.text}`}>
                        {city.emoji} {city.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        UTC{city.offset >= 0 ? '+' : ''}{city.offset}
                      </div>
                    </div>

                    {/* Hour blocks */}
                    <div className="flex flex-1 rounded-lg overflow-hidden border border-zinc-200">
                      {HOURS.map(h => {
                        const localHour = ((h + city.offset) % 24 + 24) % 24;
                        const isWork = localHour >= 9 && localHour < 18;
                        const allWork = selectedCities.every(c => isWorkHour(h, c.offset));

                        return (
                          <div
                            key={h}
                            className={`flex-1 h-8 flex items-center justify-center text-[9px] font-mono transition-colors ${
                              isWork
                                ? allWork
                                  ? `${color.bar} ring-1 ring-inset ring-emerald-400/30`
                                  : color.bar
                                : 'bg-zinc-100'
                            }`}
                            title={`UTC ${h}:00 → ${city.name} ${formatHour(localHour)}${isWork ? ' (work)' : ''}${allWork ? ' (overlap)' : ''}`}
                          >
                            <span className={isWork ? 'text-white/80' : 'text-zinc-400/50'}>
                              {Math.floor(localHour)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Overlap row */}
              <div className="flex items-center mt-1">
                <div className="w-32 md:w-40 shrink-0 pr-3 text-right">
                  <div className="text-xs font-semibold text-zinc-500">
                    Overlap
                  </div>
                </div>
                <div className="flex flex-1 rounded-lg overflow-hidden border border-zinc-200">
                  {HOURS.map(h => {
                    const allWork = selectedCities.every(c => isWorkHour(h, c.offset));
                    return (
                      <div
                        key={h}
                        className={`flex-1 h-6 transition-colors ${
                          allWork
                            ? 'bg-emerald-500'
                            : 'bg-zinc-100'
                        }`}
                        title={allWork ? `UTC ${h}:00 - All cities working` : `UTC ${h}:00`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pl-32 md:pl-40 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  Overlap (all working)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-zinc-300" />
                  Off-hours
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCities.length < 2 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
            <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">
              Select at least 2 cities to see timezone overlap.
            </p>
          </div>
        )}
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
