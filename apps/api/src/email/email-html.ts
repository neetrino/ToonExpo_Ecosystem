import { EMAIL_BRAND, EMAIL_LAYOUT } from "./email.brand.js";

export type TransactionalEmailContent = {
  preheader: string;
  heading: string;
  greeting: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  footnote: string;
};

/**
 * Escapes text placed into transactional HTML.
 */
export const escapeEmailHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const wordmark = (): string => {
  const { navy, teal, font } = EMAIL_BRAND;
  const { cardPadPx, wordmarkPx, kickerPx, kickerGapPx } = EMAIL_LAYOUT;

  return [
    `<tr><td style="padding:${cardPadPx}px ${cardPadPx}px 0;font-family:${font};">`,
    `<p style="margin:0;font-size:${wordmarkPx}px;line-height:1;font-weight:700;letter-spacing:0.12em;color:${navy};">TOON</p>`,
    `<p style="margin:${kickerGapPx}px 0 0;font-size:${kickerPx}px;line-height:1.2;font-weight:700;letter-spacing:0.22em;color:${teal};">REAL ESTATE EXPO</p>`,
    "</td></tr>",
  ].join("");
};

const actionBlock = (label: string, url: string): string => {
  const { teal, onBrand, faint, font } = EMAIL_BRAND;
  const { cardPadPx, buttonRadiusPx, sectionGapPx, textGapPx, buttonPx, buttonPadXPx, buttonPadYPx, metaPx } =
    EMAIL_LAYOUT;
  const safeUrl = escapeEmailHtml(url);
  const safeLabel = escapeEmailHtml(label);

  return [
    `<tr><td style="padding:${sectionGapPx}px ${cardPadPx}px 0;font-family:${font};">`,
    `<a href="${safeUrl}" style="display:inline-block;padding:${buttonPadYPx}px ${buttonPadXPx}px;border-radius:${buttonRadiusPx}px;background:${teal};color:${onBrand};font-size:${buttonPx}px;font-weight:700;letter-spacing:0.04em;text-decoration:none;">${safeLabel}</a>`,
    "</td></tr>",
    `<tr><td style="padding:${textGapPx}px ${cardPadPx}px 0;font-family:${font};font-size:${metaPx}px;line-height:1.5;color:${faint};">`,
    `Or copy this link:<br /><a href="${safeUrl}" style="color:${teal};word-break:break-all;">${safeUrl}</a>`,
    "</td></tr>",
  ].join("");
};

const cardShell = (content: TransactionalEmailContent): string => {
  const { card, border, navy, muted, faint, font } = EMAIL_BRAND;
  const {
    cardWidthPx,
    radiusPx,
    cardPadPx,
    accentBarPx,
    sectionGapPx,
    textGapPx,
    copyGapPx,
    headingPx,
    bodyPx,
    metaPx,
    footerPadTopPx,
  } = EMAIL_LAYOUT;
  const heading = escapeEmailHtml(content.heading);
  const greeting = escapeEmailHtml(content.greeting);
  const body = escapeEmailHtml(content.body);
  const footnote = escapeEmailHtml(content.footnote);

  return [
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${cardWidthPx}px;background:${card};border:1px solid ${border};border-radius:${radiusPx}px;">`,
    `<tr><td style="height:${accentBarPx}px;background:${EMAIL_BRAND.teal};font-size:0;line-height:0;">&nbsp;</td></tr>`,
    wordmark(),
    `<tr><td style="padding:${sectionGapPx}px ${cardPadPx}px 0;font-family:${font};">`,
    `<h1 style="margin:0;font-size:${headingPx}px;line-height:1.3;font-weight:700;color:${navy};">${heading}</h1>`,
    "</td></tr>",
    `<tr><td style="padding:${textGapPx}px ${cardPadPx}px 0;font-family:${font};font-size:${bodyPx}px;line-height:1.6;color:${muted};">`,
    `<p style="margin:0 0 ${copyGapPx}px;color:${EMAIL_BRAND.ink};">${greeting}</p>`,
    `<p style="margin:0;">${body}</p>`,
    "</td></tr>",
    actionBlock(content.actionLabel, content.actionUrl),
    `<tr><td style="padding:${sectionGapPx}px ${cardPadPx}px ${cardPadPx}px;font-family:${font};">`,
    `<p style="margin:0;padding-top:${footerPadTopPx}px;border-top:1px solid ${border};font-size:${metaPx}px;line-height:1.5;color:${faint};">${footnote}</p>`,
    "</td></tr>",
    "</table>",
  ].join("");
};

/**
 * Branded HTML document for a single-action account email.
 */
export const buildTransactionalEmailHtml = (content: TransactionalEmailContent): string => {
  const { canvas, font } = EMAIL_BRAND;
  const { outerPadPx } = EMAIL_LAYOUT;
  const preheader = escapeEmailHtml(content.preheader);

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeEmailHtml(content.heading)}</title>`,
    "</head>",
    `<body style="margin:0;padding:0;background:${canvas};">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${canvas};">`,
    `<tr><td align="center" style="padding:${outerPadPx}px ${EMAIL_LAYOUT.gutterPx}px;font-family:${font};">`,
    cardShell(content),
    "</td></tr>",
    "</table>",
    "</body>",
    "</html>",
  ].join("");
};
