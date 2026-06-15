export function ReportCover({ date, cityCount }: { date: string; cityCount: number }) {
  const TEAL = '#0d9488';

  return (
    <div className="report-page" style={{
      background: '#0f172a',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 300, height: 300, borderRadius: '50%',
        border: `1px solid rgba(13,148,136,0.2)`,
      }} />
      <div style={{
        position: 'absolute', bottom: -40, left: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(13,148,136,0.05)',
      }} />

      {/* Top bar */}
      <div style={{ padding: '36px 40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.2em' }}>CVIN.BIO</span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>FIRST EDITION · {date.toUpperCase()}</span>
      </div>

      {/* Center — massive type */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', color: TEAL, marginBottom: 16, textTransform: 'uppercase' as const }}>
          The Definitive Guide
        </div>
        <h1 style={{
          fontSize: 80, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.05em', lineHeight: 0.88, margin: '0 0 20px 0',
        }}>
          Digital<br />
          Nomad<br />
          Cities
        </h1>

        <div style={{ width: 60, height: 3, background: TEAL, marginBottom: 20 }} />

        <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 8px 0', maxWidth: 400 }}>
          {cityCount} cities across six continents, ranked by cost of living, internet speed, weather, and remote work infrastructure.
        </p>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', margin: 0, maxWidth: 360 }}>
          With city profiles, data visualizations, and regional analysis.
        </p>
      </div>

      {/* Bottom stat bar */}
      <div style={{
        padding: '20px 40px',
        background: 'rgba(13,148,136,0.1)',
        borderTop: '1px solid rgba(13,148,136,0.2)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        {[
          { value: '50', label: 'Cities' },
          { value: '6', label: 'Continents' },
          { value: '32', label: 'Countries' },
          { value: '120+', label: 'Pages' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 40px', display: 'flex', justifyContent: 'space-between', fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>
        <span>cvin.bio/report</span>
        <span>Data from Speedtest by Ookla, Numbeo, and WeatherAPI</span>
      </div>
    </div>
  );
}
