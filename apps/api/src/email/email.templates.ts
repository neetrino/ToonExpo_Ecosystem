/**
 * Builds English (v1) set-password invitation email copy.
 * Localization of transactional email is deferred.
 */
export const buildSetPasswordEmail = (input: {
  recipientName: string;
  setPasswordUrl: string;
}): { subject: string; text: string } => {
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

  return { subject, text };
};

/**
 * Builds English (v1) password-reset email copy.
 */
export const buildPasswordResetEmail = (input: {
  recipientName: string;
  setPasswordUrl: string;
}): { subject: string; text: string } => {
  const subject = "Reset your ToonExpo password";
  const text = [
    `Hello ${input.recipientName},`,
    "",
    "We received a request to reset your ToonExpo password. Use the link below:",
    input.setPasswordUrl,
    "",
    "This link is single-use and expires in one hour. If you did not request a reset, ignore this email.",
    "",
    "— ToonExpo",
  ].join("\n");

  return { subject, text };
};
