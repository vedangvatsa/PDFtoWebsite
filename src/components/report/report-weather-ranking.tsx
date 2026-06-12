import type { RankedCity } from '@/app/report/page';

export function ReportWeatherRanking({ cities }: { cities: RankedCity[] }) {
  return (
    <div className="report-page" style={{ padding: 32, position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#71717A' }}>
          Weather Comfort Ranking
        </span>
        <span style={{ fontSize: 8, color: '#71717A' }}>OPTIMAL = 24°C, LOW HUMIDITY, LOW RAIN</span>
      </div>
      <hr className="section-rule" />

      {/* Table */}
      <table className="report-table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th style={{ width: 24, textAlign: 'center' }}>#</th>
            <th style={{ width: '22%' }}>CITY</th>
            <th style={{ width: '24%' }}>COMFORT SCORE</th>
            <th style={{ width: '12%' }}>AVG TEMP</th>
            <th style={{ width: '12%' }}>HUMIDITY</th>
            <th style={{ width: '14%' }}>ANNUAL RAIN</th>
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
                  <span style={{ fontWeight: 800, fontSize: 10, fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>
                    {city.weatherScore}
                  </span>
                  <div className="bar-track" style={{ flex: 1 }}>
                    <div
                      className="bar-fill"
                      style={{
                        width: `${city.weatherScore}%`,
                        background: '#09090B',
                      }}
                    />
                  </div>
                </div>
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>
                {city.weather.avg_temp.toFixed(1)}°C
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>
                {city.weather.avg_humidity}%
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>
                {city.weather.annual_rain.toLocaleString()} mm
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
          <span style={{ fontSize: 8, fontWeight: 600, color: '#71717A' }}>8</span>
        </div>
      </div>
    </div>
  );
}
