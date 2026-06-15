import type { RankedCity } from '@/app/report/page';

const TEAL = '#0d9488';
const SLATE = '#64748b';
const INDIGO = '#6366f1';

export function ReportWeatherRanking({ cities }: { cities: RankedCity[] }) {
  const maxScore = Math.max(...cities.map(c => c.weatherScore));

  return (
    <div className="report-page" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' as const }}>Rankings</span>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: '4px 0 0 0', lineHeight: 1.1 }}>Weather Comfort</h2>
      <div style={{ height: 2, background: TEAL, marginTop: 8, marginBottom: 12 }} />

      <p style={{ fontSize: 10, lineHeight: 1.7, color: '#3f3f46', margin: '0 0 10px 0' }}>
        Scored by deviation from 24°C, humidity penalty, and rainfall. Canary Islands and Mediterranean climates score highest. Tropical humidity brings scores down.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5, flex: 1 }}>
        <thead>
          <tr>
            {['#', '', 'CITY', 'COUNTRY', 'SCORE', 'TEMP', 'HUM', ''].map((h, i) => (
              <th key={i} style={{
                fontSize: 7, fontWeight: 700, letterSpacing: '0.06em', color: SLATE,
                padding: '4px 0', borderBottom: `1.5px solid ${TEAL}`,
                textAlign: i < 2 ? 'center' : i > 3 ? 'right' : 'left',
                width: i === 0 ? 22 : i === 1 ? 20 : i === 7 ? 80 : undefined,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cities.map((c, i) => (
            <tr key={c.slug}>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', textAlign: 'center', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: i < 10 ? '#09090B' : '#94a3b8' }}>{i + 1}</td>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', textAlign: 'center', fontSize: 11 }}>{c.emoji}</td>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', fontWeight: i < 10 ? 700 : 500 }}>{c.name}</td>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', color: SLATE }}>{c.country}</td>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', fontWeight: 800, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.weatherScore}</td>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: SLATE }}>{c.weather.avg_temp.toFixed(1)}°</td>
              <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#94a3b8' }}>{c.weather.avg_humidity}%</td>
              <td style={{ padding: '3px 2px', borderBottom: '0.5px solid #f1f5f9' }}>
                <div style={{ width: '100%', height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.weatherScore / maxScore) * 100}%`, height: '100%', background: i < 3 ? INDIGO : i < 10 ? '#a5b4fc' : '#e2e8f0', borderRadius: 3 }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '0.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#a1a1aa' }}>
        <span>cvin.bio/report</span><span>8</span>
      </div>
    </div>
  );
}
