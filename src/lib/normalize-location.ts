/**
 * Deterministic location normalizer
 * Merges 6,900+ messy location variants into clean canonical names
 */

// Country code → country name
const COUNTRY_CODES: Record<string, string> = {
  'us': 'United States', 'usa': 'United States', 'u.s.': 'United States',
  'uk': 'United Kingdom', 'gb': 'United Kingdom',
  'sg': 'Singapore', 'sgp': 'Singapore',
  'au': 'Australia', 'ca': 'Canada', 'de': 'Germany',
  'fr': 'France', 'in': 'India', 'jp': 'Japan',
  'br': 'Brazil', 'es': 'Spain', 'nl': 'Netherlands',
  'ie': 'Ireland', 'il': 'Israel', 'kr': 'South Korea',
  'mx': 'Mexico', 'se': 'Sweden', 'ch': 'Switzerland',
  'it': 'Italy', 'pt': 'Portugal', 'pl': 'Poland',
  'my': 'Malaysia', 'ph': 'Philippines', 'th': 'Thailand',
  'id': 'Indonesia', 'vn': 'Vietnam', 'tw': 'Taiwan',
  'hk': 'Hong Kong', 'nz': 'New Zealand', 'ar': 'Argentina',
  'co': 'Colombia', 'cl': 'Chile', 'za': 'South Africa',
  'ae': 'UAE', 'at': 'Austria', 'be': 'Belgium',
  'dk': 'Denmark', 'fi': 'Finland', 'no': 'Norway',
  'cz': 'Czech Republic', 'ro': 'Romania', 'hu': 'Hungary',
};

// US state abbr → full name (for stripping)
const US_STATES: Record<string, string> = {
  'ca': 'California', 'ny': 'New York', 'tx': 'Texas', 'wa': 'Washington',
  'ma': 'Massachusetts', 'il': 'Illinois', 'co': 'Colorado', 'ga': 'Georgia',
  'pa': 'Pennsylvania', 'va': 'Virginia', 'fl': 'Florida', 'nc': 'North Carolina',
  'md': 'Maryland', 'or': 'Oregon', 'az': 'Arizona', 'oh': 'Ohio',
  'mi': 'Michigan', 'mn': 'Minnesota', 'ct': 'Connecticut', 'nj': 'New Jersey',
  'dc': 'DC', 'ut': 'Utah', 'tn': 'Tennessee', 'mo': 'Missouri',
};

// Exact-match overrides (lowercased)
const EXACT_MAP: Record<string, string> = {
  'unknown': 'Remote',
  'hybrid': 'Hybrid',
  'worldwide': 'Remote',
  'anywhere': 'Remote',
  'global': 'Remote',
  'earth': 'Remote',
  'asia': 'Asia',
  'apac': 'Asia-Pacific',
  'emea': 'EMEA',
  'europe': 'Europe',
  'latam': 'Latin America',
  'united states': 'United States',
  'united kingdom': 'United Kingdom',
  'usa': 'United States',
  'u.s.': 'United States',
  'bengaluru': 'Bangalore',
  'bengaluru, india': 'Bangalore',
  'bengaluru, in': 'Bangalore',
  'bangalore, karnataka': 'Bangalore',
  'bangalore, india': 'Bangalore',
  'bangalore, karnataka, india': 'Bangalore',
};

// City name patterns → canonical city name
const CITY_PATTERNS: [RegExp, string][] = [
  // US cities
  [/^san francisco/i, 'San Francisco'],
  [/^new york|^nyc/i, 'New York'],
  [/^los angeles/i, 'Los Angeles'],
  [/^boston/i, 'Boston'],
  [/^austin/i, 'Austin'],
  [/^seattle/i, 'Seattle'],
  [/^chicago/i, 'Chicago'],
  [/^denver/i, 'Denver'],
  [/^palo alto/i, 'Palo Alto'],
  [/^mountain view/i, 'Mountain View'],
  [/^sunnyvale/i, 'Sunnyvale'],
  [/^menlo park/i, 'Menlo Park'],
  [/^san mateo/i, 'San Mateo'],
  [/^san jose/i, 'San Jose'],
  [/^washington,?\s*d\.?c\.?/i, 'Washington, DC'],
  [/^portland/i, 'Portland'],
  [/^atlanta/i, 'Atlanta'],
  [/^miami/i, 'Miami'],
  [/^dallas/i, 'Dallas'],
  [/^san diego/i, 'San Diego'],
  [/^pittsburgh/i, 'Pittsburgh'],
  [/^redwood city/i, 'Redwood City'],
  [/^foster city/i, 'Foster City'],
  [/^salt lake city/i, 'Salt Lake City'],
  [/^santa monica/i, 'Santa Monica'],
  [/^irvine/i, 'Irvine'],
  [/^raleigh/i, 'Raleigh'],
  [/^ann arbor/i, 'Ann Arbor'],
  [/^scottsdale/i, 'Scottsdale'],
  [/^phoenix/i, 'Phoenix'],
  [/^minneapolis/i, 'Minneapolis'],

  // International cities
  [/^london/i, 'London'],
  [/^paris/i, 'Paris'],
  [/^berlin/i, 'Berlin'],
  [/^amsterdam/i, 'Amsterdam'],
  [/^dublin/i, 'Dublin'],
  [/^munich/i, 'Munich'],
  [/^barcelona/i, 'Barcelona'],
  [/^madrid/i, 'Madrid'],
  [/^singapore/i, 'Singapore'],
  [/^tokyo/i, 'Tokyo'],
  [/^sydney/i, 'Sydney'],
  [/^melbourne/i, 'Melbourne'],
  [/^toronto/i, 'Toronto'],
  [/^vancouver/i, 'Vancouver'],
  [/^bangalore|^bengaluru/i, 'Bangalore'],
  [/^mumbai/i, 'Mumbai'],
  [/^hyderabad/i, 'Hyderabad'],
  [/^seoul/i, 'Seoul'],
  [/^tel aviv/i, 'Tel Aviv'],
  [/^stockholm/i, 'Stockholm'],
  [/^copenhagen/i, 'Copenhagen'],
  [/^zurich|^zürich/i, 'Zurich'],
  [/^lisbon/i, 'Lisbon'],
  [/^prague/i, 'Prague'],
  [/^warsaw/i, 'Warsaw'],
  [/^vienna/i, 'Vienna'],
  [/^hong kong/i, 'Hong Kong'],
  [/^jakarta/i, 'Jakarta'],
  [/^bangkok/i, 'Bangkok'],
  [/^manila/i, 'Manila'],
  [/^kuala lumpur/i, 'Kuala Lumpur'],
  [/^buenos aires/i, 'Buenos Aires'],
  [/^s[aã]o paulo/i, 'São Paulo'],
  [/^mexico city/i, 'Mexico City'],
  [/^cape town/i, 'Cape Town'],
  [/^dubai/i, 'Dubai'],
  [/^noida/i, 'Noida'],
  [/^gurgaon|^gurugram/i, 'Gurugram'],
  [/^pune/i, 'Pune'],
  [/^chennai/i, 'Chennai'],
  [/^ottawa/i, 'Ottawa'],
  [/^montreal/i, 'Montreal'],
  [/^calgary/i, 'Calgary'],
  [/^brisbane/i, 'Brisbane'],
  [/^helsinki/i, 'Helsinki'],
  [/^oslo/i, 'Oslo'],
  [/^milan/i, 'Milan'],
  [/^brussels/i, 'Brussels'],
];

