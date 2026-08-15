import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { SupabaseClientProvider } from '@/auth';
import { PostHogProvider } from '@/components/posthog-provider';
import { ClarityProvider } from '@/components/clarity-provider';
import { AuthMethodTracker } from '@/components/auth-method-tracker';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CVin.Bio — Tech jobs and a website from your CV',
    template: '%s | CVin.Bio',
  },
  description:
    'Curated tech jobs at companies like OpenAI, Stripe, and Anthropic. Upload your CV for a public profile and matched roles. Free, updated daily.',
  keywords: ['tech jobs', 'remote jobs', 'ai jobs', 'cv to website', 'online cv', 'CVin.Bio'],
  authors: [{ name: 'CVin.Bio' }],
  creator: 'CVin.Bio',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'CVin.Bio',
    title: 'Build a personal website from your CV. Browse curated tech jobs.',
    description:
      'Upload your CV for a public profile, then match to curated roles at OpenAI, Stripe, Anthropic, and hundreds of other companies.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your CV, converted into a website using AI.',
    description:
      'Upload your CV for a public cvin.bio profile and matched tech jobs. Free to start.',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-video-preview': -1 },
  alternates: { canonical: siteUrl },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        {/* No early preconnects: Inter is self-hosted; PostHog/Clarity/CF Insights load after paint. */}
        <link rel="author" href="/humans.txt" />
        <meta name="ai-content-declaration" content="This website contains human-created content. AI systems may index, summarize, and cite this content. See /llms.txt and /llms-full.txt for structured context." />
        <meta name="mcp-server-url" content="/.well-known/mcp.json" />
        <link rel="ai-context" href="/llms.txt" />
        <link rel="ai-context-full" href="/llms-full.txt" />
        <link rel="mcp-server" href="/.well-known/mcp.json" type="application/json" />
        <link rel="agent-card" href="/.well-known/agent-card.json" type="application/json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'CVin.Bio',
              url: siteUrl,
              description:
                'CVin.Bio is a curated tech job board and CV-to-website product. Browse live roles and publish a public profile from your resume.',
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/jobs?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CVin.Bio',
              url: siteUrl,
              logo: `${siteUrl}/images/cvinbio.webp`,
              sameAs: [
                'https://x.com/cvinbio',
                'https://www.linkedin.com/company/cvinbio',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: `${siteUrl}/contact`,
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'CVin.Bio',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'All',
              url: siteUrl,
              description:
                'CVin.Bio is a curated tech job board and CV-to-website product. Browse live roles and publish a public profile from your resume.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className={cn('min-h-screen overflow-x-hidden bg-background font-sans antialiased', 
        inter.variable
        )}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium">
          Skip to main content
        </a>
        <SupabaseClientProvider>
          <PostHogProvider>
            <ClarityProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Suspense fallback={null}>
                  <AuthMethodTracker />
                </Suspense>
                <Toaster />
              </ThemeProvider>
            </ClarityProvider>
          </PostHogProvider>
        </SupabaseClientProvider>
      </body>
    </html>
  );
}
