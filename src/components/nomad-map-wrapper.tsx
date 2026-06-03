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
        <div className="w-full h-[600px] rounded-xl bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Loading map…</p>
        </div>
      </div>
    ),
  }
);

export function NomadMapWrapper() {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    fetch('/nomad-data.json')
      .then(res => res.json())
      .then(setData)
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
        <div className="w-full h-[600px] rounded-xl bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Loading 4,400+ places…</p>
        </div>
      </div>
    );
  }

  return <NomadMap data={data} />;
}
