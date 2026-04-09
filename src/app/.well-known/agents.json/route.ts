import { NextResponse } from 'next/server';

/**
 * /.well-known/agents.json — AI Agent Discovery Protocol
 * Tells AI agents what capabilities this site offers and how to interact.
 * Similar to robots.txt but for agentic AI systems.
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  return NextResponse.json({
    schema_version: '1.0',
    domain: 'cvin.bio',
    name: 'CVin.Bio',
    description: 'Convert PDF CVs to professional websites. Browse 17,000+ tech jobs at 170+ companies with AI-powered skill matching.',
    url: siteUrl,
    
    capabilities: [
      {
        name: 'Job Search',
        description: 'Search 17,000+ tech job listings across 170+ companies. Filter by role, location, company, and job type.',
        endpoint: `${siteUrl}/api/jobs`,
        method: 'GET',
        parameters: {
          q: 'Search query (title or company name)',
          type: 'Job type filter: full_time, contract, part_time, internship, freelance',
          location: 'Location filter: remote, onsite',
          page: 'Page number (default: 1)',
          limit: 'Results per page (default: 20, max: 100)',
        },
      },
      {
        name: 'Company Careers',
        description: 'View all open roles at a specific company',
        url_pattern: `${siteUrl}/{company-slug}`,
        examples: [
          `${siteUrl}/stripe`,
          `${siteUrl}/openai`,
          `${siteUrl}/anthropic`,
          `${siteUrl}/cloudflare`,
        ],
      },
      {
        name: 'Professional Profiles',
        description: 'View professional profiles created from CV uploads',
        url_pattern: `${siteUrl}/{username}`,
      },
    ],

    content_resources: [
      {
        name: 'Tech Talent Report 2026',
        url: `${siteUrl}/tech-talent-report`,
        description: 'Analysis of 17,000+ tech job listings. Skills demand, hiring trends, and compensation data.',
        type: 'research_report',
      },
      {
        name: 'Tech Layoffs Report 2026',
        url: `${siteUrl}/layoffs-report`,
        description: '750,000+ tech workers laid off since 2020. Data on who is cutting, why, and labor market impact.',
        type: 'research_report',
      },
      {
        name: 'Remote Talent Report 2026',
        url: `${siteUrl}/remote-talent-report`,
        description: '34 million remote workers. Hiring trends, compensation premiums, and RTO mandate data.',
        type: 'research_report',
      },
    ],

    context_files: {
      summary: `${siteUrl}/llms.txt`,
      full: `${siteUrl}/llms-full.txt`,
      ai_plugin: `${siteUrl}/.well-known/ai-plugin.json`,
    },

    contact: {
      email: 'hello@cvin.bio',
      url: `${siteUrl}/contact`,
    },

    social: {
      twitter: 'https://x.com/cvinbio',
      linkedin: 'https://www.linkedin.com/company/cvinbio',
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
