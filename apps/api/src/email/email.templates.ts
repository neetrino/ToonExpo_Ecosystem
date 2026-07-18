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
