import type { RankedCity } from '@/app/report/page';

interface RegionStats {
  continent: string;
  count: number;
  avgScore: number;
  avgCost: number;
  avgSpeed: number;
  avgWeather: number;
}

function computeRegions(cities: RankedCity[]): RegionStats[] {
  const map = new Map<string, RankedCity[]>();
  for (const city of cities) {
    const group = map.get(city.continent) || [];
    group.push(city);
    map.set(city.continent, group);
  }

  const regions: RegionStats[] = [];
  for (const [continent, group] of map) {
    const n = group.length;
    regions.push({
      continent,
      count: n,
      avgScore: Math.round(group.reduce((s, c) => s + c.nomad_score, 0) / n),
      avgCost: Math.round(group.reduce((s, c) => s + c.cost.monthly_total, 0) / n),
      avgSpeed: Math.round(group.reduce((s, c) => s + c.internet.download_mbps, 0) / n),
      avgWeather: Math.round(group.reduce((s, c) => s + c.weatherScore, 0) / n),
    });
  }

  return regions.sort((a, b) => b.count - a.count);
}

export function ReportRegionalAnalysis({ cities }: { cities: RankedCity[] }) {
  const regions = computeRegions(cities);
  const maxCount = Math.max(...regions.map((r) => r.count));

  return (
    <div className="report-page" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <p
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#71717A',
            margin: 0,
          }}
        >
          Back Matter
        </p>
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          margin: '4px 0 0 0',
          lineHeight: 1.1,
        }}
      >
        Regional Analysis
      </h2>
      <hr className="section-rule" style={{ marginTop: 12, marginBottom: 24 }} />

      {/* Intro */}
      <p style={{ fontSize: 10, color: '#71717A', margin: '0 0 20px 0', lineHeight: 1.6, maxWidth: '80%' }}>
        Aggregate performance across {regions.length} regions. Averages are computed from the top {cities.length} ranked
        cities in this report.
      </p>

      {/* Data Table */}
      <table className="report-table" style={{ marginBottom: 28 }}>
        <thead>
          <tr>
            <th style={{ width: '22%' }}>Region</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Cities</th>
            <th style={{ width: '14%', textAlign: 'right' }}>Avg Score</th>
            <th style={{ width: '18%', textAlign: 'right' }}>Avg Cost</th>
            <th style={{ width: '18%', textAlign: 'right' }}>Avg Speed</th>
            <th style={{ width: '18%', textAlign: 'right' }}>Avg Weather</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.continent}>
              <td style={{ fontWeight: 600, fontSize: 9.5 }}>{r.continent}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{r.count}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.avgScore}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${r.avgCost.toLocaleString()}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.avgSpeed} Mbps</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.avgWeather}/100</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Horizontal Bar Chart */}
      <div style={{ marginBottom: 8 }}>
        <p
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#71717A',
            margin: '0 0 14px 0',
          }}
        >
          Cities per Region
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {regions.map((r) => (
            <div key={r.continent} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Label */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  width: 100,
                  flexShrink: 0,
                  textAlign: 'right',
                  color: '#09090B',
                }}
              >
                {r.continent}
              </span>

              {/* Bar */}
              <div style={{ flex: 1, position: 'relative', height: 16 }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${(r.count / maxCount) * 100}%`,
                    background: '#09090B',
                    borderRadius: 2,
                    minWidth: 2,
                  }}
                />
              </div>

              {/* Value */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  width: 24,
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {r.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '0.5px solid #e4e4e7',
          paddingTop: 10,
        }}
      >
        <span style={{ fontSize: 7.5, color: '#71717A', letterSpacing: '0.05em' }}>
          DIGITAL NOMAD CITIES REPORT
        </span>
        <span
          style={{
            fontSize: 7.5,
            color: '#71717A',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
          }}
        >
          Regional Analysis
        </span>
      </div>
    </div>
  );
}
