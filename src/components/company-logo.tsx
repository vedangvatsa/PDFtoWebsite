'use client';

import { useEffect, useMemo, useState } from 'react';
import { companyLogoCandidates } from '@/lib/company-logo';

interface CompanyLogoProps {
  name: string;
  logo?: string | null;
  applyUrl?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Company mark with automatic fallbacks:
 * local mirrored mark → Google favicon → DuckDuckGo icon → initials.
 * Advances on error or when a CDN returns a 16×16 globe.
 */
export default function CompanyLogo({
  name,
  logo,
  applyUrl,
  size = 20,
  className = 'h-5 w-5 rounded shrink-0 object-cover bg-white',
  alt,
}: CompanyLogoProps) {
  const candidates = useMemo(
    () => companyLogoCandidates(name, logo, Math.max(size * 2, 64), applyUrl),
    [name, logo, size, applyUrl]
  );
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
  }, [candidates]);
  const src = candidates[Math.min(index, candidates.length - 1)];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={alt || `${name} logo`}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        const el = e.currentTarget;
        // Google/DDG default globe is 16×16 even when sz=64
        const isGenericGlobe =
          el.naturalWidth > 0 &&
          el.naturalWidth <= 16 &&
          index < candidates.length - 1;
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
