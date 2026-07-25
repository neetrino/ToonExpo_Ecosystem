# Colocated Types Audit

**Date:** 2026-07-25
**Scope:** `apps/web` + `apps/api`
**Criterion:** `type` / `interface` defined in the same file as a React component (`.tsx`), Nest runtime unit (service/guard/decorator/...), mapper/util/helper, or related `.ts` module - i.e. **not** extracted to a dedicated `*.types.ts` / `*.dto.ts` / `types/` file.

## Summary

| Area                                                       |   Files |
| ---------------------------------------------------------- | ------: |
| Web — `.tsx` with colocated named types                    |     375 |
| Web — `.tsx` with inline props only (no named type)        |       9 |
| Web — `.ts` modules with colocated types (api/hooks/utils) |      53 |
| API — Nest runtime units with top-level colocated types    |      29 |
| API — Nest runtime units with inline method types only     |      15 |
| API — mappers / utils / helpers / other non-DTO modules    |      40 |
| **Total**                                                  | **521** |

### Out of scope (by design)

- Dedicated type modules: `*.types.ts`, `*-types.ts`, `*.type.ts`, `types/*.ts`
- Nest DTOs: `*.dto.ts`
- Zod schema inferred types in `*.schema.ts` (schema-owned)
- Spec files: `*.spec.ts`
- `packages/contracts` (shared contract package - types are the product)

### Pattern notes

1. **Frontend (most common):** `type XProps = { ... }` at the top of the same `.tsx` as the component (project convention).
2. **Inline props:** `({ children }: { children: ReactNode })` without a named alias.
3. **Backend named:** local `type` next to `@Injectable` / guard / decorator / mapper instead of a sibling `*.types.ts`.
4. **Backend inline:** complex object shapes in method params/returns with no top-level alias (section 4b).

---

## 1. Web - React components / pages (`.tsx`) with colocated named types

**Count:** 375

