import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Board | CVin.Bio',
  description: 'Browse 6,000+ tech jobs from Stripe, Airbnb, Coinbase, and more. Upload your CV for personalized skill matching.',
  openGraph: {
    title: 'Job Board | CVin.Bio',
    description: 'Browse 6,000+ tech jobs from Stripe, Airbnb, Coinbase, and more. Upload your CV for personalized skill matching.',
    images: [{ url: '/images/jobs-og.png', width: 1200, height: 630, alt: 'CVin.Bio Job Board' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Board | CVin.Bio',
    description: 'Browse 6,000+ tech jobs. Upload your CV for personalized matches.',
    images: ['/images/jobs-og.png'],
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
