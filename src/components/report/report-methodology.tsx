const TEAL = '#0d9488';
const SLATE = '#64748b';
const CORAL = '#f43f5e';
const AMBER = '#f59e0b';
const INDIGO = '#6366f1';

export function ReportMethodology({ quarter }: { quarter: string }) {
  const weights = [
    { label: 'Cost of Living', weight: 25, desc: 'Rent, food, transport, coworking, miscellaneous', color: TEAL },
    { label: 'Internet Quality', weight: 25, desc: 'Download, upload, latency from Speedtest', color: CORAL },
    { label: 'Weather Comfort', weight: 20, desc: 'Temperature, humidity, rainfall composite', color: INDIGO },
    { label: 'Spaces & Infrastructure', weight: 15, desc: 'Coworking, coliving, hostels, apartments', color: AMBER },
    { label: 'Safety & Community', weight: 15, desc: 'Safety index, nomad community size', color: '#8b5cf6' },
  ];

  return (
    <div className="report-page" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' as const }}>Chapter One</span>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: '4px 0 0 0', lineHeight: 1.1 }}>Methodology</h2>
      <div style={{ height: 2, background: TEAL, marginTop: 8, marginBottom: 14 }} />

      <p style={{ fontSize: 11, lineHeight: 1.8, color: '#3f3f46', margin: '0 0 16px 0' }}>
        This report ranks 50 cities across six continents using a composite scoring model built from publicly available data sources. Each city receives a Nomad Score from 0 to 100, calculated as a weighted average of five category scores. The methodology prioritizes measurable, reproducible metrics over subjective ratings. All cost figures are denominated in US dollars and reflect mid-range lifestyle estimates as of {quarter}.
      </p>

      {/* Score composition — visual donut representation */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 8, textTransform: 'uppercase' as const }}>
          Score Composition
        </div>

        {/* Horizontal stacked bar showing weights */}
        <div style={{ display: 'flex', width: '100%', height: 22, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
          {weights.map(w => (
            <div key={w.label} style={{
              width: `${w.weight}%`, background: w.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700, color: '#fff',
            }}>
              {w.weight}%
            </div>
          ))}
        </div>

        {/* Weight details */}
        {weights.map(w => (
          <div key={w.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '0.5px solid #f1f5f9' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: w.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700 }}>{w.label}</span>
              <span style={{ fontSize: 8, color: SLATE, marginLeft: 6 }}>{w.desc}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: w.color }}>{w.weight}%</span>
          </div>
        ))}
      </div>

      {/* Two columns: Weather + Cost */}
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
            Weather Score Formula
          </div>
          <p style={{ fontSize: 9, lineHeight: 1.7, color: '#3f3f46', margin: '0 0 8px 0' }}>
            Measures deviation from 24°C optimal, humidity penalty above 60%, and rainfall impact. Higher is better.
          </p>
          <div style={{ background: '#0f172a', borderRadius: 6, padding: '12px 14px', marginBottom: 10 }}>
            <code style={{ fontSize: 8.5, color: TEAL, lineHeight: 1.9, fontFamily: 'ui-monospace, monospace', display: 'block' }}>
              score = 100{'\n'}
              {'  '}- |avg_temp - 24| × 3{'\n'}
              {'  '}- max(0, humidity - 60) × 0.5{'\n'}
              {'  '}- annual_rain / 100{'\n'}
              {'  '}= clamp(0, 100)
            </code>
          </div>

          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
            Data Sources
          </div>
          <p style={{ fontSize: 9, lineHeight: 1.7, color: '#3f3f46', margin: 0 }}>
            Internet: Speedtest by Ookla ({quarter}). Costs: Numbeo + local surveys. Weather: 30-year normals from national meteorological services. Workspaces: Coworker.com, Google Maps, manual verification.
          </p>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
            Cost Assumptions
          </div>
          {[
            { cat: 'Rent', desc: 'Private studio/1BR in a nomad-friendly neighborhood', icon: '🏠' },
            { cat: 'Food', desc: 'Mix of cooking (40%), local restaurants (40%), cafes (20%)', icon: '🍜' },
            { cat: 'Transport', desc: 'Local transit, ride-hailing, or scooter rental', icon: '🛵' },
            { cat: 'Coworking', desc: 'Hot desk at a coworking space, 20 days/month', icon: '💻' },
            { cat: 'Other', desc: 'SIM card, laundry, entertainment, gym, personal items', icon: '🎒' },
          ].map(c => (
            <div key={c.cat} style={{ display: 'flex', gap: 6, padding: '5px 0', borderBottom: '0.5px solid #f1f5f9', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700 }}>{c.cat}</div>
                <div style={{ fontSize: 8, color: SLATE, lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: SLATE, marginBottom: 6, textTransform: 'uppercase' as const }}>
              City Selection
            </div>
            <p style={{ fontSize: 9, lineHeight: 1.7, color: '#3f3f46', margin: 0 }}>
              Initial pool: 100 cities. Screened for minimum 10 Mbps download, coworking availability, sufficient cost data. Top 50 by composite score are profiled.
            </p>
          </div>

          <div style={{ marginTop: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 10px', fontSize: 8, lineHeight: 1.6, color: '#92400e' }}>
            <strong>Note:</strong> Costs and speeds change frequently. Figures are point-in-time snapshots. Cross-reference with local sources before relocating.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '0.5px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#a1a1aa' }}>
        <span>cvin.bio/report</span><span>3</span>
      </div>
    </div>
  );
}
