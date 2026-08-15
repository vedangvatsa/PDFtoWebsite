import type { Metadata } from 'next';
import { getPlatformStats } from '@/lib/get-platform-stats';
import HiringClient from '@/components/hiring-client';
import { PLATFORM_JOBS_DISPLAY } from '@/lib/platform-job-count';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getPlatformStats();
  return {
    title: 'The Tech Talent Report 2026 | Skills, Roles, and Hiring Trends',
    description: `Analysis of ${stats.jobCountDisplay} job listings across ${stats.companyCountDisplay} companies. Which skills are most in demand? Where is hiring happening? How much does AI matter? The data tells the story.`,
    keywords: ['tech talent report 2026', 'tech hiring trends', 'AI jobs report', 'software engineer demand', 'tech skills demand', 'programming language trends'],
    openGraph: {
      title: 'The Tech Talent Report 2026',
      description: `Analysis of ${stats.jobCountDisplay} listings across ${stats.companyCountDisplay} companies. Skills, roles, compensation, and regional hiring patterns.`,
      url: `${siteUrl}/hiring`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Tech Talent Report 2026',
      description: `${stats.jobCountDisplay} jobs analyzed. What the data reveals about tech hiring in 2026.`,
    },
    alternates: { canonical: `${siteUrl}/hiring` },
  };
}

export default function TechTalentReportPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the CVin.Bio Tech Talent Report 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The Tech Talent Report at https://cvin.bio/hiring analyzes ${PLATFORM_JOBS_DISPLAY} curated job listings on CVin.Bio — skills, roles, and hiring trends across companies such as OpenAI, Stripe, and Anthropic.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I browse the jobs behind this report?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open https://cvin.bio/jobs for the live board, or search https://cvin.bio/jobs?q= by role or company.',
        },
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <HiringClient />
    </>
  );
}