| File                                                                                                          | Local types                                                                                      |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/web/src/app/[locale]/admin/analytics/page.tsx`                                                          | AdminAnalyticsRouteProps                                                                         |
| `apps/web/src/app/[locale]/admin/bank-offers/page.tsx`                                                        | AdminBankOffersPageProps                                                                         |
| `apps/web/src/app/[locale]/admin/checkin/page.tsx`                                                            | AdminCheckinPageProps                                                                            |
| `apps/web/src/app/[locale]/admin/companies/[id]/catalog/apartments/[apartmentId]/page.tsx`                    | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/companies/[id]/catalog/projects/[projectId]/page.tsx`                        | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/companies/[id]/catalog/projects/[projectId]/visual-maps/[canvasId]/page.tsx` | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/companies/[id]/catalog/projects/new/page.tsx`                                | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/companies/[id]/catalog/projects/page.tsx`                                    | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/companies/[id]/page.tsx`                                                     | AdminCompanyDetailPageProps                                                                      |
| `apps/web/src/app/[locale]/admin/companies/new/page.tsx`                                                      | AdminNewCompanyPageProps                                                                         |
| `apps/web/src/app/[locale]/admin/companies/page.tsx`                                                          | AdminCompaniesPageProps                                                                          |
| `apps/web/src/app/[locale]/admin/crm/page.tsx`                                                                | AdminCrmRouteProps                                                                               |
| `apps/web/src/app/[locale]/admin/events/[id]/page.tsx`                                                        | AdminEventDetailRouteProps                                                                       |
| `apps/web/src/app/[locale]/admin/events/new/page.tsx`                                                         | AdminNewEventPageProps                                                                           |
| `apps/web/src/app/[locale]/admin/events/page.tsx`                                                             | AdminEventsPageProps                                                                             |
| `apps/web/src/app/[locale]/admin/integrations/bos/[id]/page.tsx`                                              | AdminBosProvisioningDetailRouteProps                                                             |
| `apps/web/src/app/[locale]/admin/integrations/bos/page.tsx`                                                   | AdminBosProvisioningPageProps                                                                    |
| `apps/web/src/app/[locale]/admin/layout.tsx`                                                                  | AdminLayoutProps                                                                                 |
| `apps/web/src/app/[locale]/admin/page.tsx`                                                                    | AdminIndexPageProps                                                                              |
| `apps/web/src/app/[locale]/admin/partners/[partnerId]/page.tsx`                                               | AdminPartnerDetailRouteProps                                                                     |
| `apps/web/src/app/[locale]/admin/partners/page.tsx`                                                           | AdminPartnersPageProps                                                                           |
| `apps/web/src/app/[locale]/admin/projects/[projectId]/page.tsx`                                               | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/[projectId]/visual-maps/[canvasId]/page.tsx`                        | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/apartments/[apartmentId]/page.tsx`                                  | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/apartments/page.tsx`                                                | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/buildings/page.tsx`                                                 | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/floors/page.tsx`                                                    | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/new/page.tsx`                                                       | PageProps                                                                                        |
| `apps/web/src/app/[locale]/admin/projects/page.tsx`                                                           | AdminProjectsPageProps                                                                           |
| `apps/web/src/app/[locale]/admin/readiness/[assessmentId]/page.tsx`                                           | AdminReadinessDetailPageProps                                                                    |
| `apps/web/src/app/[locale]/admin/readiness/categories/page.tsx`                                               | AdminReadinessCategoriesPageProps                                                                |
| `apps/web/src/app/[locale]/admin/readiness/page.tsx`                                                          | AdminReadinessPageProps                                                                          |
| `apps/web/src/app/[locale]/admin/service-providers/page.tsx`                                                  | AdminServiceProvidersPageProps                                                                   |
| `apps/web/src/app/[locale]/admin/settings/layout.tsx`                                                         | AdminSettingsLayoutProps                                                                         |
| `apps/web/src/app/[locale]/admin/settings/page.tsx`                                                           | AdminSettingsRouteProps                                                                          |
| `apps/web/src/app/[locale]/admin/settings/password/page.tsx`                                                  | AdminSettingsPasswordRedirectPageProps                                                           |
| `apps/web/src/app/[locale]/apartments/[id]/page.tsx`                                                          | ApartmentPageProps                                                                               |
| `apps/web/src/app/[locale]/apartments/page.tsx`                                                               | ApartmentsIndexPageProps                                                                         |
| `apps/web/src/app/[locale]/auth/forgot-password/page.tsx`                                                     | ForgotPasswordPageProps                                                                          |
| `apps/web/src/app/[locale]/auth/login/page.tsx`                                                               | LoginPageProps                                                                                   |
| `apps/web/src/app/[locale]/auth/register/page.tsx`                                                            | RegisterPageProps                                                                                |
| `apps/web/src/app/[locale]/auth/set-password/page.tsx`                                                        | SetPasswordPageProps                                                                             |
| `apps/web/src/app/[locale]/builder/analytics/page.tsx`                                                        | BuilderAnalyticsRouteProps                                                                       |
| `apps/web/src/app/[locale]/builder/apartments/[id]/page.tsx`                                                  | BuilderApartmentPageProps                                                                        |
| `apps/web/src/app/[locale]/builder/company/page.tsx`                                                          | CompanyPageProps                                                                                 |
| `apps/web/src/app/[locale]/builder/crm/deals/[id]/page.tsx`                                                   | BuilderCrmDealPageProps                                                                          |
| `apps/web/src/app/[locale]/builder/crm/page.tsx`                                                              | BuilderCrmPageProps                                                                              |
| `apps/web/src/app/[locale]/builder/layout.tsx`                                                                | BuilderLayoutProps                                                                               |
| `apps/web/src/app/[locale]/builder/page.tsx`                                                                  | BuilderIndexPageProps                                                                            |
| `apps/web/src/app/[locale]/builder/projects/[id]/page.tsx`                                                    | BuilderProjectDetailPageProps                                                                    |
| `apps/web/src/app/[locale]/builder/projects/[id]/visual-maps/[canvasId]/page.tsx`                             | BuilderVisualMapEditorPageProps                                                                  |
| `apps/web/src/app/[locale]/builder/projects/new/page.tsx`                                                     | BuilderNewProjectPageProps                                                                       |
| `apps/web/src/app/[locale]/builder/projects/page.tsx`                                                         | BuilderProjectsPageProps                                                                         |
| `apps/web/src/app/[locale]/builder/readiness/page.tsx`                                                        | BuilderReadinessRouteProps                                                                       |
| `apps/web/src/app/[locale]/builder/scanner/page.tsx`                                                          | BuilderScannerPageProps                                                                          |
| `apps/web/src/app/[locale]/builder/settings/page.tsx`                                                         | BuilderSettingsPageProps                                                                         |
| `apps/web/src/app/[locale]/builder/team/page.tsx`                                                             | BuilderTeamPageProps                                                                             |
| `apps/web/src/app/[locale]/builders/[id]/page.tsx`                                                            | BuilderDetailPageProps                                                                           |
| `apps/web/src/app/[locale]/builders/page.tsx`                                                                 | BuildersPageProps                                                                                |
| `apps/web/src/app/[locale]/checkin/layout.tsx`                                                                | CheckinLayoutProps                                                                               |
| `apps/web/src/app/[locale]/checkin/page.tsx`                                                                  | CheckinRoutePageProps                                                                            |
| `apps/web/src/app/[locale]/dashboard/layout.tsx`                                                              | DashboardLayoutProps                                                                             |
| `apps/web/src/app/[locale]/dashboard/page.tsx`                                                                | DashboardPageProps                                                                               |
| `apps/web/src/app/[locale]/developments/page.tsx`                                                             | DevelopmentsPageProps                                                                            |
| `apps/web/src/app/[locale]/expo/page.tsx`                                                                     | ExpoPageProps                                                                                    |
| `apps/web/src/app/[locale]/favorites/layout.tsx`                                                              | FavoritesLayoutProps                                                                             |
| `apps/web/src/app/[locale]/favorites/page.tsx`                                                                | FavoritesPageProps                                                                               |
| `apps/web/src/app/[locale]/layout.tsx`                                                                        | LocaleLayoutProps                                                                                |
| `apps/web/src/app/[locale]/mortgage/page.tsx`                                                                 | MortgagePageProps                                                                                |
| `apps/web/src/app/[locale]/page.tsx`                                                                          | HomePageProps                                                                                    |
| `apps/web/src/app/[locale]/partner/bank-offers/page.tsx`                                                      | PartnerBankOffersRouteProps                                                                      |
| `apps/web/src/app/[locale]/partner/layout.tsx`                                                                | PartnerLayoutProps                                                                               |
| `apps/web/src/app/[locale]/partner/offers/page.tsx`                                                           | PartnerOffersRouteProps                                                                          |
| `apps/web/src/app/[locale]/partner/page.tsx`                                                                  | PartnerPageProps                                                                                 |
| `apps/web/src/app/[locale]/partner/settings/page.tsx`                                                         | PartnerSettingsPageProps                                                                         |
| `apps/web/src/app/[locale]/partners/[slug]/page.tsx`                                                          | PartnerDetailPageProps                                                                           |
| `apps/web/src/app/[locale]/partners/page.tsx`                                                                 | PartnersPageProps                                                                                |
| `apps/web/src/app/[locale]/projects/[id]/buildings/[buildingId]/floors/[floorId]/page.tsx`                    | FloorPageProps                                                                                   |
| `apps/web/src/app/[locale]/projects/[id]/buildings/[buildingId]/page.tsx`                                     | BuildingPageProps                                                                                |
| `apps/web/src/app/[locale]/projects/[id]/page.tsx`                                                            | ProjectPageProps                                                                                 |
| `apps/web/src/app/[locale]/projects/page.tsx`                                                                 | ProjectsPageProps                                                                                |
| `apps/web/src/app/[locale]/qr/[token]/page.tsx`                                                               | QrLandingPageProps                                                                               |
| `apps/web/src/app/[locale]/qr/page.tsx`                                                                       | MyQrPageProps                                                                                    |
| `apps/web/src/app/[locale]/requests/layout.tsx`                                                               | RequestsLayoutProps                                                                              |
| `apps/web/src/app/[locale]/requests/page.tsx`                                                                 | RequestsPageProps                                                                                |
| `apps/web/src/app/[locale]/settings/layout.tsx`                                                               | SettingsLayoutProps                                                                              |
| `apps/web/src/app/[locale]/settings/page.tsx`                                                                 | AccountSettingsPageProps                                                                         |
| `apps/web/src/app/[locale]/settings/password/page.tsx`                                                        | SettingsPasswordRedirectPageProps                                                                |
| `apps/web/src/app/[locale]/template.tsx`                                                                      | LocaleTemplateProps                                                                              |
| `apps/web/src/app/global-error.tsx`                                                                           | GlobalErrorProps                                                                                 |
| `apps/web/src/app/layout.tsx`                                                                                 | RootLayoutProps                                                                                  |
| `apps/web/src/features/admin/components/admin-apartment-card.tsx`                                             | AdminApartmentCardProps                                                                          |
| `apps/web/src/features/admin/components/admin-apartments-table.tsx`                                           | AdminApartmentsTableProps                                                                        |
| `apps/web/src/features/admin/components/admin-building-card.tsx`                                              | AdminBuildingCardProps                                                                           |
| `apps/web/src/features/admin/components/admin-building-floor-plans-form.tsx`                                  | AdminBuildingFloorPlansFormProps, PlanSlotDraft                                                  |
| `apps/web/src/features/admin/components/admin-building-inventory-glance.tsx`                                  | AdminBuildingInventoryGlanceProps, AvailabilityStatProps, FloorSalesBarProps                     |
| `apps/web/src/features/admin/components/admin-building-inventory-sheet.tsx`                                   | AdminBuildingInventorySheetProps, FloorSheetSnapshot                                             |
| `apps/web/src/features/admin/components/admin-buildings-table.tsx`                                            | AdminBuildingsTableProps                                                                         |
| `apps/web/src/features/admin/components/admin-company-catalog-shell.tsx`                                      | AdminCompanyCatalogShellProps                                                                    |
| `apps/web/src/features/admin/components/admin-create-apartment-sheet.tsx`                                     | AdminCreateApartmentSheetProps                                                                   |
| `apps/web/src/features/admin/components/admin-create-building-sheet.tsx`                                      | AdminCreateBuildingSheetProps                                                                    |
| `apps/web/src/features/admin/components/admin-create-floor-sheet.tsx`                                         | AdminCreateFloorSheetProps                                                                       |
| `apps/web/src/features/admin/components/admin-crm-new-deal-panel.tsx`                                         | AdminCreateDealFormValues, CompanyOption, AdminCrmNewDealPanelProps                              |
| `apps/web/src/features/admin/components/admin-floor-add-apartments-sheet.tsx`                                 | AdminFloorAddApartmentsSheetProps                                                                |
| `apps/web/src/features/admin/components/admin-floor-apartments-sheet.tsx`                                     | AdminFloorApartmentsSheetProps                                                                   |
| `apps/web/src/features/admin/components/admin-floor-card.tsx`                                                 | AdminFloorCardProps                                                                              |
| `apps/web/src/features/admin/components/admin-floors-table.tsx`                                               | AdminFloorsTableProps                                                                            |
| `apps/web/src/features/admin/components/admin-inventory-card.tsx`                                             | AdminInventoryPublicationBadgeProps, AdminInventoryCardStatProps, AdminInventoryCardMetaRowProps |
| `apps/web/src/features/admin/components/admin-inventory-list-shell.tsx`                                       | AdminInventoryListShellProps                                                                     |
| `apps/web/src/features/admin/components/admin-nav.tsx`                                                        | NavItem                                                                                          |
| `apps/web/src/features/admin/components/admin-partner-detail-form.tsx`                                        | AdminPartnerDetailFormProps                                                                      |
| `apps/web/src/features/admin/components/admin-partner-detail-page.tsx`                                        | AdminPartnerDetailPageProps                                                                      |
| `apps/web/src/features/admin/components/admin-project-card.tsx`                                               | AdminProjectCardProps                                                                            |
| `apps/web/src/features/admin/components/admin-project-scope-shell.tsx`                                        | AdminProjectScopeShellProps                                                                      |
| `apps/web/src/features/admin/components/admin-projects-table.tsx`                                             | AdminProjectsTableProps                                                                          |
| `apps/web/src/features/admin/components/admin-settings-page.tsx`                                              | AdminSettingsPageProps                                                                           |
| `apps/web/src/features/admin/components/bank-offer-form.tsx`                                                  | BankPartnerOption, BankOfferFormProps                                                            |
| `apps/web/src/features/admin/components/bank-offers-collection.tsx`                                           | BankOffersCollectionProps                                                                        |
| `apps/web/src/features/admin/components/bos-provisioning-detail-page.tsx`                                     | BosProvisioningDetailPageProps                                                                   |
| `apps/web/src/features/admin/components/bos-provisioning-filters.tsx`                                         | BosProvisioningFiltersProps                                                                      |
| `apps/web/src/features/admin/components/bos-provisioning-status-badge.tsx`                                    | BosProvisioningStatusBadgeProps                                                                  |
| `apps/web/src/features/admin/components/bos-provisioning-table.tsx`                                           | BosProvisioningTableProps                                                                        |
| `apps/web/src/features/admin/components/companies-table.tsx`                                                  | CompaniesTableProps                                                                              |
| `apps/web/src/features/admin/components/company-detail-page.tsx`                                              | CompanyDetailPageProps                                                                           |
| `apps/web/src/features/admin/components/company-detail-sheet.tsx`                                             | CompanyDetailSheetProps                                                                          |
| `apps/web/src/features/admin/components/company-status-badge.tsx`                                             | CompanyStatusBadgeProps                                                                          |
| `apps/web/src/features/admin/components/create-company-form.tsx`                                              | CreateCompanyFormProps                                                                           |
| `apps/web/src/features/admin/components/create-company-sheet.tsx`                                             | CreateCompanySheetProps                                                                          |
| `apps/web/src/features/admin/components/create-partner-sheet.tsx`                                             | CreatePartnerSheetProps                                                                          |
| `apps/web/src/features/admin/components/edit-company-form.tsx`                                                | EditCompanyFormProps                                                                             |
| `apps/web/src/features/admin/components/floor-plan-glance-icon.tsx`                                           | FloorPlanGlanceIconProps                                                                         |
| `apps/web/src/features/admin/components/floor-plan-lightbox.tsx`                                              | FloorPlanLightboxProps                                                                           |
| `apps/web/src/features/admin/components/floor-plan-upload-tile.tsx`                                           | FloorPlanUploadTileProps                                                                         |
| `apps/web/src/features/admin/components/partner-detail-sheet.tsx`                                             | PartnerDetailSheetProps                                                                          |
| `apps/web/src/features/admin/components/partner-filters.tsx`                                                  | PartnerFiltersProps                                                                              |
| `apps/web/src/features/admin/components/partners-table.tsx`                                                   | PartnersTableProps                                                                               |
| `apps/web/src/features/admin/components/readiness-assessment-actions.tsx`                                     | ReadinessAssessmentActionsProps                                                                  |
| `apps/web/src/features/admin/components/readiness-assessment-detail-page.tsx`                                 | ReadinessAssessmentDetailPageProps                                                               |
| `apps/web/src/features/admin/components/readiness-assessment-filters.tsx`                                     | ReadinessAssessmentFiltersProps                                                                  |
| `apps/web/src/features/admin/components/readiness-assessments-table.tsx`                                      | CompanyLookup, ReadinessAssessmentsTableProps                                                    |
| `apps/web/src/features/admin/components/readiness-category-form.tsx`                                          | ReadinessCategoryFormProps                                                                       |
| `apps/web/src/features/admin/components/readiness-category-score-row.tsx`                                     | ReadinessCategoryScoreRowProps                                                                   |
| `apps/web/src/features/admin/components/readiness-create-assessment-sheet.tsx`                                | ReadinessCreateAssessmentSheetProps                                                              |
| `apps/web/src/features/admin/components/readiness-internal-notes-section.tsx`                                 | ReadinessInternalNotesSectionProps                                                               |
| `apps/web/src/features/admin/components/readiness-recommendations-section.tsx`                                | ReadinessRecommendationsSectionProps                                                             |
| `apps/web/src/features/admin/components/readiness-required-actions-section.tsx`                               | ReadinessRequiredActionsSectionProps                                                             |
| `apps/web/src/features/admin/components/resend-invite-button.tsx`                                             | ResendInviteButtonProps                                                                          |
| `apps/web/src/features/admin/components/service-provider-category-form.tsx`                                   | ServiceProviderCategoryFormProps                                                                 |
| `apps/web/src/features/admin/components/service-provider-form.tsx`                                            | ServiceProviderFormProps                                                                         |
| `apps/web/src/features/admin/components/service-providers-categories-section.tsx`                             | ServiceProvidersCategoriesSectionProps                                                           |
| `apps/web/src/features/admin/components/service-providers-providers-section.tsx`                              | ServiceProviderFilters, ServiceProvidersProvidersSectionProps                                    |
| `apps/web/src/features/analytics/components/analytics-bar-row.tsx`                                            | AnalyticsBarRowProps                                                                             |
| `apps/web/src/features/analytics/components/analytics-date-range-filter.tsx`                                  | AnalyticsDateRangeFilterProps                                                                    |
| `apps/web/src/features/analytics/components/analytics-entity-rank-list.tsx`                                   | AnalyticsEntityRankListProps                                                                     |
| `apps/web/src/features/analytics/components/analytics-section-card.tsx`                                       | AnalyticsSectionCardProps                                                                        |
| `apps/web/src/features/analytics/components/analytics-stat-card.tsx`                                          | AnalyticsStatCardProps                                                                           |
| `apps/web/src/features/auth/components/auth-fit-stage.tsx`                                                    | AuthFitStageProps, FitMetrics                                                                    |
| `apps/web/src/features/auth/components/auth-form-switch.tsx`                                                  | AuthFormSwitchProps                                                                              |
| `apps/web/src/features/auth/components/auth-page-shell.tsx`                                                   | AuthPageShellProps, ShellCopy, AuthFormColumnProps                                               |
| `apps/web/src/features/auth/components/login-form.tsx`                                                        | LoginFormProps                                                                                   |
| `apps/web/src/features/auth/components/logout-button.tsx`                                                     | LogoutButtonProps                                                                                |
| `apps/web/src/features/auth/components/set-password-form.tsx`                                                 | SetPasswordFormProps                                                                             |
| `apps/web/src/features/builder/catalog-scope-context.tsx`                                                     | CatalogScopeProviderProps                                                                        |
| `apps/web/src/features/builder/components/add-building-form.tsx`                                              | AddBuildingFormProps                                                                             |
| `apps/web/src/features/builder/components/add-floor-form.tsx`                                                 | AddFloorFormProps                                                                                |
| `apps/web/src/features/builder/components/apartment-detail-page.tsx`                                          | ApartmentDetailPageProps                                                                         |
| `apps/web/src/features/builder/components/builder-analytics-page.tsx`                                         | ReadinessMetricProps                                                                             |
| `apps/web/src/features/builder/components/builder-dashboard-page.tsx`                                         | StatusCounts                                                                                     |
| `apps/web/src/features/builder/components/builder-nav.tsx`                                                    | NavItem, BuilderNavProps                                                                         |
| `apps/web/src/features/builder/components/building-accordion.tsx`                                             | BuildingAccordionProps                                                                           |
| `apps/web/src/features/builder/components/bulk-apartments-form.tsx`                                           | BulkApartmentsFormProps                                                                          |
| `apps/web/src/features/builder/components/company-profile-form.tsx`                                           | CompanyLogoFormValues, CompanyProfileFormProps                                                   |
| `apps/web/src/features/builder/components/crm-deal-activities-section.tsx`                                    | CrmDealActivitiesSectionProps                                                                    |
| `apps/web/src/features/builder/components/crm-deal-apartments-section.tsx`                                    | CrmDealApartmentsSectionProps, ApartmentOption                                                   |
| `apps/web/src/features/builder/components/crm-deal-assignee-control.tsx`                                      | CrmDealAssigneeControlProps                                                                      |
| `apps/web/src/features/builder/components/crm-deal-detail-page.tsx`                                           | CrmDealDetailPageProps                                                                           |
| `apps/web/src/features/builder/components/crm-deal-filters.tsx`                                               | CrmDealFiltersState, ProjectOption, AssigneeOption, CrmDealFiltersProps, FilterTabProps          |
| `apps/web/src/features/builder/components/crm-deal-list-item.tsx`                                             | CrmDealListItemViewProps                                                                         |
| `apps/web/src/features/builder/components/crm-deal-notes-section.tsx`                                         | CrmDealNotesSectionProps                                                                         |
| `apps/web/src/features/builder/components/crm-deal-requests-section.tsx`                                      | CrmDealRequestsSectionProps                                                                      |
| `apps/web/src/features/builder/components/crm-deal-status-control.tsx`                                        | CrmDealStatusControlProps                                                                        |
| `apps/web/src/features/builder/components/crm-new-deal-panel.tsx`                                             | ProjectOption, CrmNewDealPanelProps                                                              |
| `apps/web/src/features/builder/components/edit-apartment-form.tsx`                                            | EditApartmentFormProps                                                                           |
| `apps/web/src/features/builder/components/edit-building-media-form.tsx`                                       | EditBuildingMediaFormProps                                                                       |
| `apps/web/src/features/builder/components/edit-floor-media-form.tsx`                                          | EditFloorMediaFormProps                                                                          |
| `apps/web/src/features/builder/components/edit-project-form.tsx`                                              | EditProjectFormProps                                                                             |
| `apps/web/src/features/builder/components/floor-inventory-row.tsx`                                            | FloorInventoryRowProps                                                                           |
| `apps/web/src/features/builder/components/invite-member-form.tsx`                                             | InviteMemberFormProps                                                                            |
| `apps/web/src/features/builder/components/project-detail-page.tsx`                                            | ProjectDetailPageProps                                                                           |
| `apps/web/src/features/builder/components/project-inventory-section.tsx`                                      | ProjectInventorySectionProps                                                                     |
| `apps/web/src/features/builder/components/project-publication-actions.tsx`                                    | ProjectPublicationActionsProps                                                                   |
| `apps/web/src/features/builder/components/project-qr-section.tsx`                                             | ProjectQrSectionProps                                                                            |
| `apps/web/src/features/builder/components/projects-table.tsx`                                                 | ProjectsTableProps                                                                               |
| `apps/web/src/features/builder/components/readiness-category-card.tsx`                                        | BuilderReadinessCategoryCardProps                                                                |
| `apps/web/src/features/builder/components/readiness-help-dialog.tsx`                                          | ReadinessHelpDialogProps                                                                         |
| `apps/web/src/features/builder/components/readiness-summary-card.tsx`                                         | BuilderReadinessSummaryCardProps                                                                 |
| `apps/web/src/features/builder/components/scanner-buyer-result.tsx`                                           | ScannerBuyerResultProps                                                                          |
| `apps/web/src/features/builder/components/scanner-camera.tsx`                                                 | ScannerCameraProps                                                                               |
| `apps/web/src/features/builder/components/scanner-page.tsx`                                                   | ResolveState                                                                                     |
| `apps/web/src/features/builder/components/team-table.tsx`                                                     | TeamTableProps                                                                                   |
| `apps/web/src/features/builder/components/translation-tabs.tsx`                                               | TranslationLocale, TranslationTabsProps, IndicatorMetrics                                        |
| `apps/web/src/features/buyer/components/account/account-content-panel.tsx`                                    | AccountContentPanelProps                                                                         |
| `apps/web/src/features/buyer/components/account/account-empty-state.tsx`                                      | AccountEmptyStateProps                                                                           |
| `apps/web/src/features/buyer/components/account/account-mobile-section-title.tsx`                             | NavKey                                                                                           |
| `apps/web/src/features/buyer/components/account/account-nav.tsx`                                              | NavKey, NavItem, AccountNavProps                                                                 |
| `apps/web/src/features/buyer/components/account/account-page-header.tsx`                                      | AccountPageHeaderProps                                                                           |
| `apps/web/src/features/buyer/components/account/account-profile-banner.tsx`                                   | AccountProfileBannerProps, BannerDetailProps, EditActionsProps                                   |
| `apps/web/src/features/buyer/components/account/account-section-heading.tsx`                                  | AccountSectionHeadingProps                                                                       |
| `apps/web/src/features/buyer/components/account/account-settings-view.tsx`                                    | AccountSettingsViewProps                                                                         |
| `apps/web/src/features/buyer/components/account/account-shell.tsx`                                            | AccountShellProps                                                                                |
| `apps/web/src/features/buyer/components/account/account-stat-card.tsx`                                        | AccountStatCardProps                                                                             |
| `apps/web/src/features/buyer/components/account/account-status-badge.tsx`                                     | AccountStatusBadgeProps                                                                          |
| `apps/web/src/features/buyer/components/account/buyer-account-layout.tsx`                                     | BuyerAccountLayoutProps                                                                          |
| `apps/web/src/features/buyer/components/apartment-detail-favorite.tsx`                                        | ApartmentDetailFavoriteProps                                                                     |
| `apps/web/src/features/buyer/components/buyer-action-card.tsx`                                                | BuyerActionCardProps                                                                             |
| `apps/web/src/features/buyer/components/buyer-checkin-status.tsx`                                             | CheckInHistoryListProps                                                                          |
| `apps/web/src/features/buyer/components/buyer-qr-code.tsx`                                                    | BuyerQrCodeProps                                                                                 |
| `apps/web/src/features/buyer/components/buyer-qr-page-content.tsx`                                            | BuyerQrPageContentProps                                                                          |
| `apps/web/src/features/buyer/components/buyer-requests-list.tsx`                                              | RequestRowProps                                                                                  |
| `apps/web/src/features/buyer/components/catalog-favorites-scope.tsx`                                          | CatalogFavoritesScopeProps                                                                       |
| `apps/web/src/features/buyer/components/catalog-request-button.tsx`                                           | CatalogRequestButtonProps                                                                        |
| `apps/web/src/features/buyer/components/favorite-apartment-card.tsx`                                          | FavoriteApartmentCardProps                                                                       |
| `apps/web/src/features/buyer/components/favorite-heart-icon.tsx`                                              | FavoriteHeartIconProps                                                                           |
| `apps/web/src/features/buyer/components/favorites-status-provider.tsx`                                        | FavoritesStatusContextValue, FavoritesStatusProviderProps                                        |
| `apps/web/src/features/buyer/components/favorite-toggle-button.tsx`                                           | FavoriteToggleButtonProps                                                                        |
| `apps/web/src/features/buyer/components/project-detail-favorite.tsx`                                          | ProjectDetailFavoriteProps                                                                       |
| `apps/web/src/features/buyer/components/qr-landing-content.tsx`                                               | QrLandingContentProps, ResolveState                                                              |
| `apps/web/src/features/buyer/components/request-form-panel.tsx`                                               | RequestFormPanelProps, SuccessKind                                                               |
| `apps/web/src/features/buyer/components/scan-history-list.tsx`                                                | ScanHistoryListProps                                                                             |
| `apps/web/src/features/catalog/components/apartment-detail-criteria-panel.tsx`                                | ApartmentDetailCriteriaPanelProps                                                                |
| `apps/web/src/features/catalog/components/apartment-detail-view.tsx`                                          | ApartmentDetailViewProps                                                                         |
| `apps/web/src/features/catalog/components/apartment-inquire-card.tsx`                                         | ApartmentInquireCardProps                                                                        |
| `apps/web/src/features/catalog/components/apartment-mortgage-estimate.tsx`                                    | ApartmentMortgageEstimateProps                                                                   |
| `apps/web/src/features/catalog/components/apartment-neighborhood.tsx`                                         | NeighborhoodStat, ApartmentNeighborhoodProps                                                     |
| `apps/web/src/features/catalog/components/apartment-photo-gallery.tsx`                                        | GalleryImage, ApartmentPhotoGalleryProps                                                         |
| `apps/web/src/features/catalog/components/apartment-price-history.tsx`                                        | PriceHistoryRow, ApartmentPriceHistoryProps                                                      |
| `apps/web/src/features/catalog/components/apartment-price-label.tsx`                                          | ApartmentPriceProps                                                                              |
| `apps/web/src/features/catalog/components/apartment-price-per-area.tsx`                                       | ApartmentPricePerAreaProps                                                                       |
| `apps/web/src/features/catalog/components/builder-card.tsx`                                                   | BuilderCardProps                                                                                 |
| `apps/web/src/features/catalog/components/building-floor-lists.tsx`                                           | BuildingFloorsListProps, FloorSectionProps, FloorApartmentsListProps, Translate                  |
| `apps/web/src/features/catalog/components/buy-apartment-card.tsx`                                             | BuyApartmentCardProps                                                                            |
| `apps/web/src/features/catalog/components/buy-apartments-browse.tsx`                                          | BuyApartmentsBrowseProps                                                                         |
| `apps/web/src/features/catalog/components/buy-apartments-filters.tsx`                                         | BuyApartmentsFiltersProps, GrowingPriceInputProps                                                |
| `apps/web/src/features/catalog/components/buy-apartments-map.tsx`                                             | BuyApartmentsMapProps                                                                            |
| `apps/web/src/features/catalog/components/catalog-list-hero.tsx`                                              | CatalogListHeroProps                                                                             |
| `apps/web/src/features/catalog/components/catalog-pagination.tsx`                                             | PaginationProps                                                                                  |
| `apps/web/src/features/catalog/components/comparable-home-card.tsx`                                           | ComparableHomeCardModel, ComparableHomeCardProps                                                 |
| `apps/web/src/features/catalog/components/comparable-homes-section.tsx`                                       | ComparableHomesSectionProps                                                                      |
| `apps/web/src/features/catalog/components/development-progress-card.tsx`                                      | DevelopmentProgressCardProps                                                                     |
| `apps/web/src/features/catalog/components/featured-projects.tsx`                                              | FeaturedProjectsProps                                                                            |
| `apps/web/src/features/catalog/components/hero-search.tsx`                                                    | HeroSearchProps                                                                                  |
| `apps/web/src/features/catalog/components/hero-search-tabs.tsx`                                               | HeroSearchTab, HeroSearchTabsProps, TabIndicator                                                 |
| `apps/web/src/features/catalog/components/home-builders.tsx`                                                  | HomeBuildersProps                                                                                |
| `apps/web/src/features/catalog/components/home-developments.tsx`                                              | HomeDevelopmentsProps                                                                            |
| `apps/web/src/features/catalog/components/home-developments-map.tsx`                                          | HomeDevelopmentsMapProps                                                                         |
| `apps/web/src/features/catalog/components/home-explore.tsx`                                                   | HomeExploreProps                                                                                 |
| `apps/web/src/features/catalog/components/home-partners.tsx`                                                  | HomePartnersProps                                                                                |
| `apps/web/src/features/catalog/components/home-stats.tsx`                                                     | HomeStatsProps, StatTone, MarketStat                                                             |
| `apps/web/src/features/catalog/components/new-development-row-card.tsx`                                       | NewDevelopmentRowCardProps                                                                       |
| `apps/web/src/features/catalog/components/new-developments-view.tsx`                                          | NewDevelopmentsViewProps                                                                         |
| `apps/web/src/features/catalog/components/partner-bank-offers-section.tsx`                                    | PartnerBankOffersSectionProps                                                                    |
| `apps/web/src/features/catalog/components/partner-card.tsx`                                                   | PartnerCardProps                                                                                 |
| `apps/web/src/features/catalog/components/partner-detail-content.tsx`                                         | PartnerDetailContentProps                                                                        |
| `apps/web/src/features/catalog/components/partner-detail-hero.tsx`                                            | PartnerDetailHeroProps                                                                           |
| `apps/web/src/features/catalog/components/partner-filters-form.tsx`                                           | PartnerFiltersFormProps                                                                          |
| `apps/web/src/features/catalog/components/partners-page-hero.tsx`                                             | PartnersPageHeroProps                                                                            |
| `apps/web/src/features/catalog/components/price-overlay-scope.tsx`                                            | PriceOverlayContextValue, ProjectPricesOverlayScopeProps, ProjectPriceRangesOverlayScopeProps    |
| `apps/web/src/features/catalog/components/price-range-select.tsx`                                             | PriceRangeSelectProps                                                                            |
| `apps/web/src/features/catalog/components/project-buildings.tsx`                                              | ProjectBuildingsProps, Translate                                                                 |
| `apps/web/src/features/catalog/components/project-card.tsx`                                                   | ProjectCardProps                                                                                 |
| `apps/web/src/features/catalog/components/project-catalog-collapsible.tsx`                                    | ProjectCatalogCollapsibleProps                                                                   |
| `apps/web/src/features/catalog/components/project-catalog-details-panel.tsx`                                  | ProjectCatalogDetailsPanelProps                                                                  |
| `apps/web/src/features/catalog/components/project-catalog-links-section.tsx`                                  | ProjectCatalogLinksSectionProps                                                                  |
| `apps/web/src/features/catalog/components/project-catalog-section.tsx`                                        | ProjectCatalogSectionProps                                                                       |
| `apps/web/src/features/catalog/components/project-construction-timeline.tsx`                                  | ProjectConstructionTimelineProps                                                                 |
| `apps/web/src/features/catalog/components/project-detail-hero.tsx`                                            | ProjectDetailHeroProps                                                                           |
| `apps/web/src/features/catalog/components/project-detail-view.tsx`                                            | ProjectDetailViewProps                                                                           |
| `apps/web/src/features/catalog/components/project-filters-form.tsx`                                           | ProjectFiltersFormProps                                                                          |
| `apps/web/src/features/catalog/components/project-floor-picker.tsx`                                           | ProjectFloorPickerProps                                                                          |
| `apps/web/src/features/catalog/components/project-price-text.tsx`                                             | ProjectPriceTextProps                                                                            |
| `apps/web/src/features/catalog/components/project-reserve-cta.tsx`                                            | ProjectReserveCtaProps                                                                           |
| `apps/web/src/features/catalog/components/projects-page-hero.tsx`                                             | ProjectsPageHeroProps                                                                            |
| `apps/web/src/features/crm-board/crm-deal-pipeline.tsx`                                                       | CrmDealPipelineProps                                                                             |
| `apps/web/src/features/crm-board/crm-deal-readonly-extras.tsx`                                                | CrmDealReadonlyExtrasProps                                                                       |
| `apps/web/src/features/crm-board/crm-deal-sheet.tsx`                                                          | CrmDealSheetProps                                                                                |
| `apps/web/src/features/crm-board/crm-kanban-board.tsx`                                                        | CrmKanbanBoardProps, CrmKanbanColumnProps, CrmDraggableKanbanCardProps                           |
| `apps/web/src/features/crm-board/crm-kanban-card.tsx`                                                         | CrmKanbanCardProps                                                                               |
| `apps/web/src/features/crm-board/crm-new-column-create-button.tsx`                                            | CrmNewColumnCreateButtonProps                                                                    |
| `apps/web/src/features/crm-board/crm-search-results-badge.tsx`                                                | CrmSearchResultsBadgeProps                                                                       |
| `apps/web/src/features/exhibition/components/admin/admin-booth-assignment-row.tsx`                            | AdminBoothAssignmentRowProps                                                                     |
| `apps/web/src/features/exhibition/components/admin/admin-booth-assignments-panel.tsx`                         | AdminBoothAssignmentsPanelProps                                                                  |
| `apps/web/src/features/exhibition/components/admin/admin-booth-form.tsx`                                      | AdminBoothFormProps                                                                              |
| `apps/web/src/features/exhibition/components/admin/admin-booth-map-picker.tsx`                                | AdminBoothMapPickerProps                                                                         |
| `apps/web/src/features/exhibition/components/admin/admin-booths-section.tsx`                                  | AdminBoothsSectionProps, BoothListProps                                                          |
| `apps/web/src/features/exhibition/components/admin/admin-checkin-summary-panel.tsx`                           | AdminCheckinSummaryPanelProps, SummaryStatProps                                                  |
| `apps/web/src/features/exhibition/components/admin/admin-event-detail-page.tsx`                               | AdminEventDetailPageProps                                                                        |
| `apps/web/src/features/exhibition/components/admin/admin-event-form.tsx`                                      | AdminEventFormProps                                                                              |
| `apps/web/src/features/exhibition/components/admin/admin-events-table.tsx`                                    | AdminEventsTableProps                                                                            |
| `apps/web/src/features/exhibition/components/admin/admin-route-graph-edges-table.tsx`                         | AdminRouteGraphEdgesTableProps, NodeSelectProps                                                  |
| `apps/web/src/features/exhibition/components/admin/admin-route-graph-editor.tsx`                              | AdminRouteGraphEditorProps                                                                       |
| `apps/web/src/features/exhibition/components/admin/admin-route-graph-nodes-table.tsx`                         | AdminRouteGraphNodesTableProps                                                                   |
| `apps/web/src/features/exhibition/components/admin/admin-venue-maps-section.tsx`                              | AdminVenueMapsSectionProps, VenueMapCreateFormProps, VenueMapEditCardProps, VenueMapFieldsProps  |
| `apps/web/src/features/exhibition/components/checkin/checkin-page.tsx`                                        | ScanPhase, EventHeaderProps                                                                      |
| `apps/web/src/features/exhibition/components/checkin/checkin-recent-list.tsx`                                 | CheckinRecentListProps                                                                           |
| `apps/web/src/features/exhibition/components/checkin/checkin-result-card.tsx`                                 | CheckinResultCardProps                                                                           |
| `apps/web/src/features/exhibition/components/public/expo-booth-sheet.tsx`                                     | ExpoBoothSheetProps                                                                              |
| `apps/web/src/features/exhibition/components/public/expo-map-view.tsx`                                        | ExpoMapViewProps                                                                                 |
| `apps/web/src/features/exhibition/components/public/expo-search-results.tsx`                                  | ExpoSearchResultsProps, ExpoBoothListProps                                                       |
| `apps/web/src/features/media/components/media-upload-field.tsx`                                               | MediaUploadFieldProps, LibraryPanelProps                                                         |
| `apps/web/src/features/mortgage/components/mortgage-calculator-section.tsx`                                   | MortgageCalculatorSectionProps                                                                   |
| `apps/web/src/features/mortgage/components/mortgage-offer-card.tsx`                                           | MortgageOfferCardProps                                                                           |
| `apps/web/src/features/mortgage/components/mortgage-prequalify-cta.tsx`                                       | MortgagePrequalifyCtaProps                                                                       |
| `apps/web/src/features/mortgage/components/mortgage-results-panel.tsx`                                        | MortgageResultsPanelProps                                                                        |
| `apps/web/src/features/partner/components/partner-bank-offers-section.tsx`                                    | PartnerBankOffersPageProps, PortalBankOfferFormProps                                             |
| `apps/web/src/features/partner/components/partner-nav.tsx`                                                    | PartnerNavProps, NavItem                                                                         |
| `apps/web/src/features/partner/components/partner-profile-page.tsx`                                           | PartnerProfileFormProps                                                                          |
| `apps/web/src/features/partners/components/partner-badges.tsx`                                                | PartnerStatusBadgeProps, PublicationStatusBadgeProps, FeaturedBadgeProps                         |
| `apps/web/src/features/partners/components/partner-media-fields.tsx`                                          | PartnerMediaFieldValues, PartnerMediaFieldsProps                                                 |
| `apps/web/src/features/partners/components/partner-offers-section.tsx`                                        | PartnerOffersSectionProps, PartnerOfferFormProps                                                 |
| `apps/web/src/features/partners/components/partner-profile-fields.tsx`                                        | ProfileFormValues, PartnerProfileFieldsProps                                                     |
| `apps/web/src/features/partners/components/partner-type-label.tsx`                                            | PartnerTypeLabelProps                                                                            |
| `apps/web/src/features/readiness/components/readiness-status-badge.tsx`                                       | ReadinessStatusBadgeProps                                                                        |
| `apps/web/src/features/visual-map/components/percent-map-markers.tsx`                                         | PercentMapMarker, PercentMapMarkersProps                                                         |
| `apps/web/src/features/visual-map/components/portal-canvas-editor-page.tsx`                                   | PortalCanvasEditorPageProps, HotspotListProps                                                    |
| `apps/web/src/features/visual-map/components/portal-canvas-editor-shell.tsx`                                  | PortalCanvasEditorShellProps                                                                     |
| `apps/web/src/features/visual-map/components/portal-hotspot-form.tsx`                                         | PortalHotspotFormProps, TargetOption                                                             |
| `apps/web/src/features/visual-map/components/portal-hotspot-map-picker.tsx`                                   | PortalHotspotMapPickerProps                                                                      |
| `apps/web/src/features/visual-map/components/portal-visual-canvases-section.tsx`                              | PortalVisualCanvasesSectionProps, CreateFormProps, ContextOption, Translate                      |
| `apps/web/src/features/visual-map/components/public-visual-hotspot-sheet.tsx`                                 | PublicVisualHotspotSheetProps                                                                    |
| `apps/web/src/features/visual-map/components/public-visual-map.tsx`                                           | PublicVisualMapLinkContext, PublicVisualMapProps                                                 |
| `apps/web/src/shared/providers/query-provider.tsx`                                                            | QueryProviderProps                                                                               |
| `apps/web/src/shared/ui/add-action-label.tsx`                                                                 | AddActionLabelProps                                                                              |
| `apps/web/src/shared/ui/admin-create-sheet.tsx`                                                               | AdminCreateSheetProps                                                                            |
| `apps/web/src/shared/ui/admin-delete-modal.tsx`                                                               | AdminDeleteModalProps, Snapshot, DeleteModalPanelProps                                           |
| `apps/web/src/shared/ui/admin-list-card-grid.tsx`                                                             | AdminListCardGridProps                                                                           |
| `apps/web/src/shared/ui/admin-list-card-logo.tsx`                                                             | AdminListCardLogoShape, AdminListCardLogoSize, AdminListCardLogoProps                            |
| `apps/web/src/shared/ui/apartment-sales-status-badge.tsx`                                                     | ApartmentSalesStatusBadgeProps                                                                   |
| `apps/web/src/shared/ui/api-status.tsx`                                                                       | ApiStatusProps                                                                                   |
| `apps/web/src/shared/ui/badge.tsx`                                                                            | BadgeTone, BadgeProps                                                                            |
| `apps/web/src/shared/ui/brand-logo.tsx`                                                                       | BrandLogoProps, HouseMarkProps                                                                   |
| `apps/web/src/shared/ui/button.tsx`                                                                           | ButtonVariant, ButtonSize, ButtonProps                                                           |
| `apps/web/src/shared/ui/card.tsx`                                                                             | CardVariant, CardProps                                                                           |
| `apps/web/src/shared/ui/desktop-fluid-frame.tsx`                                                              | DesktopFluidFrameProps                                                                           |
| `apps/web/src/shared/ui/dialog.tsx`                                                                           | DialogProps                                                                                      |
| `apps/web/src/shared/ui/drawer-close-tab.tsx`                                                                 | DrawerCloseTabEdge, DrawerCloseTabProps                                                          |
| `apps/web/src/shared/ui/dropdown-portal.tsx`                                                                  | DropdownPortalProps, Align, MenuCoords                                                           |
| `apps/web/src/shared/ui/empty-state.tsx`                                                                      | EmptyStateProps                                                                                  |
| `apps/web/src/shared/ui/error-state.tsx`                                                                      | ErrorStateProps                                                                                  |
| `apps/web/src/shared/ui/form-field.tsx`                                                                       | FormFieldProps                                                                                   |
| `apps/web/src/shared/ui/icon-button.tsx`                                                                      | IconButtonProps                                                                                  |
| `apps/web/src/shared/ui/image-lightbox.tsx`                                                                   | ImageLightboxProps                                                                               |
| `apps/web/src/shared/ui/input.tsx`                                                                            | InputProps                                                                                       |
| `apps/web/src/shared/ui/listbox-select.tsx`                                                                   | ListboxOption, ListboxSelectProps                                                                |
| `apps/web/src/shared/ui/locale-switcher.tsx`                                                                  | LocaleSwitcherProps                                                                              |
| `apps/web/src/shared/ui/marketing-page-intro.tsx`                                                             | MarketingPageIntroProps                                                                          |
| `apps/web/src/shared/ui/motion/animated-counter.tsx`                                                          | AnimatedCounterFormatStyle, AnimatedCounterProps                                                 |
| `apps/web/src/shared/ui/motion/page-enter.tsx`                                                                | PageEnterProps                                                                                   |
| `apps/web/src/shared/ui/motion/reveal.tsx`                                                                    | RevealProps                                                                                      |
| `apps/web/src/shared/ui/motion/stagger-group.tsx`                                                             | StaggerGroupProps                                                                                |
| `apps/web/src/shared/ui/multi-listbox-select.tsx`                                                             | MultiListboxSelectProps                                                                          |
| `apps/web/src/shared/ui/page-header.tsx`                                                                      | PageHeaderProps                                                                                  |
| `apps/web/src/shared/ui/password-input.tsx`                                                                   | PasswordInputProps                                                                               |
| `apps/web/src/shared/ui/phone-input.tsx`                                                                      | PhoneInputProps                                                                                  |
| `apps/web/src/shared/ui/portal-shell.tsx`                                                                     | PortalShellProps                                                                                 |
| `apps/web/src/shared/ui/profile-menu.tsx`                                                                     | ProfileMenuProps                                                                                 |
| `apps/web/src/shared/ui/public-chrome.tsx`                                                                    | PublicChromeProps                                                                                |
| `apps/web/src/shared/ui/search-field.tsx`                                                                     | SearchFieldProps                                                                                 |
| `apps/web/src/shared/ui/section-header.tsx`                                                                   | SectionHeaderProps                                                                               |
| `apps/web/src/shared/ui/select.tsx`                                                                           | SelectProps, OptionElementProps                                                                  |
| `apps/web/src/shared/ui/side-sheet.tsx`                                                                       | SideSheetSize, SideSheetProps, SideSheetPanelProps                                               |
| `apps/web/src/shared/ui/site-header.tsx`                                                                      | SiteHeaderProps                                                                                  |
| `apps/web/src/shared/ui/site-header-mobile-nav.tsx`                                                           | NavHref, SiteHeaderMobileNavProps                                                                |
| `apps/web/src/shared/ui/skeleton.tsx`                                                                         | SkeletonProps, SkeletonTextProps                                                                 |
| `apps/web/src/shared/ui/textarea.tsx`                                                                         | TextareaProps                                                                                    |
| `apps/web/src/shared/ui/view-mode-toggle.tsx`                                                                 | ViewModeToggleProps                                                                              |

