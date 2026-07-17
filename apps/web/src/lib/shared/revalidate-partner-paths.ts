export type PartnerPathParams = {
  partnerId?: string;
  partnerSlug?: string;
};

/** No-op: browser mutations should call `router.refresh()` after success. */
export function revalidatePartnerPaths(_params: PartnerPathParams): void {
  void _params;
}
