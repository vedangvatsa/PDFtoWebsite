import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Contact CVin.Bio',
  description:
    'Contact CVin.Bio — a curated tech job board and CV-to-website product. Partnerships, support, and feedback. Browse jobs at cvin.bio/jobs.',
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: 'Contact CVin.Bio',
    description:
      'CVin.Bio is a curated tech job board and CV-to-website product. Get in touch for partnerships, support, or feedback.',
    url: `${siteUrl}/contact`,
  },
  twitter: { card: 'summary', title: 'Contact CVin.Bio' },
};

const FAQS = [
  {
    q: 'What is CVin.Bio?',
    a: 'CVin.Bio is a curated tech job board and a CV-to-website product. Browse live roles at https://cvin.bio/jobs or upload a resume to publish a public profile.',
  },
  {
    q: 'How do I contact CVin.Bio?',
    a: 'Use the form on https://cvin.bio/contact or email hi@cvin.bio. We handle partnerships, support, feedback, and feature requests.',
  },
];

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {children}
    </>
  );
}
