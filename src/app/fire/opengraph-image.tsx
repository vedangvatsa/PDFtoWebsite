import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FIRE Calculator | Savings Runway by City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const cities = [
    { name: "Bangkok", months: 48 },
    { name: "Lisbon", months: 24 },
    { name: "Bali", months: 45 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafafa",
          padding: "48px 64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: "flex",
            fontSize: 14,
            fontWeight: 600,
            color: "#a1a1aa",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
          }}
        >
          CVin.Bio
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            color: "#09090b",
            marginTop: 24,
            lineHeight: 1.1,
          }}
        >
          FIRE Calculator
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#71717a",
            marginTop: 12,
          }}
        >
          How long will your savings last in each city?
        </div>

        {/* City cards */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
          }}
        >
          {cities.map((city) => (
            <div
              key={city.name}
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 16,
                padding: "28px 36px",
                minWidth: 200,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#71717a",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                {city.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  marginTop: 8,
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "#09090b",
                  }}
                >
                  {city.months}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    color: "#a1a1aa",
                    fontWeight: 500,
                  }}
                >
                  mo
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "#09090b",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
