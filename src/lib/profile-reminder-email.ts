/**
 * Profile completion reminder email (Cloudflare Email Sending).
 * Design: docs/design_guidelines.md — monochrome, Inter, no fluff.
 * Layout: email-client safe (no clipping of long CTAs).
 */

export type ProfileReminderInput = {
  firstName: string;
  score: number;
  username: string;
  /** Human lines already formatted, e.g. "a profile photo" or bullet labels */
  missing: string[];
  email: string;
  campaignId?: string;
  siteUrl?: string;
};

const MISSING_LABELS: Record<string, string> = {
  hasPhoto: 'Profile photo',
  hasSummary: 'Short summary',
  hasLocation: 'Location',
  hasWork: 'Work experience',
  hasEdu: 'Education',
  hasSkill: 'At least one skill',
  // also accept plain keys from callers
  photo: 'Profile photo',
  summary: 'Short summary',
  location: 'Location',
  work: 'Work experience',
  education: 'Education',
  skill: 'At least one skill',
};

const TELEGRAM_LABEL = 'Jobs feed on Telegram · 5,000+ subscribers';
const TELEGRAM_URL = 'https://t.me/techjobsdaily';

function siteBase(siteUrl?: string) {
  return (siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio').replace(
    /\/$/,
    ''
  );
}

function utm(base: string, path: string, campaign: string, content: string) {
  const u = new URL(path.startsWith('http') ? path : `${base}${path}`);
  u.searchParams.set('utm_source', 'email');
  u.searchParams.set('utm_medium', 'email');
  u.searchParams.set('utm_campaign', campaign);
  u.searchParams.set('utm_content', content);
  return u.toString();
}

function trackClick(
  base: string,
  finalUrl: string,
  campaign: string,
  email: string
) {
  const t = new URL(`${base}/api/email-track`);
  t.searchParams.set('action', 'click');
  t.searchParams.set('cid', campaign);
  t.searchParams.set('email', email);
  t.searchParams.set('url', finalUrl);
  return t.toString();
}

