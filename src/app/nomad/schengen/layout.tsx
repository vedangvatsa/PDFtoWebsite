import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Schengen 90/180 Day Calculator | CVin.Bio',
  description:
    'Free Schengen visa day calculator. Track your 90/180 rolling window, plan future trips, and avoid overstaying. Works for Thailand and UK visas too.',
  alternates: { canonical: `${siteUrl}/nomad/schengen` },
  openGraph: {
    title: 'Schengen 90/180 Day Calculator',
    description:
      'Free Schengen visa day calculator. Track your 90/180 rolling window, plan future trips, and avoid overstaying.',
    url: `${siteUrl}/nomad/schengen`,
    siteName: 'CVin.Bio',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Schengen 90/180 Day Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schengen 90/180 Day Calculator',
    description:
      'Free Schengen visa day calculator. Track your 90/180 rolling window, plan future trips, and avoid overstaying.',
    images: [`${siteUrl}/opengraph-image`],
    creator: '@cvinbio',
  },
};

export default function SchengenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
