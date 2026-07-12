import { loadWebEnv } from '@/lib/env';

import {
  buildInviteEmailHtml,
  buildInviteEmailText,
  INVITE_EMAIL_SUBJECT,
} from './invite-email-content';
import { getResendClient } from './resend-client';

export type SendInviteEmailResult = { sent: boolean };

export type SendInviteEmailParams = {
  to: string;
  name: string;
  inviteUrl: string;
};

/**
 * Best-effort invite email. Never throws — an unset Resend config or a send
 * failure must not fail account provisioning, only skip the email.
 */
export async function sendAccountInviteEmail(
  params: SendInviteEmailParams,
): Promise<SendInviteEmailResult> {
  const client = getResendClient();
  const env = loadWebEnv();
  if (!client || !env.RESEND_FROM_EMAIL) {
    return { sent: false };
  }

  try {
    const result = await client.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: params.to,
      subject: INVITE_EMAIL_SUBJECT,
      text: buildInviteEmailText(params.name, params.inviteUrl),
      html: buildInviteEmailHtml(params.name, params.inviteUrl),
    });
    if (result.error) {
      console.warn('[email] Resend rejected the invite email', result.error);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.warn('[email] Failed to send invite email', error);
    return { sent: false };
  }
}
