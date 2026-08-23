import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How CVin.Bio collects, uses, and protects your data: resume parsing, public profiles, analytics cookies, AI-agent visibility, and your deletion rights.',
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 mx-auto w-full max-w-2xl px-4 py-12 space-y-6 text-sm text-muted-foreground">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p>
            This page summarizes how CVin.Bio handles your data. The full legal policy lives in our{' '}
            <Link href="/terms#privacy" className="underline underline-offset-2 hover:text-foreground">Terms of Service</Link>{' '}
            and controls if the two ever differ.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Account data:</strong> your name and email when you sign in via Google or email magic link.</li>
            <li><strong>Resume content:</strong> documents you upload are parsed by AI into structured profile fields (work history, education, skills). Original files are not kept permanently — only extracted data is stored.</li>
            <li><strong>Usage analytics:</strong> IP address, browser type, and page views via PostHog and Microsoft Clarity to improve the product.</li>
            <li><strong>Contact messages:</strong> anything you send through the contact form is kept until your request is resolved.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">What is public</h2>
          <p>
            A published profile at cvin.bio/yourname is visible to everyone — including search engines
            and AI assistants such as ChatGPT, Claude, and Perplexity. Private account data (your sign-in
            email, authentication credentials) is never exposed. You can unpublish or delete your profile
            at any time to remove it from public view and AI indexing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">What we never do</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We do not sell your personal data.</li>
            <li>We do not run invasive third-party advertising cookies.</li>
            <li>We do not require payment or card details — the product is free for candidates.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            Access, export, correct, or delete your data any time from the Editor dashboard. Account
            deletion permanently purges your profile and parsed resume data from active databases within
            30 days. Cached copies in search indexes may take longer to expire. Questions? Email{' '}
            <a href="mailto:hi@cvin.bio" className="underline underline-offset-2 hover:text-foreground">hi@cvin.bio</a>{' '}
            or use the{' '}
            <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">contact form</Link>.
          </p>
        </section>
      </main>
      <MicroFooter />
    </div>
  );
}