export function normalizeLocation(raw: string): string {
  if (!raw) return 'Remote';
  let loc = raw.trim();

  // Strip common suffixes/noise
  loc = loc
    .replace(/\s*\(HQ\)/gi, '')
    .replace(/\s*\(Hybrid\)/gi, '')
    .replace(/\s*\(Remote\)/gi, '')
    .replace(/\s*Office$/i, '')
    .replace(/\s*-\s*The\s+.*$/i, '')  // "London - The River Building HQ"
    .replace(/\s*HQ$/i, '')
    .trim();

  // Handle "Remote" variants
  const remoteMatch = loc.match(/^(?:Remote|Work from Home|WFH|Telecommute)/i);
  if (remoteMatch) {
    // "Remote - US" → "Remote (US)"
    const rest = loc.slice(remoteMatch[0].length).replace(/^[\s\-–:,]+/, '').replace(/^\(|\)$/g, '').trim();
    if (!rest) return 'Remote';
    // Normalize the country/region after "Remote"
    const country = COUNTRY_CODES[rest.toLowerCase()] || rest;
    if (/^u\.?s\.?a?\.?$|^united states$/i.test(country)) return 'Remote (US)';
    return `Remote (${country})`;
  }
  // "United States - Remote" / "US Remote" etc.
  if (/remote$/i.test(loc) || /^remote/i.test(loc)) {
    const cleaned = loc.replace(/[\s\-–]*remote[\s\-–]*/gi, '').trim();
    if (!cleaned || /^u\.?s\.?a?\.?$|^united states$/i.test(cleaned)) return 'Remote (US)';
    return `Remote (${cleaned})`;
  }

  // Handle "US-CA-Menlo Park" pattern
  const usDashMatch = loc.match(/^US-[A-Z]{2}-(.+)$/);
  if (usDashMatch) loc = usDashMatch[1];

  // Handle "US - San Francisco" / "UK - London" pattern
  const prefixMatch = loc.match(/^(?:US|USA|UK|SG|AU|CA|DE|FR)\s*[-–]\s*(.+)$/i);
  if (prefixMatch) loc = prefixMatch[1];

  const lower = loc.toLowerCase().trim();

  // Exact match
  if (EXACT_MAP[lower]) return EXACT_MAP[lower];

  // City pattern matching
  for (const [pattern, city] of CITY_PATTERNS) {
    if (pattern.test(loc)) return city;
  }

  // Handle "City, STATE/Country" — strip redundant qualifiers
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const city = parts[0];
    const qualifier = parts[parts.length - 1].toLowerCase().trim();

    // "Singapore, Singapore" / "Singapore, sg" → "Singapore"
    if (city.toLowerCase() === qualifier || COUNTRY_CODES[qualifier] === city) return city;

    // "City, CA" → just "City" if it's a known city
    if (US_STATES[qualifier]) {
      for (const [pattern, canonicalCity] of CITY_PATTERNS) {
        if (pattern.test(city)) return canonicalCity;
      }
    }

    // "City, country code" → "City"
    if (COUNTRY_CODES[qualifier]) {
      for (const [pattern, canonicalCity] of CITY_PATTERNS) {
        if (pattern.test(city)) return canonicalCity;
      }
      // Not a known city pattern, return "City" clean
      return parts[0];
    }

    // "City, State, USA" → just "City"
    if (parts.length >= 3) {
      for (const [pattern, canonicalCity] of CITY_PATTERNS) {
        if (pattern.test(parts[0])) return canonicalCity;
      }
    }
  }

  // Multi-location (semicolons, pipes) → take first
  if (loc.includes(';') || loc.includes('|') || loc.includes('•')) {
    const first = loc.split(/[;|•]/)[0].trim();
    return normalizeLocation(first);  // recurse on first location
  }

  // Fallback: return first part (before comma) if reasonable
  if (parts[0] && parts[0].length < 40 && !/\/|http/.test(parts[0])) {
    return parts[0];
  }

  return loc;
}
