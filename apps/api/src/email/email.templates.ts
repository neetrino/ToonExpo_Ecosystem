import { buildTransactionalEmailHtml } from "./email-html.js";

export type AccountEmail = {
  subject: string;
  text: string;
  html: string;
};

const PASSWORD_RESET_EXPIRY_LABEL = "one hour";

/** Matches ACCOUNT_ACCESS_TOKEN_TTL_SECONDS (7 days). */
const SET_PASSWORD_EXPIRY_LABEL = "7 days";

const companyLabel = (companyName: string | undefined): string | undefined => {
  const label = companyName?.replaceAll(/[\r\n]+/g, " ").trim();
  return label || undefined;
};

/**
 * Builds English (v1) set-password invitation email copy.
 * Uses the same branded card as the password-reset email.
 * Localization of transactional email is deferred.
 */
export const buildSetPasswordEmail = (input: {
  recipientName: string;
  setPasswordUrl: string;
  companyName?: string;
}): AccountEmail => {
  const company = companyLabel(input.companyName);
  const subject = company
    ? `You're invited to ${company} on ToonExpo`
    : "Set your ToonExpo password";
  const body = company
    ? `You have been invited to administer ${company} on ToonExpo. Set your password to open the company portal.`
    : "Your ToonExpo account has been created. Choose a password to finish signing in.";
  const footnote = `This link is single-use and expires in ${SET_PASSWORD_EXPIRY_LABEL}. If you did not expect this email, you can ignore it.`;
  const text = [
    `Hello ${input.recipientName},`,
    "",
    body,
    input.setPasswordUrl,
    "",
    footnote,
    "",
    "— ToonExpo",
  ].join("\n");

  const html = buildTransactionalEmailHtml({
    preheader: subject,
    heading: company ? "You're invited" : "Set your password",
    greeting: `Hello ${input.recipientName},`,
    body,
    actionLabel: "Set password",
    actionUrl: input.setPasswordUrl,
    footnote,
  });

  return { subject, text, html };
};

/**
 * Builds English (v1) password-reset email copy.
 */
export const buildPasswordResetEmail = (input: {
  recipientName: string;
  setPasswordUrl: string;
}): AccountEmail => {
  const subject = "Reset your ToonExpo password";
  const text = [
    `Hello ${input.recipientName},`,
    "",
    "We received a request to reset your ToonExpo password. Use the link below:",
    input.setPasswordUrl,
    "",
    `This link is single-use and expires in ${PASSWORD_RESET_EXPIRY_LABEL}. If you did not request a reset, ignore this email.`,
    "",
    "— ToonExpo",
  ].join("\n");

  const html = buildTransactionalEmailHtml({
    preheader: "Reset your ToonExpo password",
    heading: "Reset your password",
    greeting: `Hello ${input.recipientName},`,
    body: "We received a request to reset your ToonExpo password. Use the button below to choose a new one.",
    actionLabel: "Reset password",
    actionUrl: input.setPasswordUrl,
    footnote: `This link is single-use and expires in ${PASSWORD_RESET_EXPIRY_LABEL}. If you did not request a reset, you can ignore this email.`,
  });

  return { subject, text, html };
};
