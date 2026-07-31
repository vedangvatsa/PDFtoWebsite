import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { primaryCompanyLogoUrl } from '@/lib/company-logo';
import { supabaseAdmin } from '@/lib/supabase-admin';

/** Read a mirrored logo from public/company-logos/{slug}.png as a data URL for Satori. */
export function localCompanyLogoDataUrl(slug: string): string | null {
  const file = join(process.cwd(), 'public', 'company-logos', `${slug.toLowerCase()}.png`);
  if (!existsSync(file)) return null;
  return `data:image/png;base64,${readFileSync(file).toString('base64')}`;
}

/** Fetch a remote logo and inline it so ImageResponse can render reliably. */
export async function fetchImageAsDataUrl(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CVin.Bio OG Image Bot/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/png';
    if (!/^image\//i.test(contentType)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 2_000_000) return null;
    const mime = contentType.split(';')[0].trim();
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/**
 * Best logo source for OG cards: local mirror → stored URL → favicon/CDN fallbacks.
 * Always returns a data URL or absolute https URL that Satori can embed.
 */
export async function resolveOgCompanyLogo(opts: {
  slug?: string;
  companyName: string;
  storedLogo?: string | null;
}): Promise<string | null> {
  const slug = opts.slug?.toLowerCase().trim();
  if (slug) {
    const local = localCompanyLogoDataUrl(slug);
    if (local) return local;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio').replace(/\/$/, '');
  const candidates: string[] = [];

  if (opts.storedLogo) {
    if (/^https?:\/\//i.test(opts.storedLogo)) candidates.push(opts.storedLogo);
    else if (opts.storedLogo.startsWith('/')) candidates.push(`${siteUrl}${opts.storedLogo}`);
  }

  const primary = primaryCompanyLogoUrl(opts.companyName, opts.storedLogo, 128);
  if (primary && !candidates.includes(primary)) candidates.push(primary);

  for (const url of candidates) {
    if (url.startsWith('data:')) return url;
    const dataUrl = await fetchImageAsDataUrl(url);
    if (dataUrl) return dataUrl;
  }

  return null;
}

export async function getCompanyDirectoryForOg(slug: string) {
  const { data } = await supabaseAdmin
    .from('companies')
    .select('slug, name, role_count, logo')
    .eq('slug', slug)
    .maybeSingle();
  return data as {
    slug: string;
    name: string;
    role_count: number;
    logo: string | null;
  } | null;
}
