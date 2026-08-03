#!/usr/bin/env node
/**
 * build-city-data.mjs
 * 
 * Builds a comprehensive city data JSON for 95 digital nomad cities.
 * 
 * Steps:
 *  1. Extract base city metadata from nomad-data-slim.json
 *  2. Fetch monthly weather averages from Open-Meteo Climate API
 *  3. Count spaces per city per category
 *  4. Compute nomad scores (0-100)
 *  5. Find 5 nearest cities by Haversine distance
 *  6. Add cost-of-living estimates
 * 
 * Output: /public/nomad-cities.json + /src/lib/nomad-cities.json (bundled copy for server-side imports)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');

const INPUT  = join(ROOT, 'public', 'nomad-data-slim.json');
const OUTPUT = join(ROOT, 'public', 'nomad-cities.json');
const OUTPUT_SRC = join(ROOT, 'src', 'lib', 'nomad-cities.json');

// ─── Country Mapping ───────────────────────────────────────────
const COUNTRY_TO_CODE = {
  'Malaysia': 'MY', 'India': 'IN', 'Thailand': 'TH', 'Germany': 'DE',
  'Turkey': 'TR', 'UK': 'GB', 'Kenya': 'KE', 'France': 'FR',
  'Honduras': 'HN', 'United States': 'US', 'China': 'CN', 'Brazil': 'BR',
  'Japan': 'JP', 'Tanzania': 'TZ', 'Netherlands': 'NL', 'Greece': 'GR',
  'Indonesia': 'ID', 'Spain': 'ES', 'Colombia': 'CO', 'Vietnam': 'VN',
  'Poland': 'PL', 'Portugal': 'PT', 'Philippines': 'PH', 'Morocco': 'MA',
  'Czech Republic': 'CZ', 'Chile': 'CL', 'Singapore': 'SG', 'Ghana': 'GH',
  'Serbia': 'RS', 'Romania': 'RO', 'Hungary': 'HU', 'South Africa': 'ZA',
  'Sri Lanka': 'LK', 'Mexico': 'MX', 'Nepal': 'NP', 'Peru': 'PE',
  'Cambodia': 'KH', 'Croatia': 'HR', 'Taiwan': 'TW', 'Lithuania': 'LT',
  'Argentina': 'AR', 'UAE': 'AE', 'Estonia': 'EE', 'Georgia': 'GE',
  'Nigeria': 'NG', 'Uruguay': 'UY', 'Bulgaria': 'BG', 'Latvia': 'LV',
  'Egypt': 'EG', 'South Korea': 'KR', 'Guatemala': 'GT', 'Italy': 'IT',
};

// Regional character offsets for flag emoji
function countryCodeToEmoji(code) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
}

// Continent mapping by country code
const CONTINENT_MAP = {
  MY: 'Asia', IN: 'Asia', TH: 'Asia', DE: 'Europe', TR: 'Europe',
  GB: 'Europe', KE: 'Africa', FR: 'Europe', HN: 'North America',
  US: 'North America', CN: 'Asia', BR: 'South America', JP: 'Asia',
  TZ: 'Africa', NL: 'Europe', GR: 'Europe', ID: 'Asia', ES: 'Europe',
  CO: 'South America', VN: 'Asia', PL: 'Europe', PT: 'Europe',
  PH: 'Asia', MA: 'Africa', CZ: 'Europe', CL: 'South America',
  SG: 'Asia', GH: 'Africa', RS: 'Europe', RO: 'Europe', HU: 'Europe',
  ZA: 'Africa', LK: 'Asia', MX: 'North America', NP: 'Asia',
  PE: 'South America', KH: 'Asia', HR: 'Europe', TW: 'Asia',
  LT: 'Europe', AR: 'South America', AE: 'Asia', EE: 'Europe',
  GE: 'Asia', NG: 'Africa', UY: 'South America', BG: 'Europe',
  LV: 'Europe', EG: 'Africa', KR: 'Asia', GT: 'North America',
  IT: 'Europe',
};

// ─── Slug helper ───────────────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\/]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Cost of Living Data ───────────────────────────────────────
// Per-city cost estimates (monthly USD) based on real-world data
const COST_DATA = {
  // Tier 1 — Very Cheap ($800-1200)
  'bangkok':          { monthly_total: 1100, rent: 450, food: 300, transport: 60, coworking: 150, other: 140 },
  'chiang-mai':       { monthly_total: 900,  rent: 350, food: 250, transport: 40, coworking: 120, other: 140 },
  'phuket':           { monthly_total: 1100, rent: 450, food: 300, transport: 80, coworking: 130, other: 140 },
  'koh-phangan':      { monthly_total: 1000, rent: 400, food: 280, transport: 50, coworking: 130, other: 140 },
  'hanoi':            { monthly_total: 900,  rent: 350, food: 250, transport: 40, coworking: 120, other: 140 },
  'ho-chi-minh-city': { monthly_total: 1000, rent: 400, food: 280, transport: 50, coworking: 130, other: 140 },
  'da-nang':          { monthly_total: 850,  rent: 300, food: 250, transport: 40, coworking: 120, other: 140 },
  'hoi-an':           { monthly_total: 850,  rent: 300, food: 250, transport: 40, coworking: 120, other: 140 },
  'bali-canggu-ubud': { monthly_total: 1100, rent: 450, food: 280, transport: 60, coworking: 150, other: 160 },
  'bali':             { monthly_total: 1100, rent: 450, food: 280, transport: 60, coworking: 150, other: 160 },
  'canggu':           { monthly_total: 1100, rent: 450, food: 280, transport: 60, coworking: 150, other: 160 },
  'phnom-penh':       { monthly_total: 850,  rent: 300, food: 250, transport: 40, coworking: 120, other: 140 },
  'siem-reap':        { monthly_total: 800,  rent: 280, food: 230, transport: 30, coworking: 120, other: 140 },
  'manila':           { monthly_total: 1000, rent: 380, food: 280, transport: 60, coworking: 140, other: 140 },
  'cebu':             { monthly_total: 900,  rent: 350, food: 250, transport: 50, coworking: 120, other: 130 },
  'siargao':          { monthly_total: 900,  rent: 350, food: 250, transport: 50, coworking: 110, other: 140 },
  'bangalore':        { monthly_total: 900,  rent: 350, food: 220, transport: 40, coworking: 150, other: 140 },
  'delhi':            { monthly_total: 800,  rent: 300, food: 200, transport: 30, coworking: 130, other: 140 },
  'goa':              { monthly_total: 850,  rent: 320, food: 220, transport: 40, coworking: 130, other: 140 },
  'colombo':          { monthly_total: 900,  rent: 350, food: 230, transport: 40, coworking: 140, other: 140 },
  'kathmandu':        { monthly_total: 750,  rent: 280, food: 200, transport: 30, coworking: 100, other: 140 },
  'kuala-lumpur':     { monthly_total: 1000, rent: 400, food: 260, transport: 50, coworking: 150, other: 140 },
  'penang':           { monthly_total: 900,  rent: 350, food: 250, transport: 40, coworking: 120, other: 140 },
  'johor':            { monthly_total: 900,  rent: 350, food: 250, transport: 40, coworking: 120, other: 140 },
  'kilifi':           { monthly_total: 850,  rent: 300, food: 220, transport: 50, coworking: 130, other: 150 },
  'nairobi':          { monthly_total: 1000, rent: 400, food: 250, transport: 60, coworking: 150, other: 140 },
  'accra':            { monthly_total: 1000, rent: 400, food: 250, transport: 60, coworking: 150, other: 140 },
  'zanzibar':         { monthly_total: 900,  rent: 350, food: 230, transport: 50, coworking: 130, other: 140 },
  'lagos':            { monthly_total: 1100, rent: 450, food: 280, transport: 60, coworking: 160, other: 150 },
  'antigua':          { monthly_total: 1000, rent: 400, food: 260, transport: 50, coworking: 150, other: 140 },
  'roatan':           { monthly_total: 1100, rent: 450, food: 280, transport: 60, coworking: 160, other: 150 },
  'dahab':            { monthly_total: 800,  rent: 280, food: 220, transport: 30, coworking: 130, other: 140 },
  'cusco':            { monthly_total: 900,  rent: 350, food: 230, transport: 40, coworking: 140, other: 140 },

  // Tier 2 — Cheap ($1200-1800)
  'istanbul':         { monthly_total: 1300, rent: 500, food: 350, transport: 60, coworking: 180, other: 210 },
  'kas':              { monthly_total: 1200, rent: 450, food: 330, transport: 50, coworking: 160, other: 210 },
  'antalya':          { monthly_total: 1200, rent: 450, food: 330, transport: 50, coworking: 160, other: 210 },
  'tbilisi':          { monthly_total: 1200, rent: 450, food: 300, transport: 40, coworking: 180, other: 230 },
  'bogota':           { monthly_total: 1300, rent: 500, food: 320, transport: 60, coworking: 180, other: 240 },
  'medellin':         { monthly_total: 1400, rent: 550, food: 350, transport: 60, coworking: 200, other: 240 },
  'cartagena':        { monthly_total: 1300, rent: 500, food: 330, transport: 60, coworking: 180, other: 230 },
  'santa-marta':      { monthly_total: 1100, rent: 420, food: 300, transport: 50, coworking: 150, other: 180 },
  'mexico-city':      { monthly_total: 1500, rent: 600, food: 350, transport: 70, coworking: 200, other: 280 },
  'guadalajara':      { monthly_total: 1300, rent: 500, food: 320, transport: 60, coworking: 180, other: 240 },
  'oaxaca':           { monthly_total: 1200, rent: 450, food: 300, transport: 50, coworking: 170, other: 230 },
  'playa-del-carmen': { monthly_total: 1500, rent: 600, food: 350, transport: 60, coworking: 200, other: 290 },
  'tulum':            { monthly_total: 1600, rent: 650, food: 380, transport: 60, coworking: 220, other: 290 },
  'lima':             { monthly_total: 1300, rent: 500, food: 320, transport: 60, coworking: 180, other: 240 },
  'bucharest':        { monthly_total: 1300, rent: 500, food: 320, transport: 50, coworking: 180, other: 250 },
  'budapest':         { monthly_total: 1400, rent: 550, food: 350, transport: 50, coworking: 200, other: 250 },
  'belgrade':         { monthly_total: 1200, rent: 450, food: 300, transport: 50, coworking: 170, other: 230 },
  'sofia':            { monthly_total: 1200, rent: 450, food: 300, transport: 40, coworking: 170, other: 240 },
  'bansko':           { monthly_total: 1000, rent: 380, food: 260, transport: 40, coworking: 150, other: 170 },
  'krakow':           { monthly_total: 1400, rent: 550, food: 350, transport: 50, coworking: 200, other: 250 },
  'warsaw':           { monthly_total: 1500, rent: 600, food: 350, transport: 60, coworking: 200, other: 290 },
  'vilnius':          { monthly_total: 1400, rent: 550, food: 340, transport: 50, coworking: 200, other: 260 },
  'riga':             { monthly_total: 1400, rent: 550, food: 340, transport: 50, coworking: 200, other: 260 },
  'tallinn':          { monthly_total: 1500, rent: 600, food: 350, transport: 50, coworking: 200, other: 300 },
  'buenos-aires':     { monthly_total: 1300, rent: 500, food: 320, transport: 50, coworking: 180, other: 250 },
  'montevideo':       { monthly_total: 1500, rent: 600, food: 380, transport: 60, coworking: 200, other: 260 },
  'cape-town':        { monthly_total: 1400, rent: 550, food: 320, transport: 60, coworking: 200, other: 270 },
  'marrakech':        { monthly_total: 1200, rent: 450, food: 300, transport: 50, coworking: 170, other: 230 },
  'shanghai':         { monthly_total: 1800, rent: 750, food: 400, transport: 80, coworking: 250, other: 320 },

  // Tier 3 — Moderate ($1800-2500)
  'lisbon':           { monthly_total: 2000, rent: 850, food: 450, transport: 80, coworking: 250, other: 370 },
  'porto':            { monthly_total: 1800, rent: 750, food: 400, transport: 70, coworking: 230, other: 350 },
  'madeira-funchal':  { monthly_total: 1800, rent: 750, food: 400, transport: 60, coworking: 230, other: 360 },
  'ericeira':         { monthly_total: 1800, rent: 750, food: 400, transport: 60, coworking: 230, other: 360 },
  'athens':           { monthly_total: 1800, rent: 750, food: 400, transport: 70, coworking: 230, other: 350 },
  'thessaloniki':     { monthly_total: 1600, rent: 650, food: 380, transport: 60, coworking: 200, other: 310 },
  'barcelona':        { monthly_total: 2200, rent: 950, food: 450, transport: 80, coworking: 280, other: 440 },
  'valencia':         { monthly_total: 1900, rent: 800, food: 400, transport: 70, coworking: 250, other: 380 },
  'malaga':           { monthly_total: 1800, rent: 750, food: 400, transport: 70, coworking: 230, other: 350 },
  'gran-canaria-las-palmas': { monthly_total: 1800, rent: 750, food: 400, transport: 60, coworking: 230, other: 360 },
  'las-palmas':       { monthly_total: 1800, rent: 750, food: 400, transport: 60, coworking: 230, other: 360 },
  'tenerife':         { monthly_total: 1800, rent: 750, food: 400, transport: 60, coworking: 230, other: 360 },
  'split':            { monthly_total: 1800, rent: 750, food: 400, transport: 60, coworking: 230, other: 360 },
  'dubrovnik':        { monthly_total: 2000, rent: 850, food: 420, transport: 60, coworking: 250, other: 420 },
  'palermo':          { monthly_total: 1700, rent: 700, food: 400, transport: 60, coworking: 200, other: 340 },
  'prague':           { monthly_total: 1800, rent: 750, food: 380, transport: 60, coworking: 250, other: 360 },
  'taipei':           { monthly_total: 1800, rent: 700, food: 400, transport: 60, coworking: 250, other: 390 },
  'seoul':            { monthly_total: 2000, rent: 800, food: 450, transport: 70, coworking: 280, other: 400 },
  'santiago':         { monthly_total: 1800, rent: 700, food: 400, transport: 70, coworking: 250, other: 380 },
  'valparaiso':       { monthly_total: 1500, rent: 600, food: 350, transport: 60, coworking: 200, other: 290 },
  'rio-de-janeiro':   { monthly_total: 1800, rent: 700, food: 400, transport: 80, coworking: 250, other: 370 },
  'florianopolis':    { monthly_total: 1600, rent: 650, food: 380, transport: 60, coworking: 200, other: 310 },
  'florianopolis-2':  { monthly_total: 1600, rent: 650, food: 380, transport: 60, coworking: 200, other: 310 },
  'sao-paulo':        { monthly_total: 1800, rent: 700, food: 400, transport: 80, coworking: 250, other: 370 },
  'dubai':            { monthly_total: 2500, rent: 1100, food: 500, transport: 100, coworking: 300, other: 500 },

  // Tier 4 — Expensive ($2500-3500)
  'berlin':           { monthly_total: 2500, rent: 1100, food: 500, transport: 90, coworking: 300, other: 510 },
  'london':           { monthly_total: 3200, rent: 1500, food: 600, transport: 150, coworking: 350, other: 600 },
  'paris':            { monthly_total: 3000, rent: 1400, food: 550, transport: 100, coworking: 350, other: 600 },
  'amsterdam':        { monthly_total: 2800, rent: 1300, food: 500, transport: 80, coworking: 300, other: 620 },
  'san-francisco':    { monthly_total: 3500, rent: 1800, food: 600, transport: 120, coworking: 350, other: 630 },
  'singapore':        { monthly_total: 3000, rent: 1400, food: 500, transport: 100, coworking: 350, other: 650 },
  'tokyo':            { monthly_total: 2800, rent: 1200, food: 500, transport: 100, coworking: 350, other: 650 },
  'komoro':           { monthly_total: 2200, rent: 900, food: 450, transport: 80, coworking: 300, other: 470 },
};

// ─── Internet quality estimate by country code ─────────────────
const INTERNET_SCORE = {
  // Excellent (90-100)
  SG: 98, KR: 97, JP: 95, TW: 94, US: 93, NL: 93, DE: 92, EE: 95,
  // Very Good (80-89)
  GB: 88, FR: 87, ES: 86, PT: 85, CZ: 86, PL: 85, HR: 84, LT: 87,
  HU: 84, RO: 88, BG: 83, RS: 82, LV: 86, IT: 82, CN: 80, AE: 90,
  // Good (70-79)
  TH: 78, VN: 75, MY: 79, CL: 77, AR: 72, UY: 74, BR: 73, MX: 74,
  TR: 76, GE: 75, ZA: 72, CO: 71, GR: 78,
  // Moderate (50-69)
  ID: 65, PH: 62, IN: 63, KH: 58, MA: 64, PE: 66, EG: 60, LK: 56,
  GT: 55, NP: 50, HN: 52, NG: 55, GH: 58, KE: 60, TZ: 52,
};

// ─── Haversine distance (km) ──────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Weather fetch ─────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function fetchWeather(lat, lon, cityName) {
  // Use the historical archive API with daily data (3 years: 2022-2024)
  // The climate API's monthly endpoint doesn't support these variables.
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2022-01-01&end_date=2024-12-31&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean&timezone=auto`;
  
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      return 'RATE_LIMITED';
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 120)}`);
    }
    const data = await res.json();
    
    if (data.error) throw new Error(data.reason || 'API error');
    
    const times = data.daily?.time || [];
    const temps = data.daily?.temperature_2m_mean || [];
    const precips = data.daily?.precipitation_sum || [];
    const humids = data.daily?.relative_humidity_2m_mean || [];
    
    if (times.length === 0) {
      console.warn(`  ⚠ No weather data for ${cityName}`);
      return null;
    }
    
    // Group daily data by month (0-11) across all years
    const monthlyBuckets = Array.from({ length: 12 }, () => ({ temp: [], humidity: [], rain: [] }));
    // Also track monthly rain totals per year-month for proper monthly sum averaging
    const rainByYearMonth = new Map(); // "2022-01" => total mm
    
    for (let i = 0; i < times.length; i++) {
      const date = times[i]; // "2022-01-15"
      const monthIdx = parseInt(date.slice(5, 7), 10) - 1; // 0-11
      const yearMonth = date.slice(0, 7); // "2022-01"
      
      if (temps[i] != null) monthlyBuckets[monthIdx].temp.push(temps[i]);
      if (humids[i] != null) monthlyBuckets[monthIdx].humidity.push(humids[i]);
      if (precips[i] != null) {
        if (!rainByYearMonth.has(yearMonth)) rainByYearMonth.set(yearMonth, 0);
        rainByYearMonth.set(yearMonth, rainByYearMonth.get(yearMonth) + precips[i]);
      }
    }
    
    // Compute average monthly rain totals (sum per month, averaged across years)
    const monthlyRainAvg = Array.from({ length: 12 }, () => []);
    for (const [ym, total] of rainByYearMonth) {
      const mIdx = parseInt(ym.slice(5, 7), 10) - 1;
      monthlyRainAvg[mIdx].push(total);
    }
    
    const monthly = monthlyBuckets.map((m, idx) => ({
      month: MONTHS[idx],
      temp: m.temp.length ? Math.round(avg(m.temp) * 10) / 10 : null,
      humidity: m.humidity.length ? Math.round(avg(m.humidity)) : null,
      rain: monthlyRainAvg[idx].length ? Math.round(avg(monthlyRainAvg[idx])) : null,
    }));
    
    const validTemps = monthly.filter(m => m.temp != null).map(m => m.temp);
    const validHumids = monthly.filter(m => m.humidity != null).map(m => m.humidity);
    const validRains = monthly.filter(m => m.rain != null).map(m => m.rain);
    
    return {
      monthly,
      avg_temp: validTemps.length ? Math.round(avg(validTemps) * 10) / 10 : null,
      avg_humidity: validHumids.length ? Math.round(avg(validHumids)) : null,
      annual_rain: validRains.length ? Math.round(validRains.reduce((a, b) => a + b, 0)) : null,
    };
  } catch (err) {
    console.warn(`  ⚠ Weather fetch failed for ${cityName}: ${err.message}`);
    return null;
  }
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Safety scores (per-city, 0-10 scale) ─────────────────────
const SAFETY_SCORE = {
  'tokyo': 9.2, 'singapore': 9.1, 'taipei': 9.0, 'seoul': 8.5, 'reykjavik': 9.0,
  'copenhagen': 8.8, 'vienna': 8.7, 'zurich': 8.8, 'stockholm': 8.5, 'helsinki': 8.7,
  'prague': 8.3, 'tallinn': 8.2, 'ljubljana': 8.4, 'budapest': 7.8,
  'lisbon': 7.5, 'porto': 7.8, 'barcelona': 6.8, 'berlin': 7.2, 'amsterdam': 7.3,
  'dublin': 7.5, 'split': 8.0, 'dubrovnik': 8.2, 'tbilisi': 7.5, 'bansko': 8.0,
  'bucharest': 7.0, 'belgrade': 7.2, 'chiang-mai': 8.0, 'bangkok': 7.0,
  'bali': 7.2, 'bali-cangguubud': 7.3, 'canggu': 7.2, 'ubud': 7.5,
  'kuala-lumpur': 6.8, 'ho-chi-minh-city': 6.5, 'da-nang': 7.5, 'hanoi': 6.8,
  'manila': 5.5, 'buenos-aires': 5.8, 'medellin': 5.5, 'bogota': 4.8,
  'mexico-city': 5.0, 'playa-del-carmen': 5.5, 'lima': 5.0, 'santiago': 6.0,
  'cartagena': 5.5, 'dubai': 8.5, 'istanbul': 6.5, 'antalya': 7.5,
  'cape-town': 4.5, 'nairobi': 4.0, 'accra': 5.5, 'marrakech': 5.8,
  'cairo': 5.0, 'bangalore': 5.5, 'mumbai': 5.0, 'delhi': 4.5, 'goa': 6.5,
  'antigua': 6.5, 'las-palmas': 8.0, 'tenerife': 8.0, 'malaga': 7.5,
  'valencia': 7.3, 'palma-de-mallorca': 7.8, 'koh-phangan': 7.0,
  'koh-samui': 7.2, 'phuket': 6.8, 'chiang-rai': 8.2, 'pai': 8.0,
  'florence': 7.5, 'rome': 6.5, 'milan': 7.0, 'athens': 6.8,
  'new-york': 6.0, 'san-francisco': 5.5, 'austin': 7.0, 'denver': 7.0,
  'miami': 6.0, 'montreal': 7.5, 'vancouver': 7.3, 'toronto': 7.0,
  'london': 6.5, 'paris': 6.0, 'johor-bahru': 6.5, 'johor': 6.5, 'penang': 7.0,
  'cebu': 5.8, 'siargao': 7.0, 'jakarta': 5.5, 'yogyakarta': 7.0,
  'siem-reap': 6.5, 'phnom-penh': 5.5, 'vientiane': 7.0, 'luang-prabang': 7.5,
  'kathmandu': 5.5, 'pokhara': 7.0, 'colombo': 6.0, 'batumi': 7.0,
  'yerevan': 7.5, 'tashkent': 6.5, 'almaty': 6.5,
  'gran-canaria-las-palmas': 8.0, 'sofia': 7.0, 'dahab': 7.0,
  'santa-marta': 5.0, 'kilifi': 5.0, 'florianopolis': 6.0,
  'rio-de-janeiro': 4.5, 'roatan': 5.5, 'guadalajara': 5.0,
  'montevideo': 6.5, 'kas': 7.5, 'madeira-funchal': 8.5, 'ericeira': 7.8,
  'krakow': 8.0, 'florianopolis-2': 6.0, 'cusco': 5.5,
  'sao-paulo': 4.5, 'palermo': 6.5, 'thessaloniki': 7.0,
  'vilnius': 8.0, 'shanghai': 7.5, 'riga': 7.5, 'valparaiso': 5.0,
  'hoi-an': 7.5, 'tulum': 5.5, 'oaxaca': 5.5, 'zanzibar': 5.5, 'lagos': 4.0,
  'warsaw': 7.5, 'komoro': 6.0,
};
const DEFAULT_SAFETY = 6.0;

// ─── Walkability scores (per-city, 0-10 scale) ────────────────
const WALKABILITY_SCORE = {
  'tokyo': 9.2, 'barcelona': 9.0, 'lisbon': 8.5, 'prague': 8.8, 'budapest': 8.5,
  'vienna': 9.0, 'paris': 9.0, 'berlin': 8.5, 'amsterdam': 8.8, 'copenhagen': 8.5,
  'stockholm': 8.2, 'singapore': 8.5, 'taipei': 8.0, 'london': 8.8, 'rome': 8.5,
  'florence': 9.0, 'seoul': 7.8, 'bangkok': 6.5, 'buenos-aires': 7.5,
  'istanbul': 7.0, 'porto': 7.8, 'split': 7.5, 'dubrovnik': 8.0, 'tbilisi': 6.8,
  'chiang-mai': 6.0, 'ho-chi-minh-city': 6.0, 'marrakech': 7.0, 'tallinn': 7.5,
  'athens': 7.2, 'milan': 7.8, 'valencia': 7.5, 'malaga': 7.5, 'hanoi': 6.5,
  'da-nang': 6.0, 'ljubljana': 8.0,
  'bali': 4.0, 'bali-cangguubud': 4.0, 'canggu': 4.5, 'kuala-lumpur': 5.5,
  'dubai': 4.0, 'manila': 5.0, 'mexico-city': 6.0, 'lima': 5.0, 'bogota': 5.5,
  'santiago': 6.0, 'cape-town': 4.5, 'mumbai': 5.5, 'delhi': 5.0, 'jakarta': 4.0,
  'phuket': 3.0, 'koh-phangan': 3.5, 'playa-del-carmen': 5.0, 'tulum': 4.0,
};
const DEFAULT_WALKABILITY = 5.5;

// ─── Nomad score computation (v2 — smooth continuous functions) ─
function computeNomadScore(city) {
  // Helper: clamp value between 0 and 1
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // ── 1. Cost of living (0–25 pts) ──
  // Smooth inverse linear: $500 → 25pts, $3500 → 0pts
  const cost = city.cost?.monthly_total || 2000;
  const costScore = 25 * clamp01((3500 - cost) / 3000);

  // ── 2. Safety (0–20 pts) ──
  // Linear from per-city safety score (0–10 scale)
  const safety = SAFETY_SCORE[city.slug] ?? DEFAULT_SAFETY;
  const safetyScore = 20 * (safety / 10);

  // ── 3. Weather comfort (0–15 pts) ──
  // Gaussian curve centered at 24°C with σ=6
  // Plus gradual humidity penalty above 75%
  const temp = city.weather?.avg_temp;
  let weatherScore = 15 * 0.5; // neutral default
  if (temp != null) {
    weatherScore = 15 * Math.exp(-((temp - 24) ** 2) / (2 * 6 ** 2));
    // Gradual humidity penalty (75% → no penalty, 100% → halved)
    const humidity = city.weather?.avg_humidity;
    if (humidity != null && humidity > 75) {
      weatherScore *= (1 - clamp01((humidity - 75) / 50));
    }
  }

  // ── 4. Internet speed (0–15 pts) ──
  // Linear from country-level score (already 0–100)
  const inet = INTERNET_SCORE[city.countryCode] || 60;
  const inetScore = 15 * (inet / 100);

  // ── 5. Nomad infrastructure (0–15 pts) ──
  // Logarithmic: diminishing returns after ~10 coliving+coworking spaces
  // Only counts coliving + coworking (not hostels/apartments — those aren't nomad infra)
  const colivingCoworking = (city.spaces?.coliving || 0) + (city.spaces?.coworking || 0);
  const infraScore = 15 * clamp01(Math.log2(1 + colivingCoworking) / Math.log2(11));

  // ── 6. Walkability (0–10 pts) ──
  // Linear from per-city walkability score (0–10 scale)
  const walk = WALKABILITY_SCORE[city.slug] ?? DEFAULT_WALKABILITY;
  const walkScore = 10 * (walk / 10);

  // ── Total ──
  const total = costScore + safetyScore + weatherScore + inetScore + infraScore + walkScore;
  return Math.round(Math.max(0, Math.min(100, total)));
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🏗️  Building city data for digital nomad cities...\n');
  
  // ── Step 1: Load data & extract unique cities ────────────────
  console.log('📂 Step 1: Loading nomad-data-slim.json and extracting cities...');
  const rawData = JSON.parse(readFileSync(INPUT, 'utf8'));
  console.log(`   Loaded ${rawData.length} places`);
  
  const cityMap = new Map();
  for (const place of rawData) {
    const key = place.t; // city name
    if (!cityMap.has(key)) {
      const countryCode = COUNTRY_TO_CODE[place.r];
      if (!countryCode) {
        console.warn(`   ⚠ Unknown country: "${place.r}" for city "${place.t}"`);
        continue;
      }
      cityMap.set(key, {
        slug: slugify(place.t),
        name: place.t,
        country: place.r,
        countryCode,
        continent: CONTINENT_MAP[countryCode] || 'Unknown',
        lat: place.a,
        lon: place.o,
        emoji: countryCodeToEmoji(countryCode),
      });
    }
  }
  
  // Handle duplicate slugs (e.g. Florianópolis vs Florianopolis)
  const slugSet = new Set();
  for (const [, city] of cityMap) {
    if (slugSet.has(city.slug)) {
      city.slug = city.slug + '-2';
    }
    slugSet.add(city.slug);
  }
  
  const cities = [...cityMap.values()];
  console.log(`   ✅ Extracted ${cities.length} unique cities\n`);
  
  // ── Step 3: Count spaces per city ────────────────────────────
  console.log('🏠 Step 3: Counting spaces per city per category...');
  const spaceCount = new Map();
  for (const place of rawData) {
    if (!spaceCount.has(place.t)) {
      spaceCount.set(place.t, { coliving: 0, hostel: 0, apartment: 0, guesthouse: 0, coworking: 0 });
    }
    const cat = place.c;
    const counts = spaceCount.get(place.t);
    if (counts[cat] != null) {
      counts[cat]++;
    }
  }
  
  for (const city of cities) {
    const counts = spaceCount.get(city.name) || { coliving: 0, hostel: 0, apartment: 0, guesthouse: 0, coworking: 0 };
    city.spaces = {
      ...counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  }
  console.log('   ✅ Spaces counted\n');
  
  // ── Step 6: Add cost of living ───────────────────────────────
  console.log('💰 Step 6: Adding cost of living estimates...');
  let costMatched = 0;
  let costDefault = 0;
  for (const city of cities) {
    const cost = COST_DATA[city.slug];
    if (cost) {
      city.cost = { ...cost };
      costMatched++;
    } else {
      // Fallback: estimate by continent
      console.warn(`   ⚠ No cost data for ${city.slug}, using continent fallback`);
      const cc = city.continent;
      if (cc === 'Asia') {
        city.cost = { monthly_total: 1000, rent: 400, food: 260, transport: 50, coworking: 140, other: 150 };
      } else if (cc === 'Africa') {
        city.cost = { monthly_total: 1000, rent: 400, food: 260, transport: 50, coworking: 140, other: 150 };
      } else if (cc === 'South America') {
        city.cost = { monthly_total: 1500, rent: 600, food: 350, transport: 70, coworking: 200, other: 280 };
      } else if (cc === 'North America') {
        city.cost = { monthly_total: 1500, rent: 600, food: 350, transport: 70, coworking: 200, other: 280 };
      } else {
        city.cost = { monthly_total: 2000, rent: 850, food: 400, transport: 80, coworking: 250, other: 420 };
      }
      costDefault++;
    }
  }
  console.log(`   ✅ ${costMatched} cities with specific costs, ${costDefault} with fallback\n`);
  
  // ── Step 2: Fetch weather data ───────────────────────────────
  console.log('🌤️  Step 2: Fetching weather data from Open-Meteo Archive API...');
  console.log('   (Sequential with 3.5s delay to respect rate limits)');
  let weatherSuccess = 0;
  let weatherFail = 0;
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    process.stdout.write(`   [${(i + 1).toString().padStart(2)}/${cities.length}] ${city.name}...`);
    
    let result = null;
    let retries = 0;
    const MAX_RETRIES = 3;
    
    while (retries <= MAX_RETRIES) {
      result = await fetchWeather(city.lat, city.lon, city.name);
      
      // Check if we got a rate limit (result is null and we should retry)
      if (result === 'RATE_LIMITED' && retries < MAX_RETRIES) {
        retries++;
        console.log(` ⏳ Rate limited, waiting 65s (retry ${retries}/${MAX_RETRIES})...`);
        await sleep(65000);
        process.stdout.write(`   [${(i + 1).toString().padStart(2)}/${cities.length}] ${city.name} (retry)...`);
        continue;
      }
      break;
    }
    
    if (result && result !== 'RATE_LIMITED') {
      cities[i].weather = result;
      weatherSuccess++;
      console.log(` ✓ ${result.avg_temp}°C`);
    } else {
      cities[i].weather = {
        monthly: MONTHS.map(m => ({ month: m, temp: null, humidity: null, rain: null })),
        avg_temp: null,
        avg_humidity: null,
        annual_rain: null,
      };
      weatherFail++;
      console.log(` ✗ failed`);
    }
    
    // Delay between requests: 3.5s to stay well under rate limit
    if (i < cities.length - 1) {
      await sleep(3500);
    }
  }
  console.log(`   ✅ Weather: ${weatherSuccess} success, ${weatherFail} failed\n`);

  
  // ── Step 4: Compute nomad scores ─────────────────────────────
  console.log('📊 Step 4: Computing nomad scores...');
  for (const city of cities) {
    city.nomad_score = computeNomadScore(city);
  }
  console.log('   ✅ Scores computed\n');
  
  // ── Step 5: Find nearby cities ───────────────────────────────
  console.log('🗺️  Step 5: Finding 5 nearest cities for each city...');
  for (const city of cities) {
    const distances = cities
      .filter(c => c.slug !== city.slug)
      .map(c => ({
        slug: c.slug,
        distance: haversine(city.lat, city.lon, c.lat, c.lon),
      }))
      .sort((a, b) => a.distance - b.distance);
    
    city.nearby = distances.slice(0, 5).map(d => d.slug);
  }
  console.log('   ✅ Nearby cities computed\n');
  
  // ── Output ───────────────────────────────────────────────────
  // Order fields nicely
  const output = cities.map(c => ({
    slug: c.slug,
    name: c.name,
    country: c.country,
    countryCode: c.countryCode,
    continent: c.continent,
    lat: c.lat,
    lon: c.lon,
    emoji: c.emoji,
    weather: c.weather,
    cost: c.cost,
    spaces: c.spaces,
    nomad_score: c.nomad_score,
    nearby: c.nearby,
  }));
  
  // Sort by nomad_score descending
  output.sort((a, b) => b.nomad_score - a.nomad_score);
  
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  writeFileSync(OUTPUT_SRC, JSON.stringify(output, null, 2));
  console.log(`💾 Saved to ${OUTPUT}\n💾 Bundled copy to ${OUTPUT_SRC}\n`);
  
  // ── Stats ────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 Final Stats:');
  console.log(`   Cities:      ${output.length}`);
  console.log(`   Continents:  ${[...new Set(output.map(c => c.continent))].sort().join(', ')}`);
  console.log(`   Countries:   ${[...new Set(output.map(c => c.country))].length}`);
  console.log(`   Weather OK:  ${weatherSuccess}/${output.length}`);
  
  const scores = output.map(c => c.nomad_score);
  console.log(`   Score range: ${Math.min(...scores)} - ${Math.max(...scores)}`);
  console.log(`   Avg score:   ${Math.round(avg(scores))}`);
  
  const totalSpaces = output.reduce((s, c) => s + c.spaces.total, 0);
  console.log(`   Total spaces: ${totalSpaces}`);
  
  // Top 10
  console.log('\n🏆 Top 10 Nomad Cities:');
  output.slice(0, 10).forEach((c, i) => {
    console.log(`   ${(i + 1).toString().padStart(2)}. ${c.emoji} ${c.name} (${c.country}) — score: ${c.nomad_score}, $${c.cost.monthly_total}/mo`);
  });
  
  // Bottom 5
  console.log('\n📉 Bottom 5:');
  output.slice(-5).forEach((c, i) => {
    console.log(`   ${(output.length - 4 + i).toString().padStart(2)}. ${c.emoji} ${c.name} (${c.country}) — score: ${c.nomad_score}, $${c.cost.monthly_total}/mo`);
  });
  
  console.log('\n✅ Done!');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
