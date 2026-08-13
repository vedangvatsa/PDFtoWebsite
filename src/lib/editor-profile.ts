import { nameToProfileSlug, isDisposableProfileSlug } from '@/lib/parse-guard';
import { createClient } from '@/utils/supabase/client';

export function dataURLtoFile(dataurl: string, filename: string): File | null {
  const arr = dataurl.split(',');
  if (arr.length < 2) { return null; }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) { return null; }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/** Pretty profile slug from a person's name (not from URLs / user96 defaults). */
export function generateBaseSlug(name: string) {
  const base = nameToProfileSlug(name || '');
  return base && base !== 'profile' ? base : 'profile';
}

/** Reject UUID defaults, user96, LinkedIn/URLs, and other unusable public slugs. */
export function isBadSlug(slug: string | null | undefined): boolean {
  return isDisposableProfileSlug(slug);
}

export async function mintUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  baseSlug: string,
  userId: string
): Promise<string> {
  let newSlug = baseSlug || 'user';
  let attempt = 0;
  while (attempt < 100) {
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', newSlug).maybeSingle();
    if (!existing || existing.id === userId) return newSlug;
    attempt++;
    newSlug = `${baseSlug}${attempt}`;
  }
  return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
}

// Convert ALL CAPS names to Title Case (leaves mixed-case names untouched)
export function smartTitleCase(name: string): string {
  if (!name) return name;
  const isAllCaps = name === name.toUpperCase() && /[A-Z]/.test(name);
  const isAllLower = name === name.toLowerCase();
  if (isAllCaps || isAllLower) {
    return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return name;
}

/** Strip leading bullet chars (•, -, *, etc.) from skill names */
export const cleanSkill = (s: any): string => {
  const raw = typeof s === 'string' ? s : s?.name || '';
  return raw.replace(/^[•\-\*▪▸►‣○●]\s*/, '').trim();
};

export function isThinParse(extractedData: { _parseNeedsReview?: boolean; _parseMethod?: string }): boolean {
  const parseMethod = String(extractedData._parseMethod || 'ai');
  return !!extractedData._parseNeedsReview || parseMethod === 'regex' || parseMethod === 'shell';
}

export function mergeParsedProfileArrays<T>(thinParse: boolean, next: T[], prev: T[]): T[] {
  return thinParse && next.length === 0 && prev.length > 0 ? prev : next;
}
