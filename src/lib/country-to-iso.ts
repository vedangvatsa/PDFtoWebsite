import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

// Allowed by react-svg-worldmap
const allowedIso = [
  "FJ", "TZ", "EH", "CA", "US", "KZ", "UZ", "PG", "ID", "AR", "CL", "CD", "SO", "KE", "SD", "TD", "HT", "DO", 
  "RU", "BS", "FK", "NO", "GL", "TL", "ZA", "LS", "MX", "UY", "BR", "BO", "PE", "CO", "PA", "CR", "NI", "HN", 
  "SV", "GT", "BZ", "VE", "GY", "SR", "FR", "EC", "PR", "JM", "CU", "ZW", "BW", "NA", "SN", "ML", "MR", "BJ", 
  "NE", "NG", "CM", "TG", "GH", "CI", "GN", "GW", "LR", "SL", "BF", "CF", "CG", "GA", "GQ", "ZM", "MW", "MZ", 
  "SZ", "AO", "BI", "IL", "LB", "MG", "PS", "GM", "TN", "DZ", "JO", "AE", "QA", "KW", "IQ", "OM", "VU", "KH", 
  "TH", "LA", "MM", "VN", "KP", "KR", "MN", "IN", "BD", "BT", "NP", "PK", "AF", "TJ", "KG", "TM", "IR", "SY", 
  "AM", "SE", "BY", "UA", "PL", "AT", "HU", "MD", "RO", "LT", "LV", "EE", "DE", "BG", "GR", "TR", "AL", "HR", 
  "CH", "LU", "BE", "NL", "PT", "ES", "IE", "NC", "SB", "NZ", "AU", "LK", "CN", "TW", "IT", "DK", "GB", "IS", 
  "AZ", "GE", "PH", "MY", "BN", "SI", "FI", "SK", "CZ", "ER", "JP", "PY", "YE", "SA", "CY", "MA", "EG", "LY", 
  "ET", "DJ", "UG", "RW", "BA", "MK", "RS", "ME", "XK", "TT", "SS"
];

// Map common aliases that i18n-iso-countries might miss or have under a different name
const customOverrides: Record<string, string> = {
  "Cape Verde": "CV", // Cabo Verde
  "DR Congo": "CD",
  "Swaziland": "SZ", // Eswatini
  "Laos": "LA",
  "Moldova": "MD",
  "Syria": "SY",
  "Brunei": "BN",
  "Micronesia": "FM",
  "Vatican": "VA",
};

export function getMapIsoCode(countryName: string): string | null {
  let iso = customOverrides[countryName] || countries.getAlpha2Code(countryName, 'en');
  if (iso && allowedIso.includes(iso.toUpperCase())) {
    return iso.toUpperCase();
  }
  return null;
}
