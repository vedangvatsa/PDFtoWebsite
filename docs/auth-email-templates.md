# Auth email templates (OTP + cross-device link)

Paste these into **Supabase Dashboard → Authentication → Email Templates**.

## Why this setup

| Path | How it works | Analytics `auth_method` |
|------|----------------|-------------------------|
| **OTP code** | User types `{{ .Token }}` in the app | `otp` |
| **Email link** | User opens `token_hash` URL (any browser/device) | `email_link` |
| **Google** | OAuth | `google` |

**Do not use only `{{ .ConfirmationURL }}`** for production sign-in. That URL is often PKCE-bound and fails when the user opens mail in Gmail app / another browser (“code verifier not found”).

Use a **Site URL** of `https://cvin.bio` and add redirect allow-list:

- `https://cvin.bio/auth/callback`
- `https://cvin.bio/**` (if using wildcard redirects)

---

## Magic Link template (returning users / OTP)

**Subject:** `Your CVin.Bio Login Code`

**Body (HTML):**

```html
<h2>Your secure login code</h2>
<p>We received a request to sign in to your CVin.Bio account.</p>
<p style="font-size:28px;font-weight:700;letter-spacing:0.2em;margin:24px 0;">
  {{ .Token }}
</p>
<p>Enter this code on the sign-in page. No password needed.</p>
<p style="margin-top:24px;">
  Or open this link on any device (phone or desktop):
</p>
<p>
  <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/editor&auth_method=email_link">
    Sign in to CVin.Bio
  </a>
</p>
<p style="color:#71717a;font-size:13px;">
  This code and link expire soon. If you did not request this, you can ignore this email.
</p>
```

> Note: If Supabase still renders “6-digit” in copy while tokens are 8 digits, keep copy generic (“login code”) or match **Auth → Providers → Email → OTP length**.

---

## Confirm signup template (new users)

**Subject:** `Confirm your CVin.Bio account`

**Body (HTML):**

```html
<h2>Welcome aboard</h2>
<p>Confirm your email to finish creating your CVin.Bio profile.</p>
<p style="font-size:28px;font-weight:700;letter-spacing:0.2em;margin:24px 0;">
  {{ .Token }}
</p>
<p>Enter this code on the sign-in page, or confirm with one tap:</p>
<p>
  <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/editor&auth_method=email_link">
    Confirm email &amp; continue
  </a>
</p>
```

---

## App-side (already implemented)

- UI accepts **8-digit** OTP (`EMAIL_OTP_LENGTH`).
- `/auth/callback` verifies `token_hash` **before** PKCE `code` (cross-device safe).
- PostHog:
  - `auth_otp_verified` — typed code success
  - `auth_completed` with `method`: `otp` | `email_link` | `google`
  - `auth_magic_link_sent` — email dispatched

### HogQL to compare methods (after traffic)

```sql
SELECT
  properties.method AS method,
  count() AS completions
FROM events
WHERE event = 'auth_completed'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY method
ORDER BY completions DESC
```

---

## Checklist after pasting templates

1. Send test OTP to yourself from `/signup`.
2. **Type the code** on desktop → should land on `/editor`, PostHog `method=otp`.
3. Request again → open **link on phone** (different browser) → should work, `method=email_link`.
4. Confirm Google still works, `method=google`.
