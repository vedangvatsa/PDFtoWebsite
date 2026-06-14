import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Visa Checker — Visa Requirements by Passport for 199 Countries',
  description:
    'Check visa requirements for any passport. See which countries you can enter visa-free, visa on arrival, eVisa, or visa required — covering all 199 countries.',
  keywords: [
    'visa checker', 'visa requirements', 'passport index', 'visa free countries',
    'digital nomad visa', 'travel visa', 'visa on arrival',
  ],
  alternates: { canonical: `${siteUrl}/passport` },
  openGraph: {
    title: 'Visa Checker — Requirements for 199 Countries',
    description: 'Check visa requirements for any passport country.',
    url: `${siteUrl}/passport`,
    siteName: 'CVin.Bio',
    type: 'website', images: [{ url: `${siteUrl}/nomad/opengraph-image`, width: 1200, height: 630 }],
  },
};

export default function VisaCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
