export function ReportMethodology({ quarter }: { quarter: string }) {
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
        METHODOLOGY
      </span>
      <hr className="section-rule" style={{ marginTop: 8, marginBottom: 24 }} />

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: 28, flex: 1 }}>
        {/* Left column */}
        <div style={{ flex: 1 }}>
          {/* Nomad Score */}
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            Nomad Score
          </h3>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#09090B', margin: '0 0 6px 0' }}>
            Each city receives a composite score from 0 to 100. The score is a weighted average of
            five category scores:
          </p>
          <table
            style={{
              fontSize: 10,
              borderCollapse: 'collapse',
              width: '100%',
              marginBottom: 20,
            }}
          >
            <tbody>
              {[
                ['Cost of Living', '25%'],
                ['Internet Quality', '25%'],
                ['Weather Comfort', '20%'],
                ['Spaces & Infrastructure', '15%'],
                ['Safety & Community', '15%'],
              ].map(([label, weight]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: '4px 0',
                      borderBottom: '0.5px solid #e4e4e7',
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: '4px 0',
                      borderBottom: '0.5px solid #e4e4e7',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {weight}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#09090B', margin: '0 0 20px 0' }}>
            Category scores are normalized to 0–100 based on the distribution across all ranked
            cities. Higher is better for every category.
          </p>

          {/* Data Sources */}
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            Data Sources
          </h3>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#09090B', margin: '0 0 6px 0' }}>
            Data was collected from the following sources during {quarter}:
          </p>
          <ul style={{ fontSize: 10, lineHeight: 1.7, margin: '0 0 0 16px', padding: 0, color: '#09090B' }}>
            <li style={{ marginBottom: 4 }}>
              <strong>Internet speeds</strong> — Speedtest by Ookla. Median download, upload, and
              latency from consumer fixed-broadband tests aggregated per city.
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Weather</strong> — Historical monthly averages (temperature, humidity, rainfall)
              from global meteorological stations, 10-year window.
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Cost of living</strong> — Numbeo city indices cross-referenced with community
              reports from nomad forums. All figures in USD.
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Spaces</strong> — Coworking, coliving, hostel, and apartment counts from
              aggregated listing platforms.
            </li>
          </ul>
        </div>

        {/* Right column */}
        <div style={{ flex: 1 }}>
          {/* Weather Comfort Score */}
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            Weather Comfort Score
          </h3>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#09090B', margin: '0 0 10px 0' }}>
            The weather score is calculated per city from annual averages:
          </p>
          <div
            style={{
              background: '#f4f4f5',
              padding: '12px 14px',
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              lineHeight: 1.7,
              marginBottom: 10,
            }}
          >
            score = 100
            <br />
            &nbsp;&nbsp;− |avg_temp − 24| × 3
            <br />
            &nbsp;&nbsp;− max(0, avg_humidity − 50) × 0.3
            <br />
            &nbsp;&nbsp;− annual_rain × 0.005
            <br />
            <br />
            clamped to [0, 100]
          </div>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#09090B', margin: '0 0 8px 0' }}>
            24°C is treated as the optimal temperature. Each degree of deviation subtracts 3 points.
            Humidity above 50% incurs a linear penalty. Rainfall is penalized at 0.5 points per
            100mm annually.
          </p>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#71717A', margin: '0 0 24px 0' }}>
            The formula intentionally favors warm, dry climates. Cities with mild year-round temps
            and low rainfall score highest.
          </p>

          {/* Cost Methodology */}
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            Cost Methodology
          </h3>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#09090B', margin: '0 0 6px 0' }}>
            Monthly estimates represent a single nomad living a mid-range lifestyle. Costs are broken
            into five categories:
          </p>
          <ul style={{ fontSize: 10, lineHeight: 1.7, margin: '0 0 0 16px', padding: 0, color: '#09090B' }}>
            <li style={{ marginBottom: 4 }}>
              <strong>Rent</strong> — Private studio or 1-bedroom apartment in a central area.
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Food</strong> — Mix of grocery shopping and eating out (1–2 meals/day at
              restaurants).
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Transport</strong> — Local transit, occasional ride-hailing. No car ownership.
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Coworking</strong> — Hot desk membership at a mid-tier coworking space.
            </li>
            <li style={{ marginBottom: 4 }}>
              <strong>Other</strong> — SIM card, laundry, entertainment, personal care.
            </li>
          </ul>
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#71717A', margin: '12px 0 0 0' }}>
            All figures are converted to USD at the exchange rate in effect at the time of data
            collection. Costs do not include flights, insurance, or visa fees.
          </p>
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
          3
        </span>
      </div>
    </div>
  );
}
