import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  isCloudflareEmailConfigured,
  sendMarketingEmail,
  withCampaignTracking,
  defaultMarketingFrom,
} from '@/lib/cloudflare-email';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

/**
 * Admin-only MARKETING email via Cloudflare Email Service.
 *
 * Isolation:
 *   - Does not replace Resend (onboarding / contact / report-download stay on Resend)
 *   - Does not change hosting (Vercel)
 *   - Default from is news@cvin.bio, never hi@cvin.bio
 */
async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return { error: NextResponse.json({ error: 'No token' }, { status: 403 }) };

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  return NextResponse.json({
    provider: 'cloudflare',
    purpose: 'marketing',
    hosting: 'vercel',
    onboardingProvider: 'resend',
    configured: isCloudflareEmailConfigured(),
    from: (() => {
      try {
        return defaultMarketingFrom();
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });
}

/**
 * POST body:
 * {
 *   to: string | string[],
 *   subject: string,
 *   html?: string,
 *   text?: string,
 *   campaignId?: string,
 *   track?: boolean,
 *   unsubscribeUrl?: string,
 *   replyTo?: string,
 *   dryRun?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  if (!isCloudflareEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          'Cloudflare marketing email not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.',
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      to,
      subject,
      html,
      text,
      campaignId,
      track = Boolean(campaignId),
      unsubscribeUrl,
      replyTo,
      dryRun = false,
    } = body ?? {};

    if (!to || (Array.isArray(to) ? to.length === 0 : typeof to !== 'string')) {
      return NextResponse.json({ error: 'to is required' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'subject is required' }, { status: 400 });
    }
    if (!html && !text) {
      return NextResponse.json({ error: 'html or text is required' }, { status: 400 });
    }

    const recipients = (Array.isArray(to) ? to : [to]).map((e: string) =>
      String(e).trim().toLowerCase()
    );

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        purpose: 'marketing',
        provider: 'cloudflare',
        from: defaultMarketingFrom(),
        recipientCount: recipients.length,
        subject,
        campaignId: campaignId ?? null,
      });
    }

    const results: Array<{
      email: string;
      ok: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    for (const email of recipients) {
      try {
        let bodyHtml = html as string | undefined;
        if (bodyHtml && track && campaignId) {
          bodyHtml = withCampaignTracking(bodyHtml, campaignId, email);
        }

        const result = await sendMarketingEmail({
          to: email,
          subject,
          html: bodyHtml,
          text,
          campaignId,
          unsubscribeUrl,
          replyTo,
        });

        results.push({
          email,
          ok: true,
          messageId: result.messageId,
        });
      } catch (err) {
        results.push({
          email,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      provider: 'cloudflare',
      purpose: 'marketing',
      hosting: 'vercel',
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (error) {
    console.error('Marketing email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