## 2. Web - `.tsx` with inline props only (no top-level `type`/`interface`)

**Count:** 9

| File                                                                           | Pattern                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------ |
| `apps/web/src/features/admin/components/admin-crm-board-page.tsx`              | Inline object props in component signature |
| `apps/web/src/features/admin/components/bos-provisioning-list-page.tsx`        | Inline object props in component signature |
| `apps/web/src/features/admin/components/partners-list-page.tsx`                | Inline object props in component signature |
| `apps/web/src/features/admin/components/readiness-assessments-list-page.tsx`   | Inline object props in component signature |
| `apps/web/src/features/admin/components/service-providers-page.tsx`            | Inline object props in component signature |
| `apps/web/src/features/builder/components/crm-deals-list-page.tsx`             | Inline object props in component signature |
| `apps/web/src/features/builder/components/readiness-page.tsx`                  | Inline object props in component signature |
| `apps/web/src/features/buyer/components/account/account-page-enter.tsx`        | Inline object props in component signature |
| `apps/web/src/features/exhibition/components/admin/admin-events-list-page.tsx` | Inline object props in component signature |

## 3. Web - `.ts` modules with colocated types (hooks / api / utils / providers)

**Count:** 53

| File                                                                    | Local types                                                                                   |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/web/src/features/admin/api/admin-analytics-api.ts`                | AdminAnalyticsOverviewParams                                                                  |
| `apps/web/src/features/admin/api/admin-bank-offers-api.ts`              | ListAdminBankOffersParams                                                                     |
| `apps/web/src/features/admin/api/admin-bos-provisioning-api.ts`         | ListAdminBosProvisioningParams                                                                |
| `apps/web/src/features/admin/api/admin-companies-api.ts`                | AdminRequestOptions, ListAdminProjectsParams                                                  |
| `apps/web/src/features/admin/api/admin-crm-api.ts`                      | ListAdminCrmDealsParams                                                                       |
| `apps/web/src/features/admin/api/admin-partners-api.ts`                 | ListAdminPartnersParams                                                                       |
| `apps/web/src/features/admin/api/admin-readiness-api.ts`                | ListReadinessAssessmentsParams                                                                |
| `apps/web/src/features/admin/api/admin-service-providers-api.ts`        | ListAdminServiceProvidersParams                                                               |
| `apps/web/src/features/analytics/constants.ts`                          | AnalyticsRangePreset                                                                          |
| `apps/web/src/features/analytics/utils/resolve-analytics-date-range.ts` | ResolvedAnalyticsDateRange                                                                    |
| `apps/web/src/features/auth/utils/get-account-settings-href.ts`         | AccountSettingsHref                                                                           |
| `apps/web/src/features/auth/utils/map-auth-error.ts`                    | AuthErrorCode                                                                                 |
| `apps/web/src/features/builder/api/portal-analytics-api.ts`             | PortalAnalyticsOverviewParams                                                                 |
| `apps/web/src/features/builder/api/portal-crm-api.ts`                   | ListCrmDealsParams                                                                            |
| `apps/web/src/features/builder/api/portal-request.ts`                   | PortalRequestOptions                                                                          |
| `apps/web/src/features/builder/catalog-scope.ts`                        | CatalogScope, CatalogApartmentDetailHrefOptions                                               |
| `apps/web/src/features/builder/utils/crm-dashboard-stats.ts`            | CrmDashboardStats                                                                             |
| `apps/web/src/features/buyer/hooks/use-favorites.ts`                    | ToggleFavoriteInput                                                                           |
| `apps/web/src/features/buyer/utils/favorite-target-key.ts`              | FavoriteTarget                                                                                |
| `apps/web/src/features/catalog/api/catalog-api.ts`                      | CatalogRequestOptions                                                                         |
| `apps/web/src/features/catalog/api/partners-api.ts`                     | ListPublicPartnersQuery, PublicPartnersRequestOptions                                         |
| `apps/web/src/features/catalog/utils/apartment-features.ts`             | ApartmentFeatureExtras                                                                        |
| `apps/web/src/features/catalog/utils/build-apartment-detail-rows.ts`    | ApartmentDetailCriterionId, ApartmentDetailRow, DetailLabels, BuildApartmentDetailRowsOptions |
| `apps/web/src/features/catalog/utils/build-project-catalog-rows.ts`     | ProjectCatalogCriterionId, ProjectCatalogRow, DetailLabels, BuildProjectCatalogRowsOptions    |
| `apps/web/src/features/catalog/utils/development-progress.ts`           | DevelopmentBadge                                                                              |
| `apps/web/src/features/catalog/utils/display-currency.ts`               | DisplayCurrency                                                                               |
| `apps/web/src/features/catalog/utils/format-price.ts`                   | FormatPriceOptions                                                                            |
| `apps/web/src/features/catalog/utils/load-buy-apartments.ts`            | BuyApartmentListing                                                                           |
| `apps/web/src/features/catalog/utils/partner-filters.ts`                | PartnerListFilters                                                                            |
| `apps/web/src/features/catalog/utils/project-catalog-details.ts`        | CatalogContentLocale, ProjectCatalogDetails, ParsedProjectCatalog                             |
| `apps/web/src/features/catalog/utils/project-catalog-links.ts`          | ProjectCatalogLinkId, ProjectCatalogLink                                                      |
| `apps/web/src/features/catalog/utils/project-detail-presentation.ts`    | TimelineStageStatus, TimelineStageKey                                                         |
| `apps/web/src/features/catalog/utils/project-filters.ts`                | ProjectFilterParams                                                                           |
| `apps/web/src/features/crm-board/constants.ts`                          | CrmBoardMode                                                                                  |
| `apps/web/src/features/crm-board/group-deals-by-status.ts`              | CrmDealsByStatus                                                                              |
| `apps/web/src/features/crm-board/use-crm-deal-sheet-url.ts`             | UseCrmDealSheetUrlResult                                                                      |
| `apps/web/src/features/crm-board/use-crm-new-lead-url.ts`               | UseCrmNewLeadUrlResult                                                                        |
| `apps/web/src/features/exhibition/api/admin-exhibition-api.ts`          | AdminExhibitionRequestOptions                                                                 |
| `apps/web/src/features/exhibition/api/checkin-api.ts`                   | CheckinRequestOptions                                                                         |
| `apps/web/src/features/media/api/media-api.ts`                          | MediaUploadContext                                                                            |
| `apps/web/src/features/media/constants.ts`                              | MediaAllowedMimeType                                                                          |
| `apps/web/src/features/mortgage/hooks/use-mortgage-calculator.ts`       | DownPaymentField, UseMortgageCalculatorParams                                                 |
| `apps/web/src/features/partners/utils/is-partner-compatible-company.ts` | PartnerCompatibleCompanyType                                                                  |
| `apps/web/src/shared/api/client.ts`                                     | ApiFetchOptions                                                                               |
| `apps/web/src/shared/api/index.ts`                                      | _(unnamed / inline)_                                                                          |
| `apps/web/src/shared/api/public-fetch.ts`                               | PublicFetchInit                                                                               |
| `apps/web/src/shared/config/env.ts`                                     | PublicEnv                                                                                     |
| `apps/web/src/shared/config/sentry.config.ts`                           | SentryInitOptions                                                                             |
| `apps/web/src/shared/hooks/use-persisted-view-mode.ts`                  | UsePersistedViewModeResult                                                                    |
| `apps/web/src/shared/ui/use-anchored-dropdown-coords.ts`                | AnchoredDropdownCoords                                                                        |
| `apps/web/src/shared/ui/use-drawer-transition.ts`                       | DrawerTransitionState                                                                         |
| `apps/web/src/shared/ui/use-modal-enter-exit.ts`                        | UseModalEnterExitOptions, UseModalEnterExitResult                                             |
| `apps/web/src/shared/ui/view-mode.ts`                                   | ViewMode                                                                                      |

## 4. API - Nest runtime units with colocated types

**Count:** 29

| File                                                                   | Local types                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/api/src/access-tokens/access-token.service.ts`                   | IssuedAccessToken, AccessTokenUser, ValidatedAccessToken          |
| `apps/api/src/admin/companies/admin-companies.service.ts`              | CreateCompanyInput, UpdateCompanyInput                            |
| `apps/api/src/auth/auth-user-response.service.ts`                      | UserRecord                                                        |
| `apps/api/src/auth/decorators/current-user.decorator.ts`               | RequestWithUser                                                   |
| `apps/api/src/auth/decorators/optional-user.decorator.ts`              | RequestWithUser                                                   |
| `apps/api/src/auth/guards/account-types.guard.ts`                      | RequestWithUser                                                   |
| `apps/api/src/auth/session-cookie.service.ts`                          | ClientMeta, CreatedSession                                        |
| `apps/api/src/auth/strategies/session.strategy.ts`                     | RequestWithCookies                                                |
| `apps/api/src/catalog/catalog-prices.service.ts`                       | PricedApartmentRow                                                |
| `apps/api/src/catalog/projects.service.ts`                             | CatalogViewerContext                                              |
| `apps/api/src/common/filters/all-exceptions.filter.ts`                 | ErrorBody                                                         |
| `apps/api/src/common/web-revalidation/web-revalidation.service.ts`     | WebRevalidateTag                                                  |
| `apps/api/src/company/company-members.service.ts`                      | InviteInput, UpdateMemberInput, MemberWithUser                    |
| `apps/api/src/company/decorators/current-company-admin.decorator.ts`   | RequestWithCompanyAdmin                                           |
| `apps/api/src/company/decorators/current-company-member.decorator.ts`  | RequestWithCompanyMember                                          |
| `apps/api/src/company/guards/company-admin.guard.ts`                   | RequestWithCompanyAdmin                                           |
| `apps/api/src/company/guards/company-member.guard.ts`                  | CompanyMemberMeta, RequestWithCompanyMember                       |
| `apps/api/src/company/provisioning/company-provisioning.service.ts`    | CompanyRecord, UserRecord, CompanyAdminTransactionInput, DbClient |
| `apps/api/src/crm/admin/admin-crm-deals.service.ts`                    | ListAdminDealsQuery                                               |
| `apps/api/src/crm/intake/request-intake.service.ts`                    | Tx                                                                |
| `apps/api/src/crm/portal/portal-crm-deals.service.ts`                  | ListDealsQuery                                                    |
| `apps/api/src/exhibition/checkin/checkin-scan.service.ts`              | SuccessfulScanInput                                               |
| `apps/api/src/favorites/buyer-favorites.service.ts`                    | PublishedTargetContext                                            |
| `apps/api/src/integrations/bos/bos-provisioning-audit.service.ts`      | AuditClient                                                       |
| `apps/api/src/media/media-upload.service.ts`                           | UploadInput                                                       |
| `apps/api/src/qr/qr-codes.service.ts`                                  | TxClient                                                          |
| `apps/api/src/qr/qr-resolve.service.ts`                                | QrResolveMeta, QrWithBuyer                                        |
| `apps/api/src/readiness/admin/readiness-assessment-support.service.ts` | ActiveTargetFilter                                                |
| `apps/api/src/visual-map/public/public-visual-map.service.ts`          | PublicContextQuery                                                |

