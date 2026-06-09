import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCitySlug(cityName: string): string {
  const lowerName = cityName.toLowerCase();
  if (lowerName === 'bali (canggu/ubud)') return 'bali-cangguubud';
  if (lowerName === 'roatán') return 'roatan';
  if (lowerName === 'kaş') return 'kas';
  if (lowerName === 'florianópolis') return 'florianopolis';
  if (lowerName === 'florianopolis') return 'florianopolis-2';

  const normalized = cityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+$/, '')
    .replace(/^-+/, '');
}

export const CITY_IMAGES: Record<string, string> = {
  'chiang-mai': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80',
  'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  'da-nang': '/images/cities/da-nang.png',
  'koh-phangan': '/images/cities/koh-phangan.png',
  'kuala-lumpur': '/images/cities/kuala-lumpur.png',
  'manila': '/images/cities/manila.png',
  'penang': '/images/cities/penang.png',
  'phnom-penh': '/images/cities/phnom-penh.png',
  'siem-reap': 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80',
  'hanoi': 'https://images.unsplash.com/photo-1568093858174-0f391ea21c45?auto=format&fit=crop&w=800&q=80',
  'cebu': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
  'playa-del-carmen': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  'ho-chi-minh-city': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'taipei': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  'zanzibar': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'las-palmas': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
  'medellin': 'https://images.unsplash.com/photo-1593005510329-8a4035a7238f?auto=format&fit=crop&w=800&q=80',
  'phuket': 'https://images.unsplash.com/photo-1589394815804-964ed7be2eb5?auto=format&fit=crop&w=800&q=80',
  'tulum': 'https://images.unsplash.com/photo-1504730030853-eff311f57d3c?auto=format&fit=crop&w=800&q=80',
  'canggu': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  'marrakech': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
  'cartagena': 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?auto=format&fit=crop&w=800&q=80',
  'oaxaca': 'https://images.unsplash.com/photo-1465256410760-10485d5be681?auto=format&fit=crop&w=800&q=80',
  'cape-town': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
  'kathmandu': 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80',
  'buenos-aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
  'mexico-city': 'https://images.unsplash.com/photo-1512813583145-baaa340ef29f?auto=format&fit=crop&w=800&q=80',
  'accra': 'https://images.unsplash.com/photo-1591157147330-d861617415b3?auto=format&fit=crop&w=800&q=80',
  'bansko': 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80',
  'hoi-an': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'siargao': 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&w=800&q=80',
  'bali-cangguubud': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
};


