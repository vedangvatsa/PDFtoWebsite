import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "City Rankings | Internet, Safety and Walkability";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const rankings = [
    { rank: 1, city: "Tokyo", speed: "320 Mbps" },
    { rank: 2, city: "Seoul", speed: "290 Mbps" },
    { rank: 3, city: "Taipei", speed: "250 Mbps" },
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
            fontSize: 56,
            fontWeight: 700,
            color: "#09090b",
            marginTop: 24,
            lineHeight: 1.1,
          }}
        >
          City Rankings
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
          Internet · Safety · Walkability
        </div>

        {/* Ranking rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 40,
          }}
        >
          {rankings.map((item) => (
            <div
              key={item.rank}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 12,
                padding: "16px 28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                {/* Rank number */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    backgroundColor: "#09090b",
                    color: "#ffffff",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {item.rank}
                </div>

                {/* City name */}
                <div
                  style={{
                    display: "flex",
                    fontSize: 28,
                    fontWeight: 600,
                    color: "#09090b",
                  }}
                >
                  {item.city}
                </div>
              </div>

              {/* Speed */}
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#71717a",
                }}
              >
                {item.speed}
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
