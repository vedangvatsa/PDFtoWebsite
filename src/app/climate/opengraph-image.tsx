import { ImageResponse } from "next/og";

export const alt =
  "Climate Finder | Best Weather for Nomads by Month";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cities = [
  { name: "Lisbon", flag: "🇵🇹", temp: "22°C", condition: "Sunny" },
  { name: "Chiang Mai", flag: "🇹🇭", temp: "28°C", condition: "Dry" },
  { name: "Medellín", flag: "🇨🇴", temp: "24°C", condition: "Spring" },
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
        {/* CVin.Bio label */}
        <span
          style={{ display: 'flex', fontSize: 14,
            fontWeight: 600,
            color: "#a1a1aa",
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const, }}
        >
          CVin.Bio
        </span>

        {/* Title */}
        <span
          style={{ display: 'flex', fontSize: 56,
            fontWeight: 700,
            color: "#09090b",
            marginTop: 16,
            lineHeight: 1.1, }}
        >
          Climate Finder
        </span>

        {/* Subtitle */}
        <span
          style={{ display: 'flex', fontSize: 22,
            color: "#71717a",
            marginTop: 12, }}
        >
          Temperature · Humidity · Rainfall · By month
        </span>

        {/* City weather cards */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          {cities.map((city) => (
            <div
              key={city.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 16,
                padding: "32px 40px",
                width: 320,
              }}
            >
              {/* Flag */}
              <span style={{ display: 'flex', fontSize: 48 }}>{city.flag}</span>

              {/* City name */}
              <span
                style={{ display: 'flex', fontSize: 22,
                  fontWeight: 700,
                  color: "#09090b",
                  marginTop: 12, }}
              >
                {city.name}
              </span>

              {/* Temperature */}
              <span
                style={{ display: 'flex', fontSize: 36,
                  fontWeight: 700,
                  color: "#09090b",
                  marginTop: 8, }}
              >
                {city.temp}
              </span>

              {/* Condition */}
              <span
                style={{ display: 'flex', fontSize: 16,
                  color: "#71717a",
                  marginTop: 4, }}
              >
                {city.condition}
              </span>
            </div>
          ))}
        </div>

        {/* Dark bottom accent bar */}
        <div
          style={{ display: 'flex', position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "#09090b", }}
        />
      </div>
    ),
    { ...size }
  );
}
