import { buildTransactionalEmailHtml } from "./email-html.js";

export type AccountEmail = {
  subject: string;
  text: string;
  html: string;
};

const PASSWORD_RESET_EXPIRY_LABEL = "one hour";

/**
 * Builds English (v1) set-password invitation email copy.
 * Localization of transactional email is deferred.
 */
export const buildSetPasswordEmail = (input: {
  recipientName: string;
  setPasswordUrl: string;
}): AccountEmail => {
  const subject = "Set your ToonExpo password";
  const text = [
    `Hello ${input.recipientName},`,
    "",
    "Your ToonExpo account has been created. Set your password using the link below:",
    input.setPasswordUrl,
    "",
    "This link is single-use and expires soon. If you did not expect this email, ignore it.",
    "",
    "— ToonExpo",
  ].join("\n");

  const html = buildTransactionalEmailHtml({
    preheader: "Set your ToonExpo password",
    heading: "Set your password",
    greeting: `Hello ${input.recipientName},`,
    body: "Your ToonExpo account has been created. Choose a password to finish signing in.",
    actionLabel: "Set password",
    actionUrl: input.setPasswordUrl,
    footnote: "This link is single-use and expires soon. If you did not expect this email, you can ignore it.",
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
