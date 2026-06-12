import type { RankedCity } from '@/app/report/page';

const SECTIONS = [
  { title: 'Methodology', page: 3 },
  { title: 'Overall Rankings', page: 4 },
  { title: 'Internet Speed Rankings', page: 6 },
  { title: 'Cost of Living Rankings', page: 7 },
  { title: 'Weather Rankings', page: 8 },
];

export function ReportTOC({ cities }: { cities: RankedCity[] }) {
  const mid = Math.ceil(cities.length / 2);
  const col1 = cities.slice(0, mid);
  const col2 = cities.slice(mid);

  return (
    <div className="report-page" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 600,
          color: '#71717A',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
        }}
      >
        CONTENTS
      </span>
      <hr className="section-rule" style={{ marginTop: 8, marginBottom: 20 }} />

      {/* Main sections */}
      <div style={{ marginBottom: 20 }}>
        {SECTIONS.map((s) => (
          <div className="toc-entry" key={s.title}>
            <span style={{ fontWeight: 600 }}>{s.title}</span>
            <span className="toc-dots" />
            <span className="toc-page">{s.page}</span>
          </div>
        ))}
      </div>

      {/* City Profiles sub-header */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 600,
          color: '#71717A',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 8,
          display: 'block',
        }}
      >
        City Profiles
      </span>
      <hr className="section-rule" style={{ marginTop: 0, marginBottom: 12 }} />

      {/* Two-column city list */}
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        {/* Column 1 */}
        <div style={{ flex: 1 }}>
          {col1.map((city, i) => (
            <div className="toc-entry" key={city.slug}>
              <span>
                {city.emoji} {city.name}
              </span>
              <span className="toc-dots" />
              <span className="toc-page">{9 + i * 2}</span>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div style={{ flex: 1 }}>
          {col2.map((city, i) => (
            <div className="toc-entry" key={city.slug}>
              <span>
                {city.emoji} {city.name}
              </span>
              <span className="toc-dots" />
              <span className="toc-page">{9 + (mid + i) * 2}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <hr className="section-rule" style={{ marginTop: 'auto', marginBottom: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            color: '#71717A',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          2
        </span>
      </div>
    </div>
  );
}
