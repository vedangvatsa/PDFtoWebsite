import type { Metadata } from 'next';
import HomeClient from './home-client';
import AgenticContent from './home-agentic-content';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: {
    absolute: 'CVin.Bio — Tech jobs and a website from your CV',
  },
  description:
    'Browse curated tech jobs and publish a public profile from your CV. Remote and on-site roles at OpenAI, Stripe, Anthropic, and more. Free, updated daily.',
  alternates: { canonical: siteUrl },
};

export default function HomePage() {
  return (
    <HomeClient>
      <AgenticContent />
    </HomeClient>
  );
}
