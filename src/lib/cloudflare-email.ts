/**
 * Cloudflare Email Service — MARKETING sends only.
 *
 * Isolation guarantees (do not change without explicit product decision):
 *   1. Website hosting stays on Vercel. This module never touches deploy/hosting.
 *   2. Onboarding / transactional email stays on Resend (hi@cvin.bio and existing
 *      contact/report-download routes). Do NOT import this module there.
 *   3. This client only calls Cloudflare Email Sending REST API for marketing.
 *
 * Docs: https://developers.cloudflare.com/email-service/
 *
 * Env:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN            (Email Sending Write)
 *   CLOUDFLARE_MARKETING_FROM       default news@cvin.bio (never hi@ for marketing default)
 *   CLOUDFLARE_MARKETING_FROM_NAME  default CVin.Bio
 */

export type EmailAddress =
  | string
  | {
      address: string;
      name?: string;
    };

export type MarketingEmailInput = {
  from?: EmailAddress;
  to: EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: EmailAddress;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  /** Campaign id for open/click tracking + List-Unsubscribe */
  campaignId?: string;
  unsubscribeUrl?: string;
  headers?: Record<string, string>;
};

export type SendEmailResult = {
  success: true;
  messageId?: string;
  delivered: string[];
  permanentBounces: string[];
  queued: string[];
};

/** From-addresses reserved for Resend / non-marketing. Never use as CF marketing default. */
const RESEND_RESERVED_FROM = new Set([
  'hi@cvin.bio',
  'onboarding@cvin.bio',
  'noreply@cvin.bio',
]);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function isCloudflareEmailConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
  );
}

/**
 * Default marketing From. Intentionally news@ — not hi@ (Resend onboarding).
 */
export function defaultMarketingFrom(): EmailAddress {
  const address = (
    process.env.CLOUDFLARE_MARKETING_FROM ??
    process.env.CLOUDFLARE_EMAIL_FROM ??
    'news@cvin.bio'
  )
    .trim()
    .toLowerCase();

  if (RESEND_RESERVED_FROM.has(address)) {
    throw new Error(
      `Refusing marketing From ${address}: reserved for Resend/onboarding. Use news@cvin.bio (or set CLOUDFLARE_MARKETING_FROM).`
    );
  }

  const name =
    process.env.CLOUDFLARE_MARKETING_FROM_NAME ??
    process.env.CLOUDFLARE_EMAIL_FROM_NAME ??
    'CVin.Bio';

  return { address, name };
}

function addressOf(from: EmailAddress): string {
  return (typeof from === 'string' ? from : from.address).trim().toLowerCase();
}

/**
 * Send a marketing email via Cloudflare Email Service REST API.
 * Safe to call from Vercel server code. Does not affect Resend or hosting.
 */
export async function sendMarketingEmail(
  input: MarketingEmailInput
): Promise<SendEmailResult> {
  if (!input.html && !input.text) {
    throw new Error('Email must include at least one of html or text');
  }

  const from = input.from ?? defaultMarketingFrom();
  const fromAddr = addressOf(from);
  if (RESEND_RESERVED_FROM.has(fromAddr)) {
    throw new Error(
      `Refusing to send Cloudflare marketing mail from ${fromAddr} (reserved for Resend/onboarding).`
    );
  }

  const accountId = requireEnv('CLOUDFLARE_ACCOUNT_ID');
  const token = requireEnv('CLOUDFLARE_API_TOKEN');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

  const headers: Record<string, string> = {
    ...(input.headers ?? {}),
    'X-Email-Purpose': 'marketing',
  };

  if (input.campaignId) {
    headers['X-Campaign-ID'] = input.campaignId;
  }

  const unsub =
    input.unsubscribeUrl ??
    (input.campaignId
      ? `${siteUrl}/api/email-track?action=unsubscribe&cid=${encodeURIComponent(input.campaignId)}`
      : undefined);
  if (unsub) {
    headers['List-Unsubscribe'] = `<${unsub}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  const body: Record<string, unknown> = {
    from,
    to: input.to,
    subject: input.subject,
    headers,
  };

  if (input.html) body.html = input.html;
  if (input.text) body.text = input.text;
  if (input.replyTo) body.reply_to = input.replyTo;
  if (input.cc) body.cc = input.cc;
  if (input.bcc) body.bcc = input.bcc;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const data = (await res.json().catch(() => null)) as {
    success?: boolean;
    errors?: Array<{ code?: number; message?: string }>;
    result?: {
      message_id?: string;
      delivered?: string[];
      permanent_bounces?: string[];
      queued?: string[];
    };
  } | null;

  if (!res.ok || !data?.success) {
    const errors =
      data?.errors?.map((e) => ({
        code: e.code,
        message: e.message ?? 'Unknown Cloudflare email error',
      })) ?? [{ message: `HTTP ${res.status}` }];

    const err = new Error(
      `Cloudflare marketing email failed: ${errors.map((e) => e.message).join('; ')}`
    ) as Error & { status: number; errors: typeof errors };
    err.status = res.status;
    err.errors = errors;
    throw err;
  }

  return {
    success: true,
    messageId: data.result?.message_id,
    delivered: data.result?.delivered ?? [],
    permanentBounces: data.result?.permanent_bounces ?? [],
    queued: data.result?.queued ?? [],
  };
}

/**
 * Best-effort marketing send (logs + returns null on failure).
 */
export async function sendMarketingEmailSafe(
  input: MarketingEmailInput
): Promise<SendEmailResult | null> {
  if (!isCloudflareEmailConfigured()) {
    console.warn(
      'Cloudflare marketing email not configured (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN). Skipping.'
    );
    return null;
  }

  try {
    return await sendMarketingEmail(input);
  } catch (err) {
    console.error('Cloudflare marketing email error:', err);
    return null;
  }
}

/**
 * Inject open-tracking pixel + wrap links with click tracker
 * (existing /api/email-track + email_events — marketing campaigns only).
 */
export function withCampaignTracking(
  html: string,
  campaignId: string,
  recipientEmail: string
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';
  const encEmail = encodeURIComponent(recipientEmail);
  const encCid = encodeURIComponent(campaignId);

  const pixel = `<img src="${siteUrl}/api/email-track?action=open&cid=${encCid}&email=${encEmail}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;

  const withLinks = html.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (_m, url: string) => {
      if (url.includes('/api/email-track')) return `href="${url}"`;
      const track = `${siteUrl}/api/email-track?action=click&cid=${encCid}&email=${encEmail}&url=${encodeURIComponent(url)}`;
      return `href="${track}"`;
    }
  );

  if (withLinks.includes('</body>')) {
    return withLinks.replace('</body>', `${pixel}</body>`);
  }
  return `${withLinks}${pixel}`;
}

// Aliases kept so existing marketing-email route imports stay stable if renamed mid-work
export const sendEmail = sendMarketingEmail;
export const sendEmailSafe = sendMarketingEmailSafe;
export const defaultFrom = defaultMarketingFrom;
export const isConfigured = isCloudflareEmailConfigured;

export const cloudflareMarketingEmail = {
  isConfigured: isCloudflareEmailConfigured,
  send: sendMarketingEmail,
  sendSafe: sendMarketingEmailSafe,
  withTracking: withCampaignTracking,
  defaultFrom: defaultMarketingFrom,
};
