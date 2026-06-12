import type { RankedCity } from '@/app/report/page';

export function ReportCostRanking({ cities }: { cities: RankedCity[] }) {
  const maxCost = Math.max(...cities.map(c => c.cost.monthly_total));

  function barColor(cost: number): string {
    const ratio = cost / maxCost;
    if (ratio < 0.35) return '#10B981';
    if (ratio < 0.65) return '#09090B';
    return '#EF4444';
  }

  return (
    <div className="report-page" style={{ padding: 32, position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#71717A' }}>
          Cost of Living Ranking
        </span>
        <span style={{ fontSize: 8, color: '#71717A' }}>MONTHLY USD, MID-RANGE LIFESTYLE</span>
      </div>
      <hr className="section-rule" />

      {/* Table */}
      <table className="report-table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th style={{ width: 24, textAlign: 'center' }}>#</th>
            <th style={{ width: '20%' }}>CITY</th>
            <th style={{ width: '22%' }}>TOTAL/MO</th>
            <th style={{ width: '10%' }}>RENT</th>
            <th style={{ width: '10%' }}>FOOD</th>
            <th style={{ width: '10%' }}>COWORK</th>
            <th style={{ width: '10%' }}>OTHER</th>
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
                  <span style={{ fontWeight: 800, fontSize: 10, fontVariantNumeric: 'tabular-nums', minWidth: 38 }}>
                    ${city.cost.monthly_total.toLocaleString()}
                  </span>
                  <div className="bar-track" style={{ flex: 1 }}>
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(city.cost.monthly_total / maxCost) * 100}%`,
                        background: barColor(city.cost.monthly_total),
                      }}
                    />
                  </div>
                </div>
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>${city.cost.rent}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>${city.cost.food}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5 }}>${city.cost.coworking}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 8.5, color: '#71717A' }}>
                ${city.cost.transport + city.cost.other}
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
          <span style={{ fontSize: 8, fontWeight: 600, color: '#71717A' }}>7</span>
        </div>
      </div>
    </div>
  );
}
