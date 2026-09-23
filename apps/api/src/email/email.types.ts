/**
 * Outbound email message accepted by EmailService implementations.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  /** Branded HTML alternative. Clients that cannot render it use `text`. */
  html?: string | undefined;
};

/**
 * Abstraction over transactional email delivery (Resend in production).
 */
export type EmailService = {
  send(message: EmailMessage): Promise<void>;
};

export const EMAIL_SERVICE = Symbol("EMAIL_SERVICE");
