export function ReportCover({ date, cityCount }: { date: string; cityCount: number }) {
  return (
    <div
      className="report-page"
      style={{
        background: '#09090B',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}
        >
          CVIN.BIO
        </span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 500,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {date}
        </span>
      </div>

      {/* Center block */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Digital Nomad
          <br />
          Cities
        </h1>
        <p
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: '#fff',
            margin: '8px 0 0 0',
            letterSpacing: '-0.02em',
          }}
        >
          2026 Report
        </p>

        {/* Horizontal rule */}
        <div
          style={{
            width: '60mm',
            height: 1,
            background: '#fff',
            margin: '28px auto',
          }}
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: '#a1a1aa',
            letterSpacing: '0.06em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {cityCount} Cities Ranked by Cost, Internet, Weather, and Livability
        </p>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 500,
            color: '#fff',
            letterSpacing: '0.04em',
          }}
        >
          cvin.bio/report
        </span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 400,
            color: '#71717A',
            letterSpacing: '0.04em',
          }}
        >
          Data from Speedtest, Numbeo, WeatherAPI
        </span>
      </div>
    </div>
  );
}
