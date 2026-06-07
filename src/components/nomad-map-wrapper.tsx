'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useTransition } from 'react';

const NomadMap = dynamic(
  () => import('@/components/nomad-map').then(m => m.NomadMap),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        {/* Skeleton stats */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="h-7 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-7 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        {/* Skeleton filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-10 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        {/* Skeleton category pills */}
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        {/* Skeleton map */}
        <div className="w-full h-[600px] rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading map…</p>
        </div>
      </div>
    ),
  }
);

// Expand short keys from slim JSON back to full field names
interface SlimPOI {
  i: string; n: string; c: string; a: number; o: number;
  t: string; r: string; w: string; q: number; g: number; v: number; d: string;
}

function expandData(slim: SlimPOI[]) {
  return slim.map(s => ({
    osm_id: s.i,
    name: s.n,
    category: s.c,
    lat: s.a,
    lon: s.o,
    city: s.t,
    country: s.r,
    website: s.w,
    quality: s.q,
    google_rating: s.g,
    google_review_count: s.v,
    address: s.d,
    phone: '',
    opening_hours: '',
    wifi: '',
    cost_tier: 0,
    timezone: '',
    visa: '',
    osm_url: '',
    review_summary: '',
  }));
}

export function NomadMapWrapper() {
  const [data, setData] = useState<any[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/nomad-data-slim.json', { signal: controller.signal })
      .then(res => res.json())
      .then(slim => {
        // Defer heavy expansion to avoid blocking first paint
        startTransition(() => {
          setData(expandData(slim));
        });
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return () => controller.abort();
  }, [startTransition]);

  if (!data) {
    return (
      <div className="space-y-6">
        {/* Skeleton stats */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="h-7 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-7 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        {/* Skeleton filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-10 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        {/* Skeleton category pills */}
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        {/* Skeleton map */}
        <div className="w-full h-[600px] rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading 4,400+ places…</p>
        </div>
      </div>
    );
  }

  return <NomadMap data={data} />;
}
