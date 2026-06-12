import type { RankedCity } from '@/app/report/page';

export function ReportInternetRanking({ cities }: { cities: RankedCity[] }) {
  const maxDownload = Math.max(...cities.map(c => c.internet.download_mbps));

  return (
    <div className="report-page" style={{ padding: 32, position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#71717A' }}>
          Internet Speed Ranking
        </span>
        <span style={{ fontSize: 8, color: '#71717A' }}>SPEEDTEST BY OOKLA, Q1 2026</span>
      </div>
      <hr className="section-rule" />

      {/* Table */}
      <table className="report-table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th style={{ width: 24, textAlign: 'center' }}>#</th>
            <th style={{ width: '22%' }}>CITY</th>
            <th style={{ width: '28%' }}>DOWNLOAD</th>
            <th style={{ width: '12%' }}>UPLOAD</th>
            <th style={{ width: '10%' }}>LATENCY</th>
            <th style={{ width: '10%' }}>TESTS</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city, i) => (
            <tr key={city.slug} style={{ background: i % 2 === 1 ? '#fafafa' : 'transparent' }}>
              <td className="rank-cell" style={{ fontSize: 9 }}>{i + 1}</td>
              <td>
                <span style={{ fontWeight: 600, fontSize: 8.5 }}>{city.emoji} {city.name}</span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 10, fontVariantNumeric: 'tabular-nums', minWidth: 42 }}>
                    {city.internet.download_mbps.toFixed(0)}
                  </span>
                  <div className="bar-track" style={{ flex: 1 }}>
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(city.internet.download_mbps / maxDownload) * 100}%`,
                        background: '#09090B',
                      }}
                    />
                  </div>
                </div>
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>
                {city.internet.upload_mbps.toFixed(0)} Mbps
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>
                {city.internet.latency_ms} ms
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5, color: '#71717A' }}>
                {city.internet.test_count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 24, left: 32, right: 32 }}>
        <hr className="section-rule" />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
          <span style={{ fontSize: 7, color: '#a1a1aa' }}>cvin.bio/report</span>
          <span style={{ fontSize: 8, fontWeight: 600, color: '#71717A' }}>6</span>
        </div>
      </div>
    </div>
  );
}
