"use client";

import { useEffect, useState } from 'react';

type InsightsData = {
  views: number;
  uniques: number;
  sparkline: number[];
  sources: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  avgTime: number;
  shares: number;
  available: boolean;
};

function Sparkline({ data }: { data: number[] }) {
  const hasVariation = new Set(data).size > 1;
  if (!hasVariation) return null;
  const w = 48, h = 14;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * w,
    y: h - 1 - ((v / max) * (h - 2)),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-12 h-3.5 shrink-0 opacity-60" preserveAspectRatio="none">
      <path d={line} fill="none" stroke="rgb(99,102,241)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InsightsCard({ slug }: { slug: string }) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetch('/api/analytics/my-profile', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !data || !data.available) return null;

  const totalActivity = (data.views || 0) + (data.shares || 0);

  if (totalActivity < 1) return null;

  if (totalActivity < 10) {
    return (
      <div className="flex items-center justify-center gap-2 py-1 min-w-0">
        <span className="text-[10px] text-muted-foreground/40 shrink-0">▸</span>
        <span className="text-[11px] text-muted-foreground/40 min-w-0 text-center">
          Your profile has been viewed <span className="text-foreground/50 font-medium">{data.views}</span> time{data.views !== 1 ? 's' : ''} · Insights unlock after 10 views
        </span>
      </div>
    );
  }

  return (
    <button onClick={() => setExpanded(!expanded)} className="w-full text-left focus:outline-none group">
      <div className="flex items-center gap-2 py-1">
        <span className="text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
          {expanded ? '▾' : '▸'}
        </span>
        <span className="text-[11px] text-muted-foreground/50">
          <span className="font-medium text-foreground/70">{data.views}</span> views
          {data.uniques > 0 && <> · <span className="font-medium text-foreground/70">{data.uniques}</span> unique</>}
          {data.shares > 0 && <> · <span className="font-medium text-foreground/70">{data.shares}</span> shares</>}
        </span>
        <Sparkline data={data.sparkline} />
      </div>
      {expanded && (
        <div className="pb-1 pl-4 flex flex-wrap gap-x-3 gap-y-0.5 animate-in fade-in duration-150">
          {data.sources.map((s, i) => (
            <span key={`s${i}`} className="text-[10px] text-muted-foreground/50">{s.name} {s.count}</span>
          ))}
          {data.countries.map((c, i) => (
            <span key={`c${i}`} className="text-[10px] text-muted-foreground/50">{c.name} {c.count}</span>
          ))}
          {data.avgTime > 0 && <span className="text-[10px] text-muted-foreground/50">avg {data.avgTime}s</span>}
        </div>
      )}
    </button>
  );
}
