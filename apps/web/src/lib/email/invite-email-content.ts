/**
 * Plain-text + minimal HTML invite email body (English v1 — full tri-locale
 * templates are deferred; the invite *page* itself is localized).
 */
export const INVITE_EMAIL_SUBJECT = 'You are invited to ToonExpo';

export function buildInviteEmailText(name: string, inviteUrl: string): string {
  return [
    `Hi ${name},`,
    '',
    'An account was created for you on ToonExpo. Set your password to finish activating it:',
    inviteUrl,
    '',
    'This link expires in 48 hours and can only be used once.',
    'If you did not expect this invitation, you can safely ignore this email.',
  ].join('\n');
}

export function buildInviteEmailHtml(name: string, inviteUrl: string): string {
  return `<p>Hi ${escapeHtml(name)},</p>
<p>An account was created for you on ToonExpo. Set your password to finish activating it:</p>
<p><a href="${escapeHtml(inviteUrl)}">${escapeHtml(inviteUrl)}</a></p>
<p>This link expires in 48 hours and can only be used once.</p>
<p>If you did not expect this invitation, you can safely ignore this email.</p>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
