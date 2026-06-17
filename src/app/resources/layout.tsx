import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Digital Nomad Resources & Tools | Essential Services',
  description:
    'Curated collection of the best tools, services, and resources for digital nomads: insurance, banking, eSIMs, VPNs, flights, accommodation, and more.',
  keywords: [
    'digital nomad tools',
    'remote work resources',
    'nomad insurance',
    'esim travel',
    'nomad banking',
    'travel vpn',
  ],
  alternates: { canonical: `${siteUrl}/resources` },
  openGraph: {
    title: 'Digital Nomad Resources & Tools',
    description: 'Essential services for remote workers and digital nomads.',
    url: `${siteUrl}/resources`,
    siteName: 'CVin.Bio',
    type: 'website',
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
