#!/usr/bin/env node

/**
 * Fetch coworking spaces from OpenStreetMap Overpass API for 95 cities.
 * - Queries amenity=coworking_space (nodes and ways) within ~15km of each city center
 * - Batches 10 cities per query with 2s delay between batches
 * - Deduplicates by name+city
 * - Outputs JSON to public/coworking-osm-raw.json
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_KM = 15;
const BATCH_SIZE = 10;
const DELAY_MS = 2000;
const OUTPUT_PATH = "/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/public/coworking-osm-raw.json";

const CITIES = [
  { city: "Johor", country: "Malaysia", lat: 1.338, lon: 103.5868 },
  { city: "Bangalore", country: "India", lat: 12.9716, lon: 77.5946 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { city: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { city: "Chiang Mai", country: "Thailand", lat: 18.7883, lon: 98.9853 },
  { city: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { city: "Kaş", country: "Turkey", lat: 36.2, lon: 29.64 },
  { city: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
  { city: "Kilifi", country: "Kenya", lat: -3.6305, lon: 39.8499 },
  { city: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { city: "Roatán", country: "Honduras", lat: 16.3167, lon: -86.5333 },
  { city: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 },
  { city: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
  { city: "Florianópolis", country: "Brazil", lat: -27.5954, lon: -48.548 },
  { city: "Komoro", country: "Japan", lat: 36.3219, lon: 138.9267 },
  { city: "Zanzibar", country: "Tanzania", lat: -6.1659, lon: 39.1989 },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { city: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275 },
  { city: "Bali (Canggu/Ubud)", country: "Indonesia", lat: -8.5069, lon: 115.2625 },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734 },
  { city: "Bogota", country: "Colombia", lat: 4.711, lon: -74.0721 },
  { city: "Hanoi", country: "Vietnam", lat: 21.0278, lon: 105.8342 },
  { city: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297 },
  { city: "Krakow", country: "Poland", lat: 50.0647, lon: 19.945 },
  { city: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lon: 101.6869 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393 },
  { city: "Madeira (Funchal)", country: "Portugal", lat: 32.6669, lon: -16.9241 },
  { city: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842 },
  { city: "Marrakech", country: "Morocco", lat: 31.6295, lon: -7.9811 },
  { city: "Medellin", country: "Colombia", lat: 6.2476, lon: -75.5658 },
  { city: "Phuket", country: "Thailand", lat: 7.8804, lon: 98.3923 },
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378 },
  { city: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
  { city: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { city: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763 },
  { city: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
  { city: "Accra", country: "Ghana", lat: 5.6037, lon: -0.187 },
  { city: "Belgrade", country: "Serbia", lat: 44.7866, lon: 20.4489 },
  { city: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025 },
  { city: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402 },
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { city: "Cartagena", country: "Colombia", lat: 10.391, lon: -75.5144 },
  { city: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612 },
  { city: "Da Nang", country: "Vietnam", lat: 16.0544, lon: 108.2022 },
  { city: "Delhi", country: "India", lat: 28.7041, lon: 77.1025 },
  { city: "Guadalajara", country: "Mexico", lat: 20.6597, lon: -103.3496 },
  { city: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.324 },
  { city: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428 },
  { city: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { city: "Oaxaca", country: "Mexico", lat: 17.0732, lon: -96.7266 },
  { city: "Penang", country: "Malaysia", lat: 5.4164, lon: 100.3327 },
  { city: "Phnom Penh", country: "Cambodia", lat: 11.5564, lon: 104.9282 },
  { city: "Sao Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { city: "Siem Reap", country: "Cambodia", lat: 13.3633, lon: 103.8564 },
  { city: "Split", country: "Croatia", lat: 43.5081, lon: 16.4402 },
  { city: "Taipei", country: "Taiwan", lat: 25.033, lon: 121.5654 },
  { city: "Vilnius", country: "Lithuania", lat: 54.6872, lon: 25.2797 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { city: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { city: "Gran Canaria (Las Palmas)", country: "Spain", lat: 28.1235, lon: -15.4363 },
  { city: "Malaga", country: "Spain", lat: 36.7213, lon: -4.4214 },
  { city: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291 },
  { city: "Tallinn", country: "Estonia", lat: 59.437, lon: 24.7536 },
  { city: "Tbilisi", country: "Georgia", lat: 41.7151, lon: 44.8271 },
  { city: "Tenerife", country: "Spain", lat: 28.2916, lon: -16.6291 },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { city: "Antalya", country: "Turkey", lat: 36.8969, lon: 30.7133 },
  { city: "Cebu", country: "Philippines", lat: 10.3157, lon: 123.8854 },
  { city: "Goa", country: "India", lat: 15.2993, lon: 74.124 },
  { city: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { city: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645 },
  { city: "Playa del Carmen", country: "Mexico", lat: 20.6296, lon: -87.0739 },
  { city: "Sofia", country: "Bulgaria", lat: 42.6977, lon: 23.3219 },
  { city: "Tulum", country: "Mexico", lat: 20.2116, lon: -87.4653 },
  { city: "Bali", country: "Indonesia", lat: -8.3405, lon: 115.092 },
  { city: "Bansko", country: "Bulgaria", lat: 41.8384, lon: 23.4886 },
  { city: "Ericeira", country: "Portugal", lat: 38.9631, lon: -9.4175 },
  { city: "Koh Phangan", country: "Thailand", lat: 9.7319, lon: 100.0136 },
  { city: "Las Palmas", country: "Spain", lat: 28.1235, lon: -15.4363 },
  { city: "Canggu", country: "Indonesia", lat: -8.6478, lon: 115.1385 },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { city: "Riga", country: "Latvia", lat: 56.9496, lon: 24.1052 },
  { city: "Dahab", country: "Egypt", lat: 28.5007, lon: 34.5146 },
  { city: "Cusco", country: "Peru", lat: -13.532, lon: -71.9675 },
  { city: "Hoi An", country: "Vietnam", lat: 15.8801, lon: 108.338 },
  { city: "Siargao", country: "Philippines", lat: 9.8482, lon: 126.0458 },
  { city: "Santa Marta", country: "Colombia", lat: 11.2404, lon: -74.199 },
  { city: "Antigua", country: "Guatemala", lat: 14.5586, lon: -90.7295 },
  { city: "Palermo", country: "Italy", lat: 38.1157, lon: 13.3615 },
  { city: "Dubrovnik", country: "Croatia", lat: 42.6507, lon: 18.0944 },
  { city: "Thessaloniki", country: "Greece", lat: 40.6401, lon: 22.9444 },
  { city: "Valparaiso", country: "Chile", lat: -33.0472, lon: -71.6127 },
];

// ~15km in degrees (rough): lat ≈ 0.135, lon varies by latitude
function bbox(lat, lon) {
  const dLat = RADIUS_KM / 111.0;
  const dLon = RADIUS_KM / (111.0 * Math.cos((lat * Math.PI) / 180));
  return {
    south: lat - dLat,
    north: lat + dLat,
    west: lon - dLon,
    east: lon + dLon,
  };
}

function buildQuery(cityBatch) {
  let unions = "";
  for (const c of cityBatch) {
    const b = bbox(c.lat, c.lon);
    const bboxStr = `${b.south},${b.west},${b.north},${b.east}`;
    unions += `  node["amenity"="coworking_space"](${bboxStr});\n`;
    unions += `  way["amenity"="coworking_space"](${bboxStr});\n`;
  }
  return `[out:json][timeout:60];\n(\n${unions});\nout center;`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function assignCity(lat, lon, cityBatch) {
  let best = null;
  let bestDist = Infinity;
  for (const c of cityBatch) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

async function queryOverpass(query, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "*/*",
          "User-Agent": "coworking-osm-fetcher/1.0",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (res.status === 429 || res.status === 504) {
        const wait = attempt * 5000;
        console.log(`  ⏳ Rate limited (${res.status}), waiting ${wait / 1000}s before retry ${attempt}/${retries}...`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt < retries) {
        const wait = attempt * 5000;
        console.log(`  ⚠️ Error: ${err.message}. Retrying in ${wait / 1000}s (${attempt}/${retries})...`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log(`🏢 Fetching coworking spaces from OSM for ${CITIES.length} cities...\n`);

  const allResults = [];
  const batches = [];

  for (let i = 0; i < CITIES.length; i += BATCH_SIZE) {
    batches.push(CITIES.slice(i, i + BATCH_SIZE));
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const cityNames = batch.map((c) => c.city).join(", ");
    console.log(`📦 Batch ${b + 1}/${batches.length}: ${cityNames}`);

    const query = buildQuery(batch);

    try {
      const data = await queryOverpass(query);
      const elements = data.elements || [];

      let count = 0;
      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags["name:en"] || "";
        if (!name) continue;

        // Get coordinates (for ways, use center)
        let lat, lon;
        if (el.type === "node") {
          lat = el.lat;
          lon = el.lon;
        } else if (el.center) {
          lat = el.center.lat;
          lon = el.center.lon;
        } else {
          continue;
        }

        const closest = assignCity(lat, lon, batch);

        allResults.push({
          name: name.trim(),
          lat,
          lon,
          city: closest.city,
          country: closest.country,
          website: (tags.website || tags["contact:website"] || "").trim(),
        });
        count++;
      }

      console.log(`   ✅ Found ${count} named coworking spaces (${elements.length} total elements)`);
    } catch (err) {
      console.error(`   ❌ Failed for batch: ${err.message}`);
    }

    if (b < batches.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Deduplicate by name+city (case-insensitive)
  const seen = new Set();
  const deduped = [];
  for (const r of allResults) {
    const key = `${r.name.toLowerCase()}|||${r.city.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
  }

  console.log(`\n🔄 Deduplicated: ${allResults.length} → ${deduped.length} entries`);

  // Sort by city, then name
  deduped.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));

  // Write output
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(deduped, null, 2));
  console.log(`💾 Saved to ${OUTPUT_PATH}`);
  console.log(`\n📊 Total coworking spaces: ${deduped.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
