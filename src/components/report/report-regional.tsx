import type { RankedCity } from '@/app/report/page';

const TEAL = '#0d9488';
const CORAL = '#f43f5e';
const AMBER = '#f59e0b';
const INDIGO = '#6366f1';
const EMERALD = '#10b981';
const SLATE = '#64748b';

const REGION_COLORS: Record<string, string> = {
  'Asia': TEAL,
  'Europe': INDIGO,
  'South America': CORAL,
  'North America': AMBER,
  'Africa': EMERALD,
  'Oceania': '#8b5cf6',
};

interface RegionStats {
  continent: string;
  count: number;
  cities: RankedCity[];
  avgScore: number;
  avgCost: number;
  avgSpeed: number;
  color: string;
}

function computeRegions(cities: RankedCity[]): RegionStats[] {
  const map = new Map<string, RankedCity[]>();
  for (const city of cities) {
    const group = map.get(city.continent) || [];
    group.push(city);
    map.set(city.continent, group);
  }
  return [...map.entries()]
    .map(([continent, group]) => ({
      continent,
      count: group.length,
      cities: group.sort((a, b) => a.rank - b.rank),
      avgScore: Math.round(group.reduce((s, c) => s + c.nomad_score, 0) / group.length),
      avgCost: Math.round(group.reduce((s, c) => s + c.cost.monthly_total, 0) / group.length),
      avgSpeed: Math.round(group.reduce((s, c) => s + c.internet.download_mbps, 0) / group.length),
      color: REGION_COLORS[continent] || SLATE,
    }))
    .sort((a, b) => b.count - a.count);
}

export function ReportRegionalAnalysis({ cities }: { cities: RankedCity[] }) {
  const regions = computeRegions(cities);
  const totalCities = cities.length;

  return (
    <div className="report-page" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' as const }}>Back Matter</span>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: '4px 0 0 0', lineHeight: 1.1 }}>Regional Analysis</h2>
      <div style={{ height: 2, background: TEAL, marginTop: 8, marginBottom: 14 }} />

      <p style={{ fontSize: 10, lineHeight: 1.7, color: '#3f3f46', margin: '0 0 14px 0' }}>
        The 50 ranked cities span {regions.length} continents. Asia dominates in representation and affordability. European entries score higher on weather comfort at 40-80% higher monthly costs.
      </p>

      {/* Distribution bar — visual */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
          Distribution by Region
        </div>
        <div style={{ display: 'flex', width: '100%', height: 18, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
          {regions.map(r => (
            <div key={r.continent} style={{
              width: `${(r.count / totalCities) * 100}%`,
              background: r.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 700, color: '#fff',
              minWidth: 20,
            }}>
              {r.count}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 7, color: SLATE }}>
          {regions.map(r => (
            <span key={r.continent} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: r.color, display: 'inline-block' }} />
              {r.continent} ({r.count})
            </span>
          ))}
        </div>
      </div>

      {/* Region cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, flex: 1 }}>
        {regions.map(r => (
          <div key={r.continent} style={{
            flex: '1 1 calc(50% - 5px)', minWidth: 0,
            borderTop: `3px solid ${r.color}`,
            background: '#f8fafc', borderRadius: 6, padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{r.continent}</span>
              <span style={{ fontSize: 8, color: SLATE }}>{r.count} cities</span>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>{r.avgScore}</div>
                <div style={{ fontSize: 6.5, fontWeight: 600, color: SLATE, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Avg Score</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>${r.avgCost.toLocaleString()}</div>
                <div style={{ fontSize: 6.5, fontWeight: 600, color: SLATE, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Avg Cost</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>{r.avgSpeed}</div>
                <div style={{ fontSize: 6.5, fontWeight: 600, color: SLATE, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Avg Mbps</div>
              </div>
            </div>

            {/* City list */}
            <div style={{ fontSize: 8, color: '#3f3f46', lineHeight: 1.6 }}>
              {r.cities.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ', '}
                  <strong>{c.name}</strong>
                  <span style={{ color: SLATE }}> #{c.rank}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '0.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#a1a1aa' }}>
        <span>cvin.bio/report</span><span>109</span>
      </div>
    </div>
  );
}
