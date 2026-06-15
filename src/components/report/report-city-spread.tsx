import type { RankedCity } from '@/app/report/page';
import CITY_DESCRIPTIONS from '@/lib/city-descriptions';

const MONTHS_SHORT = ['J','F','M','A','M','J','J','A','S','O','N','D'];

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

/* ── Color palette (60-30-10 rule) ── */
const TEAL = '#0d9488';
const CORAL = '#f43f5e';
const AMBER = '#f59e0b';
const SLATE = '#64748b';
const LIGHT_TEAL = '#ccfbf1';
const LIGHT_CORAL = '#ffe4e6';

/* ── Cost breakdown colors ── */
const COST_COLORS = {
  rent: TEAL,
  food: CORAL,
  coworking: AMBER,
  transport: SLATE,
  other: '#cbd5e1',
};

export function ReportCitySpread({
  city,
  allCities,
}: {
  city: RankedCity;
  allCities: RankedCity[];
}) {
  const { cost, internet, weather, spaces, nearby } = city;
  const total = cost.monthly_total;
  const pageBase = 9 + (city.rank - 1) * 2;
  const desc = CITY_DESCRIPTIONS[city.slug] || '';

  const nearbyCities = nearby
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter(Boolean) as RankedCity[];

  const internetRank = [...allCities].sort((a, b) => b.internet.download_mbps - a.internet.download_mbps).findIndex(c => c.slug === city.slug) + 1;
  const costRank = [...allCities].sort((a, b) => a.cost.monthly_total - b.cost.monthly_total).findIndex(c => c.slug === city.slug) + 1;
  const weatherRank = [...allCities].sort((a, b) => b.weatherScore - a.weatherScore).findIndex(c => c.slug === city.slug) + 1;

  /* Cost breakdown percentages */
  const costParts = [
    { label: 'Rent', value: cost.rent, color: COST_COLORS.rent, pct: Math.round((cost.rent / total) * 100) },
    { label: 'Food', value: cost.food, color: COST_COLORS.food, pct: Math.round((cost.food / total) * 100) },
    { label: 'Coworking', value: cost.coworking, color: COST_COLORS.coworking, pct: Math.round((cost.coworking / total) * 100) },
    { label: 'Transport', value: cost.transport, color: COST_COLORS.transport, pct: Math.round((cost.transport / total) * 100) },
    { label: 'Other', value: cost.other, color: COST_COLORS.other, pct: Math.round((cost.other / total) * 100) },
  ];

  /* Temperature bar heights (normalize to 40px max) */
  const maxTemp = Math.max(...weather.monthly.map(m => m.temp));
  const maxRain = Math.max(...weather.monthly.map(m => m.rain), 1);

  /* Alternate layouts for visual variety */
  const layoutVariant = city.rank % 3; // 0, 1, or 2

  return (
    <>
      {/* ═══ PAGE 1 — PHOTO PAGE ═══ */}
      <div className="report-page" style={{
        padding: 0,
        display: 'flex',
        flexDirection: layoutVariant === 1 ? 'row-reverse' : 'column',
        overflow: 'hidden',
      }}>
        {layoutVariant === 1 ? (
          /* Variant B: Side-by-side — photo right, text left */
          <>
            <div style={{ flex: 1, padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' as const, marginBottom: 6 }}>
                #{city.rank} · {city.continent}
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, margin: '0 0 6px 0' }}>{city.name}</h2>
              <div style={{ fontSize: 11, color: SLATE, marginBottom: 20 }}>{city.country}</div>

              {/* Hero cost */}
              <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em', color: TEAL, lineHeight: 1, marginBottom: 4 }}>
                {fmt(total)}
                <span style={{ fontSize: 18, fontWeight: 400, color: SLATE }}>/mo</span>
              </div>
              <div style={{ fontSize: 9, color: SLATE, marginBottom: 20 }}>Total estimated monthly budget</div>

              {/* Stacked bar */}
              <div style={{ display: 'flex', width: '100%', height: 14, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                {costParts.map(p => (
                  <div key={p.label} style={{ width: `${p.pct}%`, background: p.color, minWidth: 2 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, fontSize: 7.5, color: '#52525b', marginBottom: 20 }}>
                {costParts.map(p => (
                  <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: p.color, display: 'inline-block' }} />
                    {p.label} ({p.pct}%)
                  </span>
                ))}
              </div>

              {/* Score + Speed inline */}
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{city.nomad_score}</div>
                  <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.1em', color: SLATE, textTransform: 'uppercase' as const }}>Score</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{internet.download_mbps.toFixed(0)}</div>
                  <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.1em', color: SLATE, textTransform: 'uppercase' as const }}>Mbps</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{weather.avg_temp.toFixed(0)}°</div>
                  <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.1em', color: SLATE, textTransform: 'uppercase' as const }}>Avg Temp</div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', fontSize: 7, color: '#a1a1aa' }}>
                <span>cvin.bio/{city.slug}</span>
                <span style={{ float: 'right', fontVariantNumeric: 'tabular-nums' }}>{pageBase}</span>
              </div>
            </div>
            {/* Photo right */}
            <div style={{ width: '50%', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={city.imageUrl} alt={`Digital nomad report on coliving and coworking in ${city.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </>
        ) : (
          /* Variant A & C: Full-bleed photo with overlay */
          <>
            {/* Full-bleed photo */}
            <div style={{ width: '100%', height: layoutVariant === 0 ? '55%' : '45%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={city.imageUrl} alt={`Digital nomad guide to ${city.name}, ${city.country} - Cost of living and wifi speeds`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              }} />
              <div style={{ position: 'absolute', bottom: 24, left: 32, right: 32 }}>
                <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, marginBottom: 4 }}>
                  #{city.rank} · {city.country} · {city.continent}
                </div>
                <h2 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.92, color: '#fff', margin: 0 }}>
                  {city.name}
                </h2>
              </div>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, padding: '20px 32px 16px', display: 'flex', flexDirection: 'column' }}>

              {/* Hero cost stat — LARGE */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 4 }}>
                <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', color: TEAL, lineHeight: 1 }}>
                  {fmt(total)}
                  <span style={{ fontSize: 16, fontWeight: 400, color: SLATE }}>/mo</span>
                </div>
                <div style={{ fontSize: 9, color: SLATE }}>Total estimated monthly budget</div>
              </div>

              {/* Stacked cost bar */}
              <div style={{ display: 'flex', width: '100%', height: 12, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                {costParts.map(p => (
                  <div key={p.label} style={{ width: `${p.pct}%`, background: p.color, minWidth: 2 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, fontSize: 7.5, color: '#52525b', marginBottom: 16 }}>
                {costParts.map(p => (
                  <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: p.color, display: 'inline-block' }} />
                    {p.label} {fmt(p.value)} ({p.pct}%)
                  </span>
                ))}
              </div>

              {/* Three big stats */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                {[
                  { value: city.nomad_score.toString(), unit: '/100', label: 'Nomad Score', rank: `#${city.rank}` },
                  { value: internet.download_mbps.toFixed(0), unit: ' Mbps', label: 'Download Speed', rank: `#${internetRank}` },
                  { value: `${weather.avg_temp.toFixed(0)}°`, unit: 'C', label: 'Avg Temperature', rank: `#${weatherRank}` },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, borderLeft: `3px solid ${TEAL}`, paddingLeft: 10 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {s.value}<span style={{ fontSize: 11, fontWeight: 400, color: SLATE }}>{s.unit}</span>
                    </div>
                    <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.08em', color: SLATE, textTransform: 'uppercase' as const, marginTop: 2 }}>
                      {s.label} <span style={{ color: TEAL }}>{s.rank}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p style={{ fontSize: 9, lineHeight: 1.8, color: '#3f3f46', margin: '0 0 0 0', textAlign: 'justify' as const }}>
                {desc}
              </p>

              {/* Footer */}
              <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `0.5px solid #e4e4e7`, display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#a1a1aa' }}>
                <span>cvin.bio/{city.slug}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pageBase}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ PAGE 2 — DATA VISUALIZATION PAGE ═══ */}
      <div className="report-page" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>

        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>{city.name}</span>
            <span style={{ fontSize: 8, color: SLATE }}>{city.country}</span>
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
            Data Profile
          </div>
        </div>
        <div style={{ height: 2, background: TEAL, marginBottom: 18 }} />

        {/* ── CLIMATE VISUALIZATION ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 10, textTransform: 'uppercase' as const }}>
            Monthly Climate · Temperature & Rainfall
          </div>

          {/* Dual chart: temp bars + rain bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70, marginBottom: 4 }}>
            {weather.monthly.map((m, i) => {
              const tempH = Math.max(8, (m.temp / maxTemp) * 55);
              const rainH = Math.max(2, (m.rain / maxRain) * 55);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <div style={{ fontSize: 6.5, fontWeight: 700, color: '#3f3f46', marginBottom: 2 }}>{m.temp.toFixed(0)}°</div>
                  <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 50 }}>
                    <div style={{ width: 8, height: tempH, background: TEAL, borderRadius: '2px 2px 0 0' }} />
                    <div style={{ width: 8, height: rainH, background: '#93c5fd', borderRadius: '2px 2px 0 0', opacity: 0.7 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {MONTHS_SHORT.map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 7, fontWeight: 600, color: SLATE }}>{m}</div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, fontSize: 7, color: SLATE }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: TEAL, display: 'inline-block' }} /> Temperature (°C)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#93c5fd', opacity: 0.7, display: 'inline-block' }} /> Rainfall (mm)
            </span>
            <span style={{ marginLeft: 'auto' }}>
              Annual: {weather.avg_temp.toFixed(1)}°C avg · {weather.annual_rain.toLocaleString()} mm · {weather.avg_humidity}% humidity
            </span>
          </div>
        </div>

        {/* ── INTERNET & COST DETAIL — Two columns ── */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>

          {/* Left: Internet */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 8, textTransform: 'uppercase' as const }}>
              Internet Connectivity
            </div>

            {/* Speed bars */}
            {[
              { label: 'Download', value: internet.download_mbps, max: 250, color: TEAL },
              { label: 'Upload', value: internet.upload_mbps, max: 150, color: CORAL },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: '#3f3f46' }}>{s.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 800 }}>{s.value.toFixed(0)} Mbps</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (s.value / s.max) * 100)}%`, height: '100%', background: s.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
            <div style={{ fontSize: 8, color: SLATE, marginTop: 4 }}>
              Latency: <strong>{internet.latency_ms} ms</strong> · {internet.test_count.toLocaleString()} tests · {internet.quarter}
            </div>
            <div style={{ fontSize: 8, color: TEAL, fontWeight: 700, marginTop: 2 }}>
              Rank #{internetRank} of 50 cities
            </div>
          </div>

          {/* Right: Cost detail */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 8, textTransform: 'uppercase' as const }}>
              Cost Breakdown
            </div>
            {costParts.map(p => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, marginRight: 6, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 8.5, color: '#3f3f46' }}>{p.label}</span>
                <span style={{ fontSize: 9, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginRight: 8 }}>{fmt(p.value)}</span>
                <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ fontSize: 8, color: TEAL, fontWeight: 700, marginTop: 4 }}>
              Rank #{costRank} of 50 (cheapest first)
            </div>
          </div>
        </div>

        {/* ── RANKINGS SUMMARY ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 8, textTransform: 'uppercase' as const }}>
            Ranking Position
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Overall', rank: city.rank, value: `${city.nomad_score}/100`, color: TEAL },
              { label: 'Cost', rank: costRank, value: fmt(total), color: CORAL },
              { label: 'Internet', rank: internetRank, value: `${internet.download_mbps.toFixed(0)} Mbps`, color: AMBER },
              { label: 'Weather', rank: weatherRank, value: `${city.weatherScore}/100`, color: '#6366f1' },
            ].map(r => (
              <div key={r.label} style={{ flex: 1, background: '#f8fafc', borderRadius: 6, padding: '10px 12px', borderTop: `3px solid ${r.color}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>#{r.rank}</div>
                <div style={{ fontSize: 7, fontWeight: 600, color: SLATE, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 2 }}>{r.label}</div>
                <div style={{ fontSize: 8, color: '#71717A', marginTop: 2 }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SPACES & NEARBY ── */}
        <div style={{ display: 'flex', gap: 24, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
              Remote Work Spaces
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {[
                { label: 'Coworking', count: spaces.coworking, icon: '💻' },
                { label: 'Coliving', count: spaces.coliving, icon: '🏠' },
                { label: 'Hostels', count: spaces.hostel, icon: '🛏' },
                { label: 'Apartments', count: spaces.apartment, icon: '🏢' },
                { label: 'Guesthouses', count: spaces.guesthouse, icon: '🏡' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', borderRadius: 4, padding: '4px 8px', fontSize: 8 }}>
                  <span>{s.icon}</span>
                  <span style={{ fontWeight: 700 }}>{s.count}</span>
                  <span style={{ color: SLATE }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: TEAL, marginTop: 6 }}>{spaces.total} total spaces</div>
          </div>

          {nearbyCities.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
                Nearby Ranked Cities
              </div>
              {nearbyCities.slice(0, 3).map(nc => (
                <div key={nc.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '0.5px solid #e2e8f0', fontSize: 8.5 }}>
                  <span>
                    <span style={{ marginRight: 4 }}>{nc.emoji}</span>
                    <strong>{nc.name}</strong>
                    <span style={{ color: SLATE, marginLeft: 4 }}>{nc.country}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: TEAL }}>#{nc.rank}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '0.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#a1a1aa' }}>
          <span>cvin.bio/{city.slug}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pageBase + 1}</span>
        </div>
      </div>
    </>
  );
}