## 4b. API - Nest runtime units with inline method / local object types only

No top-level `type` / `interface` alias — complex shapes live in parameter / return annotations.

**Count:** 15

| File                                                                  | Inline pattern notes                                                   |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/api/src/access-tokens/invite-mailer.service.ts`                 | `input: { userId; email; name; locale? }` on invite/reset mail methods |
| `apps/api/src/auth/auth.controller.ts`                                | Return / local `meta: { ipAddress?; userAgent? }`                      |
| `apps/api/src/auth/auth.service.ts`                                   | Multiple `input: { name/email/phone/password… }`; session shape params |
| `apps/api/src/auth/auth-password.service.ts`                          | Password flows use inline `input: { … }` objects                       |
| `apps/api/src/crm/buyer/buyer-requests.service.ts`                    | `body: { projectId; apartmentId?; note? }`                             |
| `apps/api/src/crm/portal/portal-crm-deal-apartments.service.ts`       | `Promise<{ id; status; projectId }>`                                   |
| `apps/api/src/crm/status/deal-status.service.ts`                      | Heavy: status/inventory helpers take repeated inline `input: {…}`      |
| `apps/api/src/exhibition/admin/admin-booths.service.ts`               | Module helper `toAssignmentDetail(assignment: { … })`                  |
| `apps/api/src/exhibition/checkin/buyer-checkin.service.ts`            | Inline Promise / `activeEvent: { id; name }` shapes                    |
| `apps/api/src/exhibition/public/public-booth-search.service.ts`       | Deep nested booth shape on `matchBooth`                                |
| `apps/api/src/exhibition/public/public-exhibition.service.ts`         | Deep inline booth/assignment helper shapes                             |
| `apps/api/src/exhibition/public/public-route.service.ts`              | `Promise<{ nodes; edges }>`                                            |
| `apps/api/src/portal/apartments/portal-apartments.service.ts`         | `toApartmentDetail(apartment: { id: string })`                         |
| `apps/api/src/readiness/admin/admin-readiness-assessments.service.ts` | `trackReadinessChange(input: { … })`                                   |
| `apps/api/src/readiness/portal/portal-readiness.service.ts`           | `findActiveAssessment(where: { … })`                                   |

## 5. API - mappers / utils / helpers / other modules with colocated types

**Count:** 40

| File                                                                | Local types                                                                                                                                                                                        |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/analytics/utils/favorites-aggregates.ts`              | FavoriteCountGroup                                                                                                                                                                                 |
| `apps/api/src/auth/mappers/user.mapper.ts`                          | UserRecord                                                                                                                                                                                         |
| `apps/api/src/catalog/mappers/aggregate-prices.ts`                  | ApartmentPriceRow                                                                                                                                                                                  |
| `apps/api/src/catalog/mappers/catalog.mapper.ts`                    | MediaRow                                                                                                                                                                                           |
| `apps/api/src/catalog/mappers/inventory.mapper.ts`                  | MapContext, MediaRow                                                                                                                                                                               |
| `apps/api/src/catalog/mappers/project.mapper.ts`                    | MediaRow, ApartmentPriceRow, ProjectListSource, ProjectDetailSource, MapContext                                                                                                                    |
| `apps/api/src/catalog/utils/load-translations.ts`                   | TranslationClient                                                                                                                                                                                  |
| `apps/api/src/catalog/utils/resolve-translation.ts`                 | TranslationEntityType, TranslationFieldName, TranslationRow                                                                                                                                        |
| `apps/api/src/companies/mappers/company.mapper.ts`                  | CompanyRecord                                                                                                                                                                                      |
| `apps/api/src/companies/mappers/company-member.mapper.ts`           | MemberRecord                                                                                                                                                                                       |
| `apps/api/src/config/env.validation.ts`                             | AppEnv                                                                                                                                                                                             |
| `apps/api/src/crm/intake/intake.helpers.ts`                         | DealLookupClient, ApartmentLinkSnapshot                                                                                                                                                            |
| `apps/api/src/crm/mappers/crm.mapper.ts`                            | BuyerProfileRow, AssignedUserRow, ProjectRow, DealListRow                                                                                                                                          |
| `apps/api/src/exhibition/mappers/exhibition.mapper.ts`              | EventRow, VenueMapRow, BoothRow, RouteNodeRow, RouteEdgeRow                                                                                                                                        |
| `apps/api/src/exhibition/public/route-graph.cache.ts`               | CachedRouteNode, CachedRouteEdge, CacheEntry                                                                                                                                                       |
| `apps/api/src/exhibition/utils/dijkstra.ts`                         | GraphNode, GraphEdge, DijkstraResult                                                                                                                                                               |
| `apps/api/src/exhibition/utils/load-entity-translations.ts`         | EntityIdGroups                                                                                                                                                                                     |
| `apps/api/src/favorites/mappers/favorite-apartment.mapper.ts`       | ApartmentFavoriteSource, MapApartmentContext                                                                                                                                                       |
| `apps/api/src/favorites/utils/favorite-catalog-resolver.ts`         | FavoriteRow                                                                                                                                                                                        |
| `apps/api/src/integrations/bos/bos-provisioning.mapper.ts`          | BosProvisioningRecord, IntegrationAuditRecord                                                                                                                                                      |
| `apps/api/src/media/media.constants.ts`                             | MediaAllowedMimeType                                                                                                                                                                               |
| `apps/api/src/media/media.mapper.ts`                                | MediaAssetRow                                                                                                                                                                                      |
| `apps/api/src/mortgage/calculator/mortgage-calculator.util.ts`      | CalculatorOffer, MortgageCalculatorValidationError, PaymentTotals                                                                                                                                  |
| `apps/api/src/mortgage/mappers/bank-offer.mapper.ts`                | BankOfferRecord, BankOfferWithPartner                                                                                                                                                              |
| `apps/api/src/mortgage/utils/bank-offer-access.ts`                  | BankOfferClient                                                                                                                                                                                    |
| `apps/api/src/partners/mappers/partner.mapper.ts`                   | PartnerCompanyRow, PartnerOfferRow, BankOfferRow, PartnerWithMedia                                                                                                                                 |
| `apps/api/src/partners/utils/partner-access.ts`                     | PartnerCompanyClient                                                                                                                                                                               |
| `apps/api/src/portal/apartments/apartment-write.helpers.ts`         | ApartmentRow, DbClient                                                                                                                                                                             |
| `apps/api/src/portal/mappers/portal.mapper.ts`                      | ProjectListRow, FloorRow, BuildingRow, ProjectDetailRow, ApartmentRow                                                                                                                              |
| `apps/api/src/portal/utils/ownership.ts`                            | ProjectOwned, BuildingOwned, FloorOwned, ApartmentOwned                                                                                                                                            |
| `apps/api/src/portal/utils/upsert-translations.ts`                  | TranslationClient, TranslationFieldPayload                                                                                                                                                         |
| `apps/api/src/rate-limit/upstash-throttler.storage.ts`              | ThrottlerIncrementRecord, RedisEvalClient, LuaEvalResult                                                                                                                                           |
| `apps/api/src/readiness/mappers/readiness.mapper.ts`                | ReadinessCategory, ReadinessAssessment, ReadinessScore, ReadinessRecommendation, ReadinessRequiredAction, ReadinessInternalNote, ScoreWithCategory, AssessmentDetailRecord, PortalAssessmentSource |
| `apps/api/src/readiness/utils/overall-score.util.ts`                | WeightedScoreInput                                                                                                                                                                                 |
| `apps/api/src/service-providers/mappers/service-provider.mapper.ts` | CategoryRecord, ProviderWithCategories                                                                                                                                                             |
| `apps/api/src/service-providers/utils/service-provider-access.ts`   | ServiceProviderClient                                                                                                                                                                              |
| `apps/api/src/visual-map/mappers/visual-map.mapper.ts`              | CanvasWithCounts, CanvasWithHotspots, HotspotRow                                                                                                                                                   |
| `apps/api/src/visual-map/portal/portal-visual-map.shared.ts`        | OwnedCanvas                                                                                                                                                                                        |
| `apps/api/src/visual-map/utils/context-validation.ts`               | ContextValidationInput                                                                                                                                                                             |
| `apps/api/src/visual-map/utils/target-validation.ts`                | TargetValidationInput, TargetEntity, LoadedTargetEntities                                                                                                                                          |

---

## Suggested follow-up (not done in this audit)

If the team wants extraction:

1. **API first:** named colocated types (~69) + inline-only Nest hotspots (section 4b). Highest density: `deal-status.service.ts`, `auth.service.ts` / `auth-password.service.ts`, `company-provisioning.service.ts`, duplicated `RequestWithUser` / `RequestWithCompany*` across guards/decorators.
2. **Web:** colocated `*Props` is the project convention — do not mass-extract. Prefer extracting only when a type is shared by >=2 files, or non-Props helper unions (e.g. `ButtonVariant`, `ResolveState`) reused outside the file.
3. Cross-boundary shapes belong in `packages/contracts`, not local `*.types.ts`.
