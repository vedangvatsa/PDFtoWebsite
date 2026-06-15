import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { NomadMapWrapper } from '@/components/nomad-map-wrapper';
import { ArrowLeft, MapPin, Thermometer, Droplets, CloudRain, Building2, DollarSign, Wifi, Info, Users, Facebook, Send, MessageCircle, Globe, Slack } from 'lucide-react';
import { CITY_IMAGES, CITY_IMAGE_FALLBACK } from '@/lib/utils';

interface CityWeatherMonth {
  month: string;
  temp: number;
  humidity: number;
  rain: number;
}

interface CityData {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  lat: number;
  lon: number;
  emoji: string;
  weather: {
    monthly: CityWeatherMonth[];
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
  internet?: {
    download_mbps: number;
    upload_mbps: number;
    latency_ms: number;
    test_count: number;
    quarter: string;
  };
}

function loadCities(): CityData[] {
  const filePath = path.join(process.cwd(), 'public', 'nomad-cities.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

interface Community {
  name: string;
  platform: string;
  url: string;
}

function loadCommunities(): Record<string, Community[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'nomad-communities.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load communities:", err);
  }
  return {};
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-900">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}

const COST_COLORS: Record<string, string> = {
  rent: '#8b5cf6',
  food: '#10b981',
  transport: '#3b82f6',
  coworking: '#f59e0b',
  other: '#6b7280',
};

const SPACE_CONFIG: Record<string, { label: string; color: string }> = {
  coliving: { label: 'Coliving', color: '#8b5cf6' },
  hostel: { label: 'Hostels', color: '#f59e0b' },
  apartment: { label: 'Apartments', color: '#10b981' },
  guesthouse: { label: 'Guesthouses', color: '#ec4899' },
  coworking: { label: 'Coworking', color: '#3b82f6' },
};

function tempColor(temp: number): string {
  if (temp < 15) return '#3b82f6';
  if (temp <= 28) return '#10b981';
  return '#f97316';
}

export async function CityGuidePage({ citySlug }: { citySlug: string }) {
  const cities = loadCities();
  const data = cities.find((c) => c.slug === citySlug);
  if (!data) notFound();

  const communities = loadCommunities();
  const cityCommunities = communities[data.slug] || [];

  const nearbyCities = data.nearby
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter(Boolean) as CityData[];

  const maxTemp = Math.max(...data.weather.monthly.map((m) => m.temp));
  const maxRain = Math.max(...data.weather.monthly.map((m) => m.rain), 1);
  const costTotal = data.cost.monthly_total;
  const costEntries = [
    { key: 'rent', label: 'Rent', value: data.cost.rent },
    { key: 'food', label: 'Food', value: data.cost.food },
    { key: 'transport', label: 'Transport', value: data.cost.transport },
    { key: 'coworking', label: 'Coworking', value: data.cost.coworking },
    { key: 'other', label: 'Other', value: data.cost.other },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-[#fafafa] selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex-1">
        {/* Back link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* City Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
                {data.name}
              </h1>
              <p className="text-lg text-zinc-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {data.country} · {data.continent}
              </p>
            </div>
          </div>

          {/* Nomad Score */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 group relative">
                <span className="text-sm font-medium text-zinc-600">Nomad Score</span>
                <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-500 cursor-help" />
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-72 p-3 bg-zinc-900 text-white text-xs rounded-xl shadow-xl border border-zinc-800 z-20 leading-relaxed pointer-events-none transition-all">
                  Calculated based on cost of living, climate suitability (preferring 15–28°C), coworking/coliving availability, and community infrastructure.
                </div>
              </div>
              <span className="text-sm font-bold text-zinc-900">{data.nomad_score}/100</span>
            </div>
            <ScoreBar score={data.nomad_score} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <StatCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Monthly Cost"
            value={`$${data.cost.monthly_total.toLocaleString()}`}
            sub="estimated total"
          />
          <StatCard
            icon={<Thermometer className="w-4 h-4" />}
            label="Avg Temp"
            value={`${Math.round(data.weather.avg_temp)}°C`}
            sub={`${Math.round(data.weather.avg_temp * 9 / 5 + 32)}°F`}
          />
          <StatCard
            icon={<Droplets className="w-4 h-4" />}
            label="Humidity"
            value={`${Math.round(data.weather.avg_humidity)}%`}
            sub="annual average"
          />
          <StatCard
            icon={<CloudRain className="w-4 h-4" />}
            label="Annual Rain"
            value={`${Math.round(data.weather.annual_rain)}mm`}
            sub={`${Math.round(data.weather.annual_rain / 25.4)}" / year`}
          />
          <StatCard
            icon={<Building2 className="w-4 h-4" />}
            label="Total Spaces"
            value={data.spaces.total.toString()}
            sub="accommodation & coworking"
          />
          <StatCard
            icon={<Wifi className="w-4 h-4" />}
            label="Internet Speed"
            value={data.internet && data.internet.download_mbps > 0 ? `${data.internet.download_mbps} Mbps` : `${data.spaces.coworking} spaces`}
            sub={data.internet && data.internet.download_mbps > 0 ? `↑${data.internet.upload_mbps} Mbps · ${data.internet.latency_ms}ms ping` : 'coworking available'}
          />
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 transition-colors">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Cost of Living Breakdown</h2>

          {/* Stacked bar */}
          <div className="w-full h-6 rounded-full overflow-hidden flex mb-4">
            {costEntries.map((e) => (
              <div
                key={e.key}
                style={{
                  width: `${(e.value / costTotal) * 100}%`,
                  backgroundColor: COST_COLORS[e.key],
                }}
                className="h-full transition-all"
                title={`${e.label}: $${e.value}`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {costEntries.map((e) => (
              <div key={e.key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COST_COLORS[e.key] }} />
                <div>
                  <div className="text-xs text-zinc-500">{e.label}</div>
                  <div className="text-sm font-semibold text-zinc-900">${e.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Chart */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 transition-colors">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Monthly Climate</h2>

          <div className="flex items-end gap-1 sm:gap-2 h-48 mb-2">
            {data.weather.monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                {/* Temperature bar */}
                <div className="text-[10px] font-medium text-zinc-600">
                  {Math.round(m.temp)}°
                </div>
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max((m.temp / (maxTemp + 5)) * 100, 8)}%`,
                    backgroundColor: tempColor(m.temp),
                    opacity: 0.85,
                  }}
                />
                {/* Rain bar */}
                <div
                  className="w-full rounded-b-sm"
                  style={{
                    height: `${Math.max((m.rain / (maxRain + 20)) * 30, 2)}%`,
                    backgroundColor: '#93c5fd',
                    opacity: 0.5,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Month labels */}
          <div className="flex gap-1 sm:gap-2">
            {data.weather.monthly.map((m) => (
              <div key={m.month} className="flex-1 text-center text-[10px] text-zinc-400">
                {m.month}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-85" /> Comfortable (15-28°C)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-orange-500 opacity-85" /> Hot (&gt;28°C)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-85" /> Cold (&lt;15°C)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-300 opacity-50" /> Rain
            </div>
          </div>
        </div>

        {/* Spaces */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 transition-colors">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Accommodation & Coworking</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {Object.entries(SPACE_CONFIG).map(([key, cfg]) => {
              const count = data.spaces[key as keyof typeof data.spaces] as number;
              return (
                <div key={key} className="text-center">
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: cfg.color + '20' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                  </div>
                  <div className="text-2xl font-bold text-zinc-900">{count}</div>
                  <div className="text-xs text-zinc-500">{cfg.label}</div>
                </div>
              );
            })}
          </div>

          {/* Interactive City Map */}
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <NomadMapWrapper cityFilter={data.slug} />
          </div>

          {/* Local Transit Helper */}
          <div className="mt-6 pt-6 border-t border-zinc-100 text-left">
            <h3 className="text-sm font-semibold text-zinc-900 mb-2.5">Getting Around {data.name}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-zinc-500 py-1.5 mr-1.5 flex items-center">Recommended tools:</span>
              <a
                href={`https://www.rome2rio.com/s/Everywhere/${data.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50/20 hover:bg-zinc-50/60 text-zinc-600 hover:text-zinc-900 transition-all duration-300"
              >
                Rome2rio (Inter-city)
              </a>
              <a
                href="https://moovitapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50/20 hover:bg-zinc-50/60 text-zinc-600 hover:text-zinc-900 transition-all duration-300"
              >
                Moovit (Local Transit)
              </a>
              {(data.continent === 'Asia' || data.country === 'Thailand' || data.country === 'Malaysia' || data.country === 'Philippines' || data.country === 'Indonesia' || data.country === 'Vietnam' || data.country === 'Cambodia') && (
                <>
                  <a
                    href="https://12go.asia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50/20 hover:bg-zinc-50/60 text-zinc-600 hover:text-zinc-900 transition-all duration-300"
                  >
                    12Go Asia (Tickets)
                  </a>
                  <a
                    href="https://www.grab.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50/20 hover:bg-zinc-50/60 text-zinc-600 hover:text-zinc-900 transition-all duration-300"
                  >
                    Grab (Ride-Hailing)
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/nomad"
              className="text-sm text-primary hover:underline transition-colors"
            >
              View full world map →
            </Link>
            <Link
              href={`/compare?a=${data.slug}`}
              className="text-sm text-primary hover:underline transition-colors"
            >
              Compare with another city →
            </Link>
          </div>
        </div>

        {/* Local Communities */}
        {cityCommunities.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 transition-colors">
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Local Communities</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Connect with fellow digital nomads, remote workers, and expats in {data.name} through these active channels.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cityCommunities.map((group, idx) => {
                let platformIcon = <Globe className="w-4 h-4 text-zinc-500" />;
                
                if (group.platform === 'facebook') {
                  platformIcon = <Facebook className="w-4 h-4 text-zinc-500" />;
                } else if (group.platform === 'telegram') {
                  platformIcon = <Send className="w-4 h-4 text-zinc-500" />;
                } else if (group.platform === 'slack') {
                  platformIcon = <Slack className="w-4 h-4 text-zinc-500" />;
                } else if (group.platform === 'discord') {
                  platformIcon = <MessageCircle className="w-4 h-4 text-zinc-500" />;
                } else if (group.platform === 'meetup') {
                  platformIcon = <Users className="w-4 h-4 text-zinc-500" />;
                } else if (group.platform === 'reddit') {
                  platformIcon = <MessageCircle className="w-4 h-4 text-zinc-500" />;
                }

                return (
                  <a
                    key={idx}
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-4 rounded-xl border border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/60 hover:border-zinc-300 hover:shadow-sm transition-all group/card duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-zinc-100 shadow-sm">
                      {platformIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-zinc-800 group-hover/card:text-zinc-900 transition-colors truncate">
                        {group.name}
                      </div>
                      <div className="text-xs text-zinc-400 capitalize mt-0.5 flex items-center gap-1.5">
                        {group.platform}
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span className="text-primary group-hover/card:underline">Join community →</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Travel Essentials */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 transition-colors">
          <h2 className="text-lg font-bold text-zinc-900 mb-1">Travel Essentials</h2>
          <p className="text-sm text-zinc-500 mb-6">
            Recommended health, safety, and connectivity resources for your stay in {data.name}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://safetywing.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/60 hover:border-zinc-300 hover:shadow-sm transition-all group/card duration-300"
            >
              <div className="text-sm font-semibold text-zinc-800 group-hover/card:text-zinc-900 transition-colors">
                SafetyWing Insurance
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                Flexible medical travel insurance built specifically for remote workers and nomads.
              </div>
              <div className="text-xs text-primary group-hover/card:underline mt-auto pt-2.5">
                Learn more →
              </div>
            </a>

            <a
              href="https://www.worldnomads.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/60 hover:border-zinc-300 hover:shadow-sm transition-all group/card duration-300"
            >
              <div className="text-sm font-semibold text-zinc-800 group-hover/card:text-zinc-900 transition-colors">
                World Nomads
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                Full activity and travel insurance covering gear protection and extreme sports.
              </div>
              <div className="text-xs text-primary group-hover/card:underline mt-auto pt-2.5">
                Learn more →
              </div>
            </a>

            <a
              href="https://www.opensignal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/60 hover:border-zinc-300 hover:shadow-sm transition-all group/card duration-300"
            >
              <div className="text-sm font-semibold text-zinc-800 group-hover/card:text-zinc-900 transition-colors">
                OpenSignal App
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                Check 4G/5G cell coverage and WiFi signal performance in {data.name} before booking.
              </div>
              <div className="text-xs text-primary group-hover/card:underline mt-auto pt-2.5">
                Check coverage →
              </div>
            </a>
          </div>
        </div>

        {/* Nearby Cities */}
        {nearbyCities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Nearby Cities</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
              {nearbyCities.map((nc) => {
                const imageUrl = CITY_IMAGES[nc.slug] || CITY_IMAGE_FALLBACK;
                return (
                  <Link
                    key={nc.slug}
                    href={`/${nc.slug}`}
                    className="group relative flex-shrink-0 w-52 h-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <img
                      src={imageUrl}
                      alt={nc.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Score badge */}
                    <span className="absolute top-2 right-2 z-10 text-[9px] px-2 py-0.5 rounded-full bg-zinc-800/70 text-zinc-200 backdrop-blur-sm shadow-sm tracking-wide">
                      {nc.nomad_score}
                    </span>
                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Text */}
                    <div className="absolute bottom-0 inset-x-0 z-10 p-3">
                      <div className="font-bold text-sm text-white leading-tight truncate drop-shadow-lg">{nc.name}</div>
                      <div className="text-xs text-white/70 mt-0.5 drop-shadow-md">{nc.emoji} {nc.country}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Place',
              name: data.name,
              address: {
                '@type': 'PostalAddress',
                addressCountry: data.countryCode,
                addressLocality: data.name,
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: data.lat,
                longitude: data.lon,
              },
              description: `Digital nomad guide for ${data.name}, ${data.country}. Monthly cost: $${data.cost.monthly_total}. Average temperature: ${Math.round(data.weather.avg_temp)}°C.`,
            }),
          }}
        />
        {/* Source Disclaimer */}
        <p className="text-center text-xs text-zinc-400 mt-12 max-w-xl mx-auto leading-relaxed">
          * Cost of living, climate metrics, and accommodation spaces are estimated based on public open-source archives, historical weather databases, and OpenStreetMap (OSM) crowdsourced data.
        </p>
      </main>
      <MicroFooter />
      <TelegramJobPopup />
    </div>
  );
}
