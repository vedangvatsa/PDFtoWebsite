import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nomad Visas | 50+ Visas and Visa Checker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const visaCards = [
  { flag: "🇵🇹", name: "Portugal D7 Visa" },
  { flag: "🇪🇸", name: "Spain Digital Nomad" },
  { flag: "🇭🇷", name: "Croatia DN Visa" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafafa",
          padding: "48px 56px",
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
            fontSize: 64,
            fontWeight: 700,
            color: "#09090b",
            marginTop: 24,
            lineHeight: 1.1,
          }}
        >
          Nomad Visas
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
          50+ digital nomad visas · Visa checker by passport
        </div>

        {/* Visa cards */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          {visaCards.map((visa) => (
            <div
              key={visa.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 16,
                padding: "32px 36px",
                gap: 12,
                flex: 1,
              }}
            >
              <div style={{ display: "flex", fontSize: 48 }}>{visa.flag}</div>
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#09090b",
                  textAlign: "center" as const,
                }}
              >
                {visa.name}
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
