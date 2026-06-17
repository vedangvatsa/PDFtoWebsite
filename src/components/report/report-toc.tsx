import type { RankedCity } from '@/app/report/page';

const SECTIONS = [
  { title: 'Methodology', subtitle: 'Scoring model, data sources, and selection criteria', page: 3 },
  { title: 'Overall Rankings', subtitle: 'Top 50 cities ranked by composite Nomad Score', page: 4 },
  { title: 'Internet Speed Rankings', subtitle: 'Sorted by median download speed from Speedtest by Ookla', page: 6 },
  { title: 'Cost of Living Rankings', subtitle: 'Monthly USD estimates, cheapest to most expensive', page: 7 },
  { title: 'Weather Comfort Rankings', subtitle: 'Composite of temperature, humidity, and rainfall', page: 8 },
];

export function ReportTOC({ cities }: { cities: RankedCity[] }) {
  const mid = Math.ceil(cities.length / 2);
  const col1 = cities.slice(0, mid);
  const col2 = cities.slice(mid);

  // Region counts for summary
  const regions = new Map<string, number>();
  cities.forEach(c => regions.set(c.continent, (regions.get(c.continent) || 0) + 1));

  return (
    <div className="report-page" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#71717A' }}>
          TABLE OF CONTENTS
        </span>
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: '4px 0 0 0', lineHeight: 1.1 }}>
        Contents
      </h2>
      <hr className="section-rule" style={{ marginTop: 12, marginBottom: 20 }} />

      {/* Intro text */}
      <p style={{ fontSize: 10, lineHeight: 1.7, color: '#52525b', margin: '0 0 20px 0', maxWidth: '85%' }}>
        This report profiles the top 50 cities for digital nomads, selected from a pool of 100 candidates across {regions.size} continents and {new Set(cities.map(c => c.country)).size} countries. Each city receives a two-page spread with cost analysis, internet data, climate charts, and practical details.
      </p>

      {/* Main sections */}
      <div style={{ marginBottom: 24 }}>
        {SECTIONS.map((s) => (
          <div key={s.title} style={{
            display: 'flex', alignItems: 'baseline', padding: '10px 0',
            borderBottom: '0.5px solid #f4f4f5',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 8, color: '#a1a1aa', marginTop: 2 }}>{s.subtitle}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#71717A', marginLeft: 12 }}>{s.page}</span>
          </div>
        ))}
      </div>

      {/* City Profiles section */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>City Profiles</span>
            <span style={{ fontSize: 8, color: '#a1a1aa', marginLeft: 8 }}>Two-page spreads for each ranked city</span>
          </div>
          <span style={{ fontSize: 8, color: '#a1a1aa' }}>Pages 9 – 108</span>
        </div>
        <hr className="section-rule" style={{ marginTop: 8, marginBottom: 10 }} />
      </div>

      {/* Two-column city list */}
      <div style={{ display: 'flex', gap: 20, flex: 1 }}>
        <div style={{ flex: 1 }}>
          {col1.map((city, i) => (
            <div key={city.slug} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '3px 0', fontSize: 9,
              borderBottom: (i + 1) % 5 === 0 ? '0.5px solid #f4f4f5' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#a1a1aa', fontVariantNumeric: 'tabular-nums', width: 14, textAlign: 'right' }}>{i + 1}</span>
                <span>{city.emoji} {city.name}</span>
                <span style={{ fontSize: 7, color: '#d4d4d8' }}>{city.country}</span>
              </div>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#71717A', fontSize: 8 }}>{9 + i * 2}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {col2.map((city, i) => (
            <div key={city.slug} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '3px 0', fontSize: 9,
              borderBottom: (i + 1) % 5 === 0 ? '0.5px solid #f4f4f5' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#a1a1aa', fontVariantNumeric: 'tabular-nums', width: 14, textAlign: 'right' }}>{mid + i + 1}</span>
                <span>{city.emoji} {city.name}</span>
                <span style={{ fontSize: 7, color: '#d4d4d8' }}>{city.country}</span>
              </div>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#71717A', fontSize: 8 }}>{9 + (mid + i) * 2}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back matter */}
      <div style={{ marginTop: 16, paddingTop: 10, borderTop: '0.5px solid #e4e4e7' }}>
        {[
          { title: 'Regional Analysis', page: 109 },
          { title: 'Sources & About', page: 110 },
        ].map(s => (
          <div key={s.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 10 }}>
            <span style={{ fontWeight: 600, color: '#52525b' }}>{s.title}</span>
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#71717A' }}>{s.page}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '0.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 7, color: '#a1a1aa' }}>cvin.bio/report</span>
        <span style={{ fontSize: 8, fontWeight: 600, color: '#71717A', fontVariantNumeric: 'tabular-nums' }}>2</span>
      </div>
    </div>
  );
}
