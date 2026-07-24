import type { CrmDealListItem } from '@toonexpo/contracts';

/**
 * Filters CRM board deals by contact name / phone / email (case-insensitive).
 */
export const filterCrmDealsBySearch = (
  deals: readonly CrmDealListItem[],
  search: string,
): CrmDealListItem[] => {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return [...deals];
  }
  return deals.filter((deal) => {
    const name = deal.buyer.name?.toLowerCase() ?? '';
    const phone = deal.buyer.phone?.toLowerCase() ?? '';
    const email = deal.buyer.email?.toLowerCase() ?? '';
    const company = deal.companyName?.toLowerCase() ?? '';
    const project = deal.projectName?.toLowerCase() ?? '';
    return (
      name.includes(needle) ||
      phone.includes(needle) ||
      email.includes(needle) ||
      company.includes(needle) ||
      project.includes(needle)
    );
  });
};
