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

