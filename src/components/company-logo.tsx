'use client';

import { useMemo, useState } from 'react';
import { companyLogoCandidates } from '@/lib/company-logo';

interface CompanyLogoProps {
  name: string;
  logo?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Company mark with automatic fallbacks:
 * stored ATS logo → Google favicon → DuckDuckGo icon → Clearbit → initials.
 * Also advances when Google returns its generic 16×16 globe.
 */
export default function CompanyLogo({
  name,
  logo,
  size = 20,
  className = 'h-5 w-5 rounded shrink-0 object-cover bg-white',
  alt,
}: CompanyLogoProps) {
  const candidates = useMemo(
    () => companyLogoCandidates(name, logo, Math.max(size * 2, 64)),
    [name, logo, size]
  );
  const [index, setIndex] = useState(0);
  const src = candidates[Math.min(index, candidates.length - 1)];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || `${name} logo`}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        const el = e.currentTarget;
        // Google's default globe for unknown domains is 16×16 even when sz=64
        const isGenericGlobe =
          el.naturalWidth > 0 &&
          el.naturalWidth <= 16 &&
          index < candidates.length - 1 &&
          /google\.com\/s2\/favicons/i.test(src);
        if (isGenericGlobe) {
          setIndex((i) => Math.min(i + 1, candidates.length - 1));
        }
      }}
      onError={() => {
        setIndex((i) => Math.min(i + 1, candidates.length - 1));
      }}
    />
  );
}
