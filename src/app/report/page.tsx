import './report.css';
import { CITY_IMAGES, CITY_IMAGE_FALLBACK } from '@/lib/utils';
import nomadCities from '@/lib/nomad-cities';
import { ReportCover } from '@/components/report/report-cover';
import { ReportTOC } from '@/components/report/report-toc';
import { ReportMethodology } from '@/components/report/report-methodology';
import { ReportOverallRanking } from '@/components/report/report-rankings';
import { ReportInternetRanking } from '@/components/report/report-internet-ranking';
import { ReportCostRanking } from '@/components/report/report-cost-ranking';
import { ReportWeatherRanking } from '@/components/report/report-weather-ranking';
import { ReportCitySpread } from '@/components/report/report-city-spread';
import { ReportRegionalAnalysis } from '@/components/report/report-regional';
import { ReportSources } from '@/components/report/report-sources';

/* ── Types ── */
export interface CityData {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  lat: number;
  lon: number;
  emoji: string;
  weather: {
    monthly: { month: string; temp: number; humidity: number; rain: number }[];
    avg_temp: number;
    avg_humidity: number;
    annual_rain: number;
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
  internet: {
    download_mbps: number;
    upload_mbps: number;
    latency_ms: number;
    test_count: number;
    quarter: string;
  };
}

export interface RankedCity extends CityData {
  rank: number;
  weatherScore: number;
  imageUrl: string;
}

function computeWeatherScore(city: CityData): number {
  const tempDev = Math.abs(city.weather.avg_temp - 24);
  const humidityPenalty = Math.max(0, city.weather.avg_humidity - 50) * 0.3;
  const rainPenalty = city.weather.annual_rain * 0.005;
  return Math.round(Math.max(0, Math.min(100, 100 - tempDev * 3 - humidityPenalty - rainPenalty)));
}

export default function ReportPage() {
  const allCities: CityData[] = nomadCities as CityData[];

  // Sort by nomad_score, take top 50
  const sorted = [...allCities]
    .sort((a, b) => b.nomad_score - a.nomad_score)
    .slice(0, 50);

  // Enrich with rank, weather score, and image
  const cities: RankedCity[] = sorted.map((city, i) => ({
    ...city,
    rank: i + 1,
    weatherScore: computeWeatherScore(city),
    imageUrl: CITY_IMAGES[city.slug] || CITY_IMAGE_FALLBACK,
  }));

  // Pre-compute ranking lists
  const byInternet = [...cities].sort((a, b) => b.internet.download_mbps - a.internet.download_mbps);
  const byCost = [...cities].sort((a, b) => a.cost.monthly_total - b.cost.monthly_total);
  const byWeather = [...cities].sort((a, b) => b.weatherScore - a.weatherScore);

  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const quarter = cities[0]?.internet?.quarter || '2026-Q1';

  return (
    <div className="report-root">
      {/* Print button - screen only, uses native link */}
      <div className="no-print" style={{ position: 'fixed', top: 16, right: 16, zIndex: 999 }}>
        <a
          href="javascript:window.print()"
          style={{
            background: '#09090B', color: '#fff', border: 'none', padding: '10px 20px',
            borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif', textDecoration: 'none', display: 'inline-block',
          }}
        >
          Print to PDF
        </a>
      </div>

      {/* Cover */}
      <ReportCover date={reportDate} cityCount={cities.length} />

      {/* Table of Contents */}
      <ReportTOC cities={cities} />

      {/* Methodology */}
      <ReportMethodology quarter={quarter} />

      {/* Rankings */}
      <ReportOverallRanking cities={cities} />
      <ReportInternetRanking cities={byInternet} />
      <ReportCostRanking cities={byCost} />
      <ReportWeatherRanking cities={byWeather} />

      {/* City Profiles - 2 pages each */}
      {cities.map((city) => (
        <ReportCitySpread key={city.slug} city={city} allCities={cities} />
      ))}

      {/* Back Matter */}
      <ReportRegionalAnalysis cities={cities} />
      <ReportSources date={reportDate} />
    </div>
  );
}
