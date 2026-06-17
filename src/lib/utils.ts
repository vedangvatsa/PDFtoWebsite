import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Shared page container class — single source of truth for content width across the site. */
export const PAGE_CONTAINER = 'w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-24 pb-32 flex-1';

/** Page title H1 — used on all tool/content pages. */
export const PAGE_TITLE = 'text-3xl md:text-4xl font-extrabold tracking-tighter text-zinc-900 mb-3';

/** Page subtitle — muted description below H1. */
export const PAGE_SUBTITLE = 'text-lg text-zinc-600 max-w-3xl';

/** Disclaimer text block at bottom of data pages. */
export const PAGE_DISCLAIMER = 'mt-8 flex items-start gap-2 text-xs text-zinc-400 leading-relaxed max-w-2xl';

/** Table column header. */
export const TABLE_HEADER = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-400';

/** Score badge color classes (nomad score, safety score, etc.). */
export function scoreBadgeClasses(score: number) {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700';
  if (score >= 50) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

/** Default city image when no specific image is found. */
export const CITY_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80';

export function getCitySlug(cityName: string): string {
  const lowerName = cityName.toLowerCase();
  if (lowerName === 'roatán') return 'roatan';
  if (lowerName === 'kaş') return 'kas';
  if (lowerName === 'florianópolis') return 'florianopolis';

  const normalized = cityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+$/, '')
    .replace(/^-+/, '');
}

export const CITY_IMAGES: Record<string, string> = {
  // ── Southeast Asia ──
  'chiang-mai': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80',
  'da-nang': '/images/cities/da-nang.png',
  'koh-phangan': '/images/cities/koh-phangan.png',
  'kuala-lumpur': '/images/cities/kuala-lumpur.png',
  'manila': '/images/cities/manila.png',
  'penang': '/images/cities/penang.png',
  'phnom-penh': '/images/cities/phnom-penh.png',
  'siem-reap': '/images/cities/siem-reap.png',
  'hanoi': '/images/cities/hanoi.png',
  'cebu': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
  'ho-chi-minh-city': '/images/cities/ho-chi-minh-city.png',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  'phuket': 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=80',
  'hoi-an': '/images/cities/hoi-an.png',
  'siargao': '/images/cities/siargao.png',
  'colombo': '/images/cities/colombo.png',
  'johor': '/images/cities/johor.png',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',

  // ── Indonesia ──
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',

  // ── East Asia ──
  'taipei': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  'seoul': '/images/cities/seoul.png',
  'shanghai': 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=800&q=80',
  'komoro': '/images/cities/komoro.png',
  'osaka': '/images/cities/osaka.png',

  // ── South Asia ──
  'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'kathmandu': 'https://images.unsplash.com/photo-1558799401-1dcba79834c2?auto=format&fit=crop&w=800&q=80',

  // ── Middle East & Turkey ──
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  'dahab': 'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=800&q=80',
  'istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
  'antalya': '/images/cities/antalya.png',
  'kas': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
  'tel-aviv': '/images/cities/tel-aviv.png',

  // ── Africa ──
  'zanzibar': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
  'cape-town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80',
  'accra': '/images/cities/accra.png',
  'nairobi': '/images/cities/nairobi.png',
  'lagos': 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=800&q=80',
  'kilifi': 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
  'marrakech': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80',

  // ── Europe ──
  'lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&q=80',
  'porto': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
  'prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80',
  'budapest': '/images/cities/budapest.png',
  'athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80',
  'tbilisi': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=800&q=80',
  'batumi': '/images/cities/batumi.png',
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  'dublin': '/images/cities/dublin.png',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'tallinn': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?auto=format&fit=crop&w=800&q=80',
  'sofia': 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&q=80',
  'bansko': '/images/cities/bansko.png',
  'warsaw': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=800&q=80',
  'krakow': '/images/cities/krakow.png',
  'bucharest': 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
  'belgrade': '/images/cities/belgrade.png',
  'vilnius': '/images/cities/vilnius.png',
  'riga': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80',
  'dubrovnik': 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=800&q=80',
  'split': 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=800&q=80',
  'palermo': 'https://images.unsplash.com/photo-1554939437-ecc492c67b78?auto=format&fit=crop&w=800&q=80',
  'thessaloniki': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
  'malaga': '/images/cities/malaga.png',
  'valencia': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80',
  'madrid': '/images/cities/madrid.png',
  'ericeira': '/images/cities/ericeira.png',
  'tirana': '/images/cities/tirana.png',
  'madeira-funchal': 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',

  // ── Spain (Canaries) ──
  'tenerife': '/images/cities/tenerife.png',
  'las-palmas': '/images/cities/las-palmas.png',
  'gran-canaria-las-palmas': '/images/cities/las-palmas.png',

  // ── Americas ──
  'playa-del-carmen': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'tulum': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800&q=80',
  'mexico-city': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=800&q=80',
  'oaxaca': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?auto=format&fit=crop&w=800&q=80',
  'guadalajara': '/images/cities/guadalajara.png',
  'medellin': 'https://images.unsplash.com/photo-1577587230708-187fdbef4d91?auto=format&fit=crop&w=800&q=80',
  'cartagena': 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?auto=format&fit=crop&w=800&q=80',
  'bogota': 'https://images.unsplash.com/photo-1523906921802-b5d2d899e93b?auto=format&fit=crop&w=800&q=80',
  'santa-marta': 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80',
  'buenos-aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
  'rio-de-janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
  'sao-paulo': 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=800&q=80',
  'florianopolis': '/images/cities/florianopolis.png',
  'lima': '/images/cities/lima.png',
  'cusco': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
  'santiago': '/images/cities/santiago.png',
  'valparaiso': '/images/cities/valparaiso.png',
  'montevideo': '/images/cities/montevideo.png',
  'antigua': 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
  'roatan': '/images/cities/roatan.png',
  'san-francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
  'toronto': '/images/cities/toronto.png',
  'merida': '/images/cities/merida.png',
  'melbourne': '/images/cities/melbourne.png',
};
