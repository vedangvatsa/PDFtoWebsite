'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useTransition } from 'react';

const NomadMap = dynamic(
  () => import('@/components/nomad-map').then(m => m.NomadMap),
  {
    ssr: false,
    loading: () => <MapSkeleton message="Loading map…" />,
  }
);

function MapSkeleton({ message }: { message: string }) {
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
        <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

// Compact v2 format: arrays with lookup tables instead of repeated key-value objects
// Category indices: 0=coliving, 1=hostel, 2=apartment, 3=guesthouse
const CATEGORIES = ['coliving', 'hostel', 'apartment', 'guesthouse'] as const;

interface V2Data {
  c: string[];  // city|country lookup table
  d: [          // array-of-arrays
    string, // 0: osm_id
    string, // 1: name
    number, // 2: category index
    number, // 3: lat
    number, // 4: lon
    number, // 5: city+country lookup index
    string, // 6: website
    number, // 7: quality
    number, // 8: google_rating
    number, // 9: google_review_count
    string, // 10: address
  ][];
}

function expandV2(v2: V2Data) {
  const { c: cityLookup, d: rows } = v2;
  const result = new Array(rows.length);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cityCountry = cityLookup[row[5]];
    const sepIdx = cityCountry.indexOf('|');

    result[i] = {
      osm_id: row[0],
      name: row[1],
      category: CATEGORIES[row[2]],
      lat: row[3],
      lon: row[4],
      city: cityCountry.substring(0, sepIdx),
      country: cityCountry.substring(sepIdx + 1),
      website: row[6],
      quality: row[7],
      google_rating: row[8],
      google_review_count: row[9],
      address: row[10],
      phone: '',
      opening_hours: '',
      wifi: '',
      cost_tier: 0,
      timezone: '',
      visa: '',
      osm_url: '',
      review_summary: '',
    };
  }

  return result;
}

export function NomadMapWrapper() {
  const [data, setData] = useState<any[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/nomad-data-v2.json', { signal: controller.signal })
      .then(res => res.json())
      .then((v2: V2Data) => {
        // Defer heavy expansion to avoid blocking first paint
        startTransition(() => {
          setData(expandV2(v2));
        });
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return () => controller.abort();
  }, [startTransition]);

  if (!data) {
    return <MapSkeleton message="Loading 4,400+ places…" />;
  }

  return <NomadMap data={data} />;
}
