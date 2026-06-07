'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const NomadMap = dynamic(
  () => import('@/components/nomad-map').then(m => m.NomadMap),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        {/* Skeleton stats */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="h-7 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-7 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-muted animate-pulse" />
        </div>
        {/* Skeleton filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-64 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-64 rounded-lg bg-muted animate-pulse" />
        </div>
        {/* Skeleton category pills */}
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
        </div>
        {/* Skeleton map */}
        <div className="w-full h-[600px] rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Loading map…</p>
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

  useEffect(() => {
    fetch('/nomad-data-slim.json')
      .then(res => res.json())
      .then(slim => setData(expandData(slim)))
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        {/* Skeleton stats */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="h-7 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-7 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-muted animate-pulse" />
        </div>
        {/* Skeleton filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-64 rounded-lg bg-muted animate-pulse" />
          <div className="h-10 w-64 rounded-lg bg-muted animate-pulse" />
        </div>
        {/* Skeleton category pills */}
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
        </div>
        {/* Skeleton map */}
        <div className="w-full h-[600px] rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Loading 4,400+ places…</p>
        </div>
      </div>
    );
  }

  return <NomadMap data={data} />;
}
