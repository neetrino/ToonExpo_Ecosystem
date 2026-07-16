import type { PublicBooth } from './venue-queries';

/** Case-insensitive booth search across code, label, company, partner, project, note. */
export function boothMatchesQuery(booth: PublicBooth, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [
    booth.code,
    booth.label,
    booth.company?.name,
    booth.partner?.name,
    booth.project?.name,
    booth.note,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}