function formatMissing(missing: string[]): {
  single: boolean;
  line: string;
  bulletsHtml: string;
  bulletsText: string;
} {
  const labels = missing.map((m) => MISSING_LABELS[m] ?? m);
  if (labels.length === 1) {
    const raw = labels[0];
    // single-item prose form
    const line =
      raw === 'Profile photo'
        ? 'a profile photo'
        : raw === 'Short summary'
          ? 'a short summary'
          : raw === 'Location'
            ? 'your location'
            : raw === 'Work experience'
              ? 'work experience'
              : raw === 'Education'
                ? 'education'
                : raw === 'At least one skill'
                  ? 'at least one skill'
                  : raw.toLowerCase();
    return {
      single: true,
      line,
      bulletsHtml: '',
      bulletsText: line,
    };
  }
  const bulletsText = labels.map((l) => `- ${l}`).join('\n');
  const bulletsHtml = labels
    .map(
      (l) =>
        `<p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#3F3F46;">• ${escapeHtml(l)}</p>`
    )
    .join('');
  return { single: false, line: '', bulletsHtml, bulletsText };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Full-width button cell — wraps long labels, never clips */
function buttonRow(opts: {
  href: string;
  label: string;
  variant: 'primary' | 'outline';
  marginBottom: string;
}) {
  const bg = opts.variant === 'primary' ? '#18181B' : '#FFFFFF';
  const color = opts.variant === 'primary' ? '#FFFFFF' : '#18181B';
  const border =
    opts.variant === 'outline' ? 'border:1px solid #18181B;' : 'border:0;';

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 ${opts.marginBottom} 0;width:100%;">
  <tr>
    <td align="center" style="background-color:${bg};${border}border-radius:8px;width:100%;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${opts.href}" style="height:48px;v-text-anchor:middle;width:300px;" arcsize="12%" stroke="${opts.variant === 'outline' ? 't' : 'f'}" fillcolor="${bg}">
        <w:anchorlock/>
        <center style="color:${color};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${escapeHtml(opts.label)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${opts.href}" target="_blank" style="display:block;width:100%;max-width:100%;box-sizing:border-box;padding:14px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:-0.01em;line-height:1.45;color:${color};text-decoration:none;text-align:center;white-space:normal;word-break:break-word;mso-hide:all;">
        ${escapeHtml(opts.label)}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

export function buildProfileReminderEmail(input: ProfileReminderInput) {
  const base = siteBase(input.siteUrl);
  const campaign = input.campaignId ?? 'profile-reminder';
  const firstName = (input.firstName || 'there').trim() || 'there';
  const score = Math.max(0, Math.min(100, Math.round(input.score)));
  const missing = formatMissing(input.missing);

  const editorDest = utm(base, '/editor', campaign, 'editor');
  const editorUrl = trackClick(base, editorDest, campaign, input.email);
  const telegramUrl = trackClick(base, TELEGRAM_URL, campaign, input.email);
  const openPixel = `${base}/api/email-track?action=open&cid=${encodeURIComponent(campaign)}&email=${encodeURIComponent(input.email)}`;

  const subject =
    input.missing.length === 1
      ? 'One thing left on your CVin.Bio profile'
      : score <= 33
        ? 'Finish setting up your CVin.Bio profile'
        : `Your profile is ${score}% complete`;

  // Don't lead with 0% — it reads poorly for empty profiles
  const showScore = score > 0;

  const whatsLeftText = missing.single
    ? showScore
      ? `Your profile is ${score}% complete. What's left: ${missing.line}.`
      : `What's left: ${missing.line}.`
    : showScore
      ? `Your profile is ${score}% complete. What's left:\n${missing.bulletsText}`
      : `What's left:\n${missing.bulletsText}`;

  const whatsLeftHtml = missing.single
    ? `<p style="margin:0;font-size:14px;line-height:1.55;color:#3F3F46;">What's left: <span style="font-weight:600;color:#09090B;">${escapeHtml(missing.line)}</span></p>`
    : `<p style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:#3F3F46;">What's left:</p>${missing.bulletsHtml}`;

  const scoreBoxHtml = showScore
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 24px 0;border:1px solid #E4E4E7;">
                <tr>
                  <td style="padding:16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                    <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;line-height:1.3;color:#71717A;">
                      Profile score
                    </p>
                    <p style="margin:0 0 10px 0;font-size:28px;font-weight:800;letter-spacing:-0.05em;line-height:1.15;color:#09090B;">
                      ${score}%
                    </p>
                    ${whatsLeftHtml}
                  </td>
                </tr>
              </table>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 24px 0;border:1px solid #E4E4E7;">
                <tr>
                  <td style="padding:16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                    ${whatsLeftHtml}
                  </td>
                </tr>
              </table>`;

  const text = `Hi ${firstName},

You created a CVin.Bio account, but your profile is still incomplete. CVin.Bio turns your CV into a live website of your profile. Recruiters open one link instead of a PDF or Word file.

${whatsLeftText}

Finish here: ${editorDest}

${TELEGRAM_LABEL}:
${TELEGRAM_URL}

— CVin.Bio

You have a CVin.Bio account. Reply to stop these emails.`;

  // Truncation-safe HTML: full-width CTAs, no overflow/max-height, wraps long labels
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    /* Clients that support it: never clip CTA text */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    u + #body a { color: inherit; text-decoration: none; }
    #MessageViewBody a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-card { width: 100% !important; }
      .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body id="body" style="margin:0;padding:0;width:100% !important;min-width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#FAFAFA;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${showScore ? `Your profile is ${score}% complete. Finish it on CVin.Bio.` : 'Finish your CVin.Bio profile.'}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#FAFAFA;margin:0;padding:0;width:100%;">
    <tr>
      <td align="center" valign="top" style="padding:32px 12px 48px 12px;">
        <table role="presentation" class="email-card" cellpadding="0" cellspacing="0" border="0" width="560" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;max-width:560px;background-color:#FFFFFF;border:1px solid #E4E4E7;">
          <tr>
            <td class="email-pad" valign="top" style="padding:32px 24px 40px 24px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;word-break:break-word;">

              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#3F3F46;">
                Hi ${escapeHtml(firstName)},
              </p>

              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.65;color:#3F3F46;">
                You created a CVin.Bio account, but your profile is still incomplete. CVin.Bio turns your CV into a live website of your profile. Recruiters open one link instead of a PDF or Word file.
              </p>

              ${scoreBoxHtml}

              ${buttonRow({
                href: editorUrl,
                label: 'Finish profile',
                variant: 'primary',
                marginBottom: '12px',
              })}

              ${buttonRow({
                href: telegramUrl,
                label: TELEGRAM_LABEL,
                variant: 'outline',
                marginBottom: '28px',
              })}

              <p style="margin:0 0 20px 0;font-size:14px;line-height:1.5;color:#09090B;font-weight:600;letter-spacing:-0.02em;">
                — CVin.Bio
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border-top:1px solid #E4E4E7;">
                <tr>
                  <td style="padding:16px 0 8px 0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#A1A1AA;">
                    You have a CVin.Bio account. Reply to stop these emails.
                  </td>
                </tr>
              </table>

              <img src="${openPixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject,
    text,
    html,
    campaign,
    from: { address: 'news@cvin.bio' as const, name: 'CVin.Bio' as const },
    replyTo: 'hi@cvin.bio' as const,
  };
}

export async function sendProfileReminderViaCloudflare(
  input: ProfileReminderInput
) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN');
  }

  const built = buildProfileReminderEmail(input);

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: built.from,
        to: input.email,
        reply_to: built.replyTo,
        subject: built.subject,
        text: built.text,
        html: built.html,
        headers: {
          'X-Email-Purpose': 'profile-reminder',
          'X-Campaign-ID': built.campaign,
        },
      }),
    }
  );

  const data = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: { message_id?: string };
  };

  if (!data.success) {
    throw new Error(
      data.errors?.map((e) => e.message).join('; ') ||
        `Cloudflare send failed (HTTP ${res.status})`
    );
  }

  return { messageId: data.result?.message_id, campaign: built.campaign };
}
