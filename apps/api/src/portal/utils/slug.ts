import { randomBytes } from "node:crypto";

import { PORTAL_SLUG_MAX_LENGTH } from "../portal.constants.js";

const SLUG_SUFFIX_BYTES = 3;

const APARTMENT_UNIT_SLUG_MAX_LENGTH = 24;

const trimEdgeDashes = (value: string): string => {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === "-") {
    start += 1;
  }
  while (end > start && value[end - 1] === "-") {
    end -= 1;
  }
  return value.slice(start, end);
};

/**
 * URL-safe slug base with no uniqueness suffix. Empty input becomes `fallback`.
 */
export const normalizePortalSlug = (value: string, fallback: string): string => {
  const base = trimEdgeDashes(
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
  ).slice(0, PORTAL_SLUG_MAX_LENGTH);

  return base.length > 0 ? base : fallback;
};

/**
 * Apartment slug base: `{project}-unit-{number}` without a random suffix.
 */
export const buildApartmentSlugBase = (projectSlug: string, number: string): string => {
  const unit = normalizePortalSlug(number, "apt").slice(0, APARTMENT_UNIT_SLUG_MAX_LENGTH);
  return `${projectSlug}-unit-${unit}`.slice(0, PORTAL_SLUG_MAX_LENGTH);
};

/**
 * Builds a URL-safe slug from a display name with a short random suffix.
 */
export const buildProjectSlug = (name: string): string => {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PORTAL_SLUG_MAX_LENGTH - 8);

  const suffix = randomBytes(SLUG_SUFFIX_BYTES).toString("hex");
  const slug = `${base || "project"}-${suffix}`;
  return slug.slice(0, PORTAL_SLUG_MAX_LENGTH);
};

/**
 * Builds a globally unique apartment slug from project slug + unit number.
 */
export const buildApartmentSlug = (projectSlug: string, number: string): string => {
  const unit = number
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  const suffix = randomBytes(SLUG_SUFFIX_BYTES).toString("hex");
  const slug = `${projectSlug}-unit-${unit || "apt"}-${suffix}`;
  return slug.slice(0, PORTAL_SLUG_MAX_LENGTH);
};
