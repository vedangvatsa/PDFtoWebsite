import type { RankedCity } from '@/app/report/page';

const TEAL = '#0d9488';
const SLATE = '#64748b';

export function ReportOverallRanking({ cities }: { cities: RankedCity[] }) {
  const maxScore = Math.max(...cities.map(c => c.nomad_score));

  return (
    <div className="report-page" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' as const }}>Rankings</span>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: '4px 0 0 0', lineHeight: 1.1 }}>Overall Rankings</h2>
      <div style={{ height: 2, background: TEAL, marginTop: 8, marginBottom: 12 }} />

      <p style={{ fontSize: 10, lineHeight: 1.7, color: '#3f3f46', margin: '0 0 10px 0' }}>
        Cities ranked by combined nomad score—factoring cost of living, internet speed, weather comfort, and remote work infrastructure. Score is out of 100.
      </p>

      {/* Top 3 hero */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {cities.slice(0, 3).map((c, i) => (
          <div key={c.slug} style={{
            flex: 1, borderRadius: 6, overflow: 'hidden',
            background: i === 0 ? TEAL : '#f8fafc',
            color: i === 0 ? '#fff' : '#09090B',
            padding: '14px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>#{i + 1}</span>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{c.name}</div>
            <div style={{ fontSize: 8, color: i === 0 ? 'rgba(255,255,255,0.6)' : SLATE }}>{c.country}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, letterSpacing: '-0.02em' }}>
              {c.nomad_score}
              <span style={{ fontSize: 10, fontWeight: 400, color: i === 0 ? 'rgba(255,255,255,0.6)' : SLATE }}>/100</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full table with score bars */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5 }}>
          <thead>
            <tr>
              {['#', '', 'CITY', 'COUNTRY', 'SCORE', ''].map((h, i) => (
                <th key={i} style={{
                  fontSize: 7, fontWeight: 700, letterSpacing: '0.06em', color: SLATE,
                  padding: '4px 0', borderBottom: `1.5px solid ${TEAL}`,
                  textAlign: i < 2 ? 'center' : i > 3 ? 'right' : 'left',
                  width: i === 0 ? 22 : i === 1 ? 20 : i === 5 ? 100 : undefined,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cities.map((c, i) => (
              <tr key={c.slug}>
                <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', textAlign: 'center', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: i < 10 ? '#09090B' : '#94a3b8', fontSize: i < 3 ? 10 : 8.5 }}>{i + 1}</td>
                <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', textAlign: 'center', fontSize: 11 }}>{c.emoji}</td>
                <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', fontWeight: i < 10 ? 700 : 500 }}>{c.name}</td>
                <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', color: SLATE }}>{c.country}</td>
                <td style={{ padding: '3px 0', borderBottom: '0.5px solid #f1f5f9', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{c.nomad_score}</td>
                <td style={{ padding: '3px 2px', borderBottom: '0.5px solid #f1f5f9' }}>
                  <div style={{ width: '100%', height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.nomad_score / maxScore) * 100}%`, height: '100%', background: i < 3 ? TEAL : i < 10 ? '#5eead4' : '#cbd5e1', borderRadius: 3 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '0.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#a1a1aa' }}>
        <span>cvin.bio/report</span><span>5</span>
      </div>
    </div>
  );
}
