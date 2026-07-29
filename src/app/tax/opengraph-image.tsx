import { ImageResponse } from "next/og";

export const alt = "Nomad Tax Comparison | Tax Rates by Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const countries = [
    { flag: "🇵🇹", name: "Portugal", rate: "20%" },
    { flag: "🇪🇸", name: "Spain", rate: "24%" },
    { flag: "🇩🇪", name: "Germany", rate: "42%" },
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
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Label */}
        <div
          style={{
            display: "flex",
            fontSize: 14,
            fontWeight: 600,
            color: "#a1a1aa",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          CVin.Bio
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: "#09090b",
            marginTop: 24,
            lineHeight: 1.1,
          }}
        >
          Nomad Tax Comparison
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
          Tax rates by country for remote workers
        </div>

        {/* Country Cards */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          {countries.map((country) => (
            <div
              key={country.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 16,
                padding: "32px 48px",
                minWidth: 200,
              }}
            >
              <div style={{ display: "flex", fontSize: 48 }}>
                {country.flag}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#09090b",
                  marginTop: 12,
                }}
              >
                {country.name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#09090b",
                  marginTop: 8,
                }}
              >
                {country.rate}
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
