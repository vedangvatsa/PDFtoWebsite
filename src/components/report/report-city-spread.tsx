import type { RankedCity } from '@/app/report/page';

/* ── Helpers ── */

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function pct(value: number, total: number): string {
  if (total === 0) return '0';
  return ((value / total) * 100).toFixed(1);
}

function formatDollars(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

/* ── Component ── */

export function ReportCitySpread({
  city,
  allCities,
}: {
  city: RankedCity;
  allCities: RankedCity[];
}) {
  const { cost, internet, weather, spaces, nearby } = city;
  const total = cost.monthly_total;

  // Page number: cover(1) + TOC(1) + methodology(1) + overall(2) + internet(1) + cost(1) + weather(1) = 8 pages before cities
  const pageBase = 9 + (city.rank - 1) * 2;

  // Nearby city display names
  const nearbyCities = nearby
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter(Boolean) as RankedCity[];

  // Weather chart scaling
  const maxTemp = Math.max(...weather.monthly.map((m) => m.temp), 1);
  const maxRain = Math.max(...weather.monthly.map((m) => m.rain), 1);
  const tempBarMax = 56; // px height for max temp
  const rainBarMax = 28; // px height for max rain

  // Cost segments for stacked bar
  const costSegments = [
    { label: 'Rent', value: cost.rent, color: '#09090B' },
    { label: 'Food', value: cost.food, color: '#52525b' },
    { label: 'Transport', value: cost.transport, color: '#a1a1aa' },
    { label: 'Coworking', value: cost.coworking, color: '#d4d4d8' },
    { label: 'Other', value: cost.other, color: '#e4e4e7' },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          PAGE 1 — City Overview
          ════════════════════════════════════════════════════════════ */}
      <div className="report-page" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* ── Hero Photo ── */}
        <div className="city-photo-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={city.imageUrl} alt={city.name} />

          {/* Score badge — top-right */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
            }}
          >
            <div className="score-badge">
              {city.nomad_score}
            </div>
          </div>

          {/* City name overlay — bottom */}
          <div className="city-photo-overlay">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 32 }}>{city.emoji}</span>
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    color: '#fff',
                  }}
                >
                  {city.name}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.8)',
                    marginTop: 2,
                  }}
                >
                  {city.country}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Stats Bar ── */}
        <div
          style={{
            background: '#09090B',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            height: '18mm',
            padding: '0 32px',
          }}
        >
          {[
            { value: `$${total.toLocaleString('en-US')}/mo`, label: 'MONTHLY COST' },
            { value: `${internet.download_mbps.toFixed(0)} Mbps`, label: 'DOWNLOAD' },
            { value: `${weather.avg_temp.toFixed(1)}°C`, label: 'AVG TEMPERATURE' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 7,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Cost Cards ── */}
        <div style={{ padding: '24px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { title: 'Rent', value: cost.rent },
              { title: 'Food', value: cost.food },
              { title: 'Coworking', value: cost.coworking },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  flex: 1,
                  border: '1px solid #e4e4e7',
                  padding: 16,
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    color: '#71717A',
                    marginBottom: 6,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {formatDollars(card.value)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: '#a1a1aa',
                    marginTop: 4,
                  }}
                >
                  per month
                </div>
              </div>
            ))}
          </div>

          {/* ── Rank Indicator ── */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#71717A',
                marginBottom: 6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Ranked #{city.rank} of 50
            </div>
            <div className="bar-track" style={{ height: 4 }}>
              <div
                className="bar-fill"
                style={{
                  width: `${(city.rank / 50) * 100}%`,
                  background: '#09090B',
                  height: '100%',
                }}
              />
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* ── Footer ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '0.5px solid #e4e4e7',
              paddingTop: 10,
            }}
          >
            <span style={{ fontSize: 7, color: '#a1a1aa' }}>
              cvin.bio/{city.slug}
            </span>
            <span
              style={{
                fontSize: 7,
                color: '#a1a1aa',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {pageBase}
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          PAGE 2 — Data Profile
          ════════════════════════════════════════════════════════════ */}
      <div className="report-page" style={{ display: 'flex', flexDirection: 'column', padding: 32 }}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: '#71717A',
              marginBottom: 4,
            }}
          >
            Data Profile
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            {city.name}
          </div>
          <hr className="section-rule" style={{ marginTop: 10 }} />
        </div>

        {/* ── Two-Column: Cost + Internet ── */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
          {/* Cost Breakdown */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 7,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#71717A',
                marginBottom: 8,
              }}
            >
              Cost Breakdown
            </div>

            {/* Stacked horizontal bar */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              {costSegments.map((seg) => (
                <div
                  key={seg.label}
                  className="cost-segment"
                  style={{
                    width: `${(seg.value / total) * 100}%`,
                    backgroundColor: seg.color,
                  }}
                />
              ))}
            </div>

            {/* Breakdown rows */}
            {costSegments.map((seg) => (
              <div
                key={seg.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  borderBottom: '0.5px solid #f4f4f5',
                  fontSize: 9,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: seg.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: '#3f3f46' }}>{seg.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDollars(seg.value)}
                  </span>
                  <span
                    style={{
                      fontSize: 7,
                      color: '#a1a1aa',
                      width: 30,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {pct(seg.value, total)}%
                  </span>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 6,
                fontSize: 10,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span>Total</span>
              <span>{formatDollars(total)}</span>
            </div>
          </div>

          {/* Internet Stats */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 7,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#71717A',
                marginBottom: 8,
              }}
            >
              Internet
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'DOWNLOAD', value: internet.download_mbps.toFixed(0), unit: 'Mbps' },
                { label: 'UPLOAD', value: internet.upload_mbps.toFixed(0), unit: 'Mbps' },
                { label: 'LATENCY', value: internet.latency_ms.toFixed(0), unit: 'ms' },
                { label: 'TESTS RUN', value: internet.test_count.toLocaleString('en-US'), unit: '' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    border: '1px solid #e4e4e7',
                    borderRadius: 4,
                    padding: '10px 12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 7,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      color: '#71717A',
                      marginBottom: 4,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 500 }}>
                        {stat.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quarter label */}
            <div
              style={{
                fontSize: 7,
                color: '#a1a1aa',
                marginTop: 8,
                textAlign: 'right',
              }}
            >
              Data from {internet.quarter}
            </div>
          </div>
        </div>

        {/* ── Monthly Weather ── */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#71717A',
              marginBottom: 10,
            }}
          >
            Monthly Weather
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0,
              width: '100%',
            }}
          >
            {weather.monthly.map((m, i) => {
              const tempH = Math.max(4, (m.temp / maxTemp) * tempBarMax);
              const rainH = Math.max(2, (m.rain / maxRain) * rainBarMax);
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0,
                  }}
                >
                  {/* Temp value */}
                  <div
                    style={{
                      fontSize: 7,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: '#09090B',
                      marginBottom: 3,
                    }}
                  >
                    {m.temp.toFixed(0)}°
                  </div>

                  {/* Temperature bar */}
                  <div
                    className="weather-bar"
                    style={{ height: tempH }}
                  />

                  {/* Rain bar */}
                  <div
                    className="weather-bar rain-bar"
                    style={{
                      height: rainH,
                      borderRadius: '0 0 2px 2px',
                      marginTop: 1,
                    }}
                  />

                  {/* Rain value */}
                  <div
                    style={{
                      fontSize: 6,
                      color: '#3b82f6',
                      fontVariantNumeric: 'tabular-nums',
                      marginTop: 2,
                    }}
                  >
                    {m.rain.toFixed(0)}
                  </div>

                  {/* Month label */}
                  <div
                    style={{
                      fontSize: 7,
                      color: '#71717A',
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {MONTH_LABELS[i]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 8,
              fontSize: 7,
              color: '#a1a1aa',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#09090B', borderRadius: 2 }} />
              Temp (°C)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#3b82f6', borderRadius: 2 }} />
              Rain (mm)
            </span>
          </div>
        </div>

        {/* ── Spaces & Infrastructure ── */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#71717A',
              marginBottom: 8,
            }}
          >
            Spaces
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Coworking', count: spaces.coworking },
              { label: 'Coliving', count: spaces.coliving },
              { label: 'Hostels', count: spaces.hostel },
              { label: 'Apartments', count: spaces.apartment },
              { label: 'Guesthouses', count: spaces.guesthouse },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: '#f4f4f5',
                  borderRadius: 4,
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {s.count}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    color: '#71717A',
                    marginTop: 4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nearby Cities ── */}
        {nearbyCities.length > 0 && (
          <div style={{ marginBottom: 0 }}>
            <div
              style={{
                fontSize: 7,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#71717A',
                marginBottom: 8,
              }}
            >
              Nearby
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {nearbyCities.map((nc) => (
                <div
                  key={nc.slug}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    border: '1px solid #e4e4e7',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontSize: 9,
                    fontWeight: 500,
                    color: '#3f3f46',
                  }}
                >
                  <span style={{ fontSize: 11 }}>{nc.emoji}</span>
                  <span>{nc.name}</span>
                  <span
                    style={{
                      fontSize: 7,
                      color: '#a1a1aa',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    #{nc.rank}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── Footer ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '0.5px solid #e4e4e7',
            paddingTop: 10,
          }}
        >
          <span style={{ fontSize: 7, color: '#a1a1aa' }}>
            cvin.bio/{city.slug}
          </span>
          <span
            style={{
              fontSize: 7,
              color: '#a1a1aa',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {pageBase + 1}
          </span>
        </div>
      </div>
    </>
  );
}
