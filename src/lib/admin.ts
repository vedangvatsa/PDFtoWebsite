/** Emails allowed to use /admin and admin APIs. */
export const ADMIN_EMAILS = ['vatsvedang@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
