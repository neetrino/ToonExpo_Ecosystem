import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../../../.env") });

const { createPrismaClient, PublicationStatus } = await import("../dist/index.js");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const prisma = createPrismaClient({ connectionString });

const FINANCE_KEYS = [
  "partnerBank",
  "parkingPrice",
  "paymentTypes",
  "installmentTerms",
  "mortgageTerms",
  "specialTerms",
  "specialTermsAvailable",
  "incomeTaxRefund",
  "subsidizedPrograms",
];

const hasValue = (value) => {
  if (value == null || value === "") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value).some((v) => typeof v === "string" && v.trim().length > 0);
  }
  return false;
};

const toLocaleText = (value) => {
  if (typeof value === "string") {
    const text = value.trim();
    return { hy: text, ru: text, en: text };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      hy: typeof value.hy === "string" ? value.hy.trim() : "",
      ru: typeof value.ru === "string" ? value.ru.trim() : "",
      en: typeof value.en === "string" ? value.en.trim() : "",
    };
  }
  return { hy: "", ru: "", en: "" };
};

const extractFinance = (amenities) => {
  if (!amenities || typeof amenities !== "object" || Array.isArray(amenities)) {
    return null;
  }
  const details =
    "details" in amenities && amenities.details && typeof amenities.details === "object"
      ? amenities.details
      : amenities;
  const finance = {};
  for (const key of FINANCE_KEYS) {
    if (key in details && hasValue(details[key])) {
      finance[key] = toLocaleText(details[key]);
    }
  }
  return Object.keys(finance).length > 0 ? finance : null;
};

const partnerBankSearchText = (localeText) =>
  [localeText?.en, localeText?.hy, localeText?.ru]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .toLowerCase();

/**
 * Maps free-text partnerBank labels onto PartnerCompany bank rows.
 */
const matchBank = (banks, partnerBankLocale) => {
  const haystack = partnerBankSearchText(partnerBankLocale);
  if (!haystack) return null;

  const rules = [
    { re: /ardshin|արդշին|ардшин/, nameIncludes: "ardshin" },
    { re: /ameria|ամերիա|америа/, nameIncludes: "ameria" },
    { re: /ineco|ինեկո|инеко/, nameIncludes: "ineco" },
    { re: /acba|ակբա|акба/, nameIncludes: "acba" },
    { re: /evoca|էվոկա|эвока/, nameIncludes: "evoca" },
  ];

  for (const rule of rules) {
    if (!rule.re.test(haystack)) continue;
    const matches = banks.filter((bank) =>
      bank.name.toLowerCase().includes(rule.nameIncludes),
    );
    if (matches.length === 0) continue;
    // Prefer seed_* ids when duplicates exist.
    matches.sort((a, b) => {
      const aSeed = a.id.startsWith("seed_") ? 0 : 1;
      const bSeed = b.id.startsWith("seed_") ? 0 : 1;
      if (aSeed !== bSeed) return aSeed - bSeed;
      return a.name.localeCompare(b.name);
    });
    return matches[0];
  }

  return (
    banks.find((bank) => haystack.includes(bank.name.toLowerCase())) ?? null
  );
};

const financeFingerprint = (bankId, finance) =>
  createHash("sha256")
    .update(JSON.stringify({ bankId, finance }))
    .digest("hex");

const projects = await prisma.project.findMany({
  select: { id: true, name: true, slug: true, amenities: true },
});

const banks = await prisma.partnerCompany.findMany({
  where: { type: "bank" },
  select: { id: true, name: true, slug: true },
});

const admin = await prisma.user.findFirst({
  where: { accountType: "platform_admin" },
  select: { id: true },
});
if (!admin) {
  throw new Error("No platform_admin user found to own seeded templates");
}

const uniqueOffers = new Map();

for (const project of projects) {
  const finance = extractFinance(project.amenities);
  if (!finance) continue;
  const bank = matchBank(banks, finance.partnerBank);
  if (!bank) {
    console.warn(
      `SKIP unmatched bank for project ${project.slug}:`,
      finance.partnerBank,
    );
    continue;
  }
  const fingerprint = financeFingerprint(bank.id, finance);
  if (uniqueOffers.has(fingerprint)) {
    uniqueOffers.get(fingerprint).projects.push(project.slug);
    continue;
  }
  uniqueOffers.set(fingerprint, { bank, finance, projects: [project.slug] });
}

const existing = await prisma.bankPartnerOfferTemplate.findMany({
  select: { id: true, partnerCompanyId: true, fields: true, name: true },
});

const existingFingerprints = new Set(
  existing.map((row) => financeFingerprint(row.partnerCompanyId, row.fields)),
);

let created = 0;
let skipped = 0;
let sortOrder = 0;

for (const [fingerprint, offer] of uniqueOffers) {
  if (existingFingerprints.has(fingerprint)) {
    skipped += 1;
    console.log(`EXISTS ${offer.bank.name} (${offer.projects.length} projects)`);
    continue;
  }

  const name =
    offer.projects.length > 3
      ? `${offer.bank.name} — standard finance offer`
      : `${offer.bank.name} — ${offer.projects[0]}`;

  await prisma.bankPartnerOfferTemplate.create({
    data: {
      partnerCompanyId: offer.bank.id,
      name,
      fields: offer.finance,
      publicationStatus: PublicationStatus.published,
      sortOrder,
      createdByUserId: admin.id,
    },
  });
  sortOrder += 1;
  created += 1;
  console.log(
    `CREATED "${name}" ← ${offer.projects.length} project(s)`,
  );
}

console.log(JSON.stringify({ created, skipped, unique: uniqueOffers.size }, null, 2));
await prisma.$disconnect();
