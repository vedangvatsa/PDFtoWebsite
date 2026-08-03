import nomadCitiesJson from './nomad-cities.json';

export interface NomadCity {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  lat: number;
  lon: number;
  emoji: string;
  weather: {
    monthly: { month: string; temp: number | null; humidity: number | null; rain: number | null }[];
    avg_temp: number | null;
    avg_humidity: number | null;
    annual_rain: number | null;
  };
  cost: {
    monthly_total: number;
    rent: number;
    food: number;
    transport: number;
    coworking: number;
    other: number;
  };
  spaces: {
    coliving: number;
    hostel: number;
    apartment: number;
    guesthouse: number;
    coworking: number;
    total: number;
  };
  nomad_score: number;
  nearby: string[];
  internet?: {
    download_mbps: number;
    upload_mbps: number;
    latency_ms: number;
    test_count: number;
    quarter: string;
  };
}

const nomadCities = nomadCitiesJson as unknown as NomadCity[];
export default nomadCities;
