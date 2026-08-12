import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Job Search',
  description:
    'Search thousands of AI, machine learning, and data science job openings from top companies on CVin.Bio.',
  alternates: { canonical: '/aiq' },
};

export default function AiqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
