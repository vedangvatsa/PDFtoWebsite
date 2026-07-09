'use client';
import { PAGE_CONTAINER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/utils';
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Plus, Trash2, AlertTriangle, CheckCircle2, Info, Calendar } from 'lucide-react';

interface Trip { id: number; start: string; end: string; }

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000) + 1);
}

function countDaysInWindow(trips: Trip[], refDate: Date): number {
  const windowStart = new Date(refDate);
  windowStart.setDate(windowStart.getDate() - 179);
  let total = 0;
  for (const t of trips) {
    if (!t.start || !t.end) continue;
    const ts = new Date(t.start);
    const te = new Date(t.end);
    const overlapStart = ts < windowStart ? windowStart : ts;
    const overlapEnd = te > refDate ? refDate : te;
    if (overlapStart <= overlapEnd) total += daysBetween(overlapStart, overlapEnd);
  }
  return total;
}

function findNextEntry(trips: Trip[]): string | null {
  const today = new Date();
  for (let d = 0; d <= 180; d++) {
    const check = new Date(today);
    check.setDate(check.getDate() + d);
    if (countDaysInWindow(trips, check) < 90) {
      if (d === 0) return null;
      return check.toISOString().split('T')[0];
    }
  }
  return null;
}

let idCounter = 1;

export default function SchengenPage() {
  const [trips, setTrips] = useState<Trip[]>([{ id: idCounter++, start: '', end: '' }]);

  const addTrip = useCallback(() => {
    if (trips.length >= 10) return;
    setTrips(prev => [...prev, { id: idCounter++, start: '', end: '' }]);
  }, [trips.length]);

  const removeTrip = useCallback((id: number) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTrip = useCallback((id: number, field: 'start' | 'end', value: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }, []);

  const today = new Date();
  const daysUsed = useMemo(() => countDaysInWindow(trips, today), [trips]);
  const daysRemaining = Math.max(0, 90 - daysUsed);
  const pct = Math.min(100, Math.round((daysUsed / 90) * 100));
  const nextEntry = useMemo(() => daysRemaining === 0 ? findNextEntry(trips) : null, [trips, daysRemaining]);

  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  const statusColor = daysRemaining <= 10 ? 'text-red-600' : daysRemaining <= 30 ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className={PAGE_CONTAINER}>
        <Link href="/nomad" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <div className="mb-10">
          <h1 className={PAGE_TITLE}>Schengen Calculator</h1>
          <p className={PAGE_SUBTITLE}>Track your stays in the Schengen zone. The 90/180 rule allows maximum 90 days in any rolling 180-day period.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Days Used</div>
            <div className={`text-3xl font-bold ${statusColor}`}>{daysUsed}</div>
            <div className="text-xs text-zinc-500">of 90 allowed</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Days Remaining</div>
            <div className={`text-3xl font-bold ${statusColor}`}>{daysRemaining}</div>
            <div className="text-xs text-zinc-500">in current window</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 col-span-2">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Usage</div>
            <div className="w-full h-3 rounded-full bg-zinc-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-zinc-500"><span>{pct}% used</span><span>90 day limit</span></div>
          </div>
        </div>

        {daysRemaining <= 10 && daysRemaining > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0" /> Warning: Only {daysRemaining} days remaining. Plan your exit carefully.
          </div>
        )}

        {daysRemaining === 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0" /> Limit reached! {nextEntry ? `You can re-enter on ${nextEntry}.` : 'You must leave the Schengen zone.'}
          </div>
        )}

        {/* Trip inputs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-900">Your Trips</h2>
            <button onClick={addTrip} disabled={trips.length >= 10} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 transition-all disabled:opacity-40">
              <Plus className="w-3.5 h-3.5" /> Add Trip
            </button>
          </div>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3">
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                  <input type="date" value={trip.start} onChange={e => updateTrip(trip.id, 'start', e.target.value)} className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 outline-none" />
                  <span className="text-xs text-zinc-400 text-center sm:text-left">to</span>
                  <input type="date" value={trip.end} onChange={e => updateTrip(trip.id, 'end', e.target.value)} className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 outline-none" />
                </div>
                {trip.start && trip.end && (
                  <span className="text-xs font-mono text-zinc-500 shrink-0">{daysBetween(new Date(trip.start), new Date(trip.end))}d</span>
                )}
                {trips.length > 1 && (
                  <button onClick={() => removeTrip(trip.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900">How the 90/180 Rule Works</h3>
          </div>
          <div className="space-y-2 text-sm text-zinc-600">
            <p>The Schengen area allows stays of up to <strong>90 days within any 180-day period</strong>. This is a rolling window, not a calendar year.</p>
            <p>For any given day, the system looks back 180 days and counts how many of those days were spent in the Schengen zone. If the count reaches 90, you must leave.</p>
            <p className="text-xs text-zinc-400 pt-2">⚠️ Since April 2026, the EU Entry/Exit System (EES) biometrically tracks all border crossings. Overstays are flagged instantly.</p>
          </div>
        </div>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
