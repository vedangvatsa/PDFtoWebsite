import type { Metadata } from 'next';
import HomeClient from './home-client';
import { PLATFORM_JOBS_DISPLAY } from '@/lib/platform-job-count';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

const FAQS = [
  {
    q: 'What is CVin.Bio?',
    a: 'CVin.Bio is a curated tech job board and a CV-to-website product. Browse live roles or upload a resume to publish a public profile at a cvin.bio URL.',
  },
  {
    q: 'Where can I find tech jobs on CVin.Bio?',
    a: `Open https://cvin.bio/jobs to browse ${PLATFORM_JOBS_DISPLAY} curated roles, including remote jobs at companies such as OpenAI, Stripe, and Anthropic. Listings update daily.`,
  },
  {
    q: 'How do I turn my CV into a website?',
    a: 'Upload a PDF or Word resume on https://cvin.bio. CVin.Bio extracts your experience and publishes a shareable profile. Matching jobs use the skills on that profile.',
  },
  {
    q: 'Is CVin.Bio free?',
    a: 'Yes. Publishing a profile and browsing the job board is free.',
  },
];

export const metadata: Metadata = {
  title: {
    absolute: 'CVin.Bio — Tech jobs and a website from your CV',
  },
  description:
    'Browse curated tech jobs and publish a public profile from your CV. Remote and on-site roles at OpenAI, Stripe, Anthropic, and more. Free, updated daily.',
  alternates: { canonical: siteUrl },
};

export default function HomePage() {
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
      <HomeClient />
    </>
  );
}
