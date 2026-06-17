export function ReportSources({ date }: { date: string }) {
  const sources = [
    {
      category: 'Internet Speed',
      source: 'Speedtest by Ookla (speedtest.net)',
      period: 'Q1 2026',
    },
    {
      category: 'Cost of Living',
      source: 'Numbeo, community surveys, local reports',
      period: 'Rolling 12-month averages',
    },
    {
      category: 'Weather',
      source: 'Historical averages from national meteorological services',
      period: '30-year normals',
    },
    {
      category: 'Workspaces',
      source: 'Aggregated from Coworker.com, NomadList, Google Maps',
      period: 'As of Q1 2026',
    },
    {
      category: 'Scoring',
      source: 'Proprietary composite methodology',
      period: 'Weighted multi-factor model',
    },
  ];

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
        Sources &amp; Methodology
      </h2>
      <hr className="section-rule" style={{ marginTop: 12, marginBottom: 28 }} />

      {/* Sources List */}
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#71717A',
            margin: '0 0 16px 0',
          }}
        >
          Data Sources
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sources.map((s, i) => (
            <div
              key={s.category}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                padding: '10px 0',
                borderBottom: i < sources.length - 1 ? '0.5px solid #e4e4e7' : '1.5px solid #09090B',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  width: 120,
                  flexShrink: 0,
                  color: '#09090B',
                }}
              >
                {s.category}
              </span>
              <span style={{ fontSize: 10, color: '#09090B', flex: 1, lineHeight: 1.5 }}>
                {s.source}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: '#71717A',
                  flexShrink: 0,
                  textAlign: 'right',
                  width: 140,
                }}
              >
                {s.period}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#71717A',
            margin: '0 0 12px 0',
          }}
        >
          About CVin.Bio
        </p>
        <p style={{ fontSize: 10, lineHeight: 1.7, color: '#09090B', margin: 0, maxWidth: '85%' }}>
          CVin.Bio converts PDF resumes into portfolio websites. This report is generated from live data
          collected across 100 cities worldwide and ranked using a weighted composite score covering internet
          speed, cost of living, weather, and workspace availability.
        </p>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: '#f4f4f5',
          padding: '14px 16px',
          borderRadius: 4,
          marginBottom: 32,
        }}
      >
        <p
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#71717A',
            margin: '0 0 6px 0',
          }}
        >
          Disclaimer
        </p>
        <p style={{ fontSize: 9, lineHeight: 1.6, color: '#71717A', margin: 0 }}>
          Costs and conditions change frequently. Verify current pricing before travel. Data reflects
          available measurements at time of publication and may not capture short-term fluctuations. Rankings
          are intended as a starting point for research, not as financial or travel advice.
        </p>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom */}
      <div style={{ textAlign: 'center', paddingBottom: 4 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#09090B',
            margin: '0 0 4px 0',
          }}
        >
          cvin.bio/report
        </p>
        <p style={{ fontSize: 9, color: '#71717A', margin: '0 0 16px 0' }}>{date}</p>
      </div>

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
            fontWeight: 600,
          }}
        >
          Sources &amp; Methodology
        </span>
      </div>
    </div>
  );
}
