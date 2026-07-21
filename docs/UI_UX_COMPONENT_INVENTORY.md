# UI/UX Component Inventory — ToonExpo Ecosystem

Inventory of shared design-system components and major feature UI touched in the 2026-07-21 redesign.

Status: **Done** = redesigned/new · **Updated** = API-compatible refresh · **Existing** = unchanged this pass but inherits tokens

| Component               | Path                                                  | Category   | Scope   | Redesign | Responsive | A11y    | Notes                                 |
| ----------------------- | ----------------------------------------------------- | ---------- | ------- | -------- | ---------- | ------- | ------------------------------------- |
| BrandLogo               | `shared/ui/brand-logo.tsx`                            | Navigation | Shared  | Done     | Done       | Done    | TOON+EXPO wordmark + optional badge   |
| SiteHeader              | `shared/ui/site-header.tsx`                           | Navigation | Shared  | Done     | Done       | Done    | Lucide menu; transparent/solid        |
| LocaleSwitcher          | `shared/ui/locale-switcher.tsx`                       | Navigation | Shared  | Existing | Done       | Done    | Used in header/footer/portals         |
| PortalShell             | `shared/ui/portal-shell.tsx`                          | Layout     | Shared  | Done     | Done       | Done    | Builder/admin/partner chrome + drawer |
| PageHeader              | `shared/ui/page-header.tsx`                           | Layout     | Shared  | Done     | Done       | Done    | Title + actions                       |
| SectionHeader           | `shared/ui/section-header.tsx`                        | Layout     | Shared  | Done     | Done       | Done    | Marketing/catalog bands               |
| Button                  | `shared/ui/button.tsx`                                | Action     | Shared  | Updated  | Done       | Done    | Expanded variants/sizes               |
| IconButton              | `shared/ui/icon-button.tsx`                           | Action     | Shared  | Done     | Done       | Done    | Requires `label`                      |
| Card                    | `shared/ui/card.tsx`                                  | Surface    | Shared  | Updated  | Done       | Done    | muted/elevated/outline/inverse        |
| Badge                   | `shared/ui/badge.tsx`                                 | Status     | Shared  | Done     | Done       | Done    | Tone tokens                           |
| Input                   | `shared/ui/input.tsx`                                 | Form       | Shared  | Updated  | Done       | Done    | 16px mobile font-size                 |
| Textarea                | `shared/ui/textarea.tsx`                              | Form       | Shared  | Updated  | Done       | Done    | Aligned with Input                    |
| FormField               | `shared/ui/form-field.tsx`                            | Form       | Shared  | Existing | Done       | Done    | Label + error                         |
| Dialog                  | `shared/ui/dialog.tsx`                                | Overlay    | Shared  | Done     | Done       | Done    | Escape + scroll lock                  |
| SideSheet               | `shared/ui/side-sheet.tsx`                            | Overlay    | Shared  | Done     | Done       | Done    | Stack level for nested sheets         |
| Skeleton / SkeletonText | `shared/ui/skeleton.tsx`                              | Feedback   | Shared  | Done     | Done       | Done    | Pulse placeholders                    |
| EmptyState              | `shared/ui/empty-state.tsx`                           | Feedback   | Shared  | Done     | Done       | Done    | Lucide icon + optional CTA            |
| ErrorState              | `shared/ui/error-state.tsx`                           | Feedback   | Shared  | Done     | Done       | Done    | Alert + retry                         |
| Reveal                  | `shared/ui/motion/reveal.tsx`                         | Motion     | Shared  | Done     | Done       | Done    | IO + reduced motion                   |
| StaggerGroup            | `shared/ui/motion/stagger-group.tsx`                  | Motion     | Shared  | Done     | Done       | Done    | Capped stagger                        |
| AnimatedCounter         | `shared/ui/motion/animated-counter.tsx`               | Motion     | Shared  | Done     | Done       | Done    | Stats entrance                        |
| cn                      | `shared/ui/cn.ts`                                     | Utility    | Shared  | Existing | —          | —       | clsx + twMerge                        |
| ApiStatus               | `shared/ui/api-status.tsx`                            | Feedback   | Shared  | Existing | —          | —       | Health probe UI                       |
| HomeHero                | `features/catalog/components/home-hero.tsx`           | Marketing  | Feature | Done     | Done       | Done    | Full-bleed hero                       |
| HeroSearch              | `features/catalog/components/hero-search.tsx`         | Marketing  | Feature | Done     | Done       | Done    | Lucide search                         |
| HomeStats               | `features/catalog/components/home-stats.tsx`          | Marketing  | Feature | Done     | Done       | Done    | Animated counters                     |
| FeaturedProjects        | `features/catalog/components/featured-projects.tsx`   | Marketing  | Feature | Done     | Done       | Partial | Stagger reveal                        |
| HomeExplore             | `features/catalog/components/home-explore.tsx`        | Marketing  | Feature | Done     | Done       | Done    | Live location chips                   |
| HomeBuilders            | `features/catalog/components/home-builders.tsx`       | Marketing  | Feature | Done     | Done       | Done    | Builder grid                          |
| HomeExhibition          | `features/catalog/components/home-exhibition.tsx`     | Marketing  | Feature | Done     | Done       | Done    | Inverse band                          |
| HomeMortgage            | `features/catalog/components/home-mortgage.tsx`       | Marketing  | Feature | Done     | Done       | Done    | Financing CTA                         |
| HomePartners            | `features/catalog/components/home-partners.tsx`       | Marketing  | Feature | Done     | Done       | Done    | Partner strip                         |
| HomeFinalCta            | `features/catalog/components/home-final-cta.tsx`      | Marketing  | Feature | Done     | Done       | Done    | Closing CTA                           |
| SiteFooter              | `features/catalog/components/site-footer.tsx`         | Navigation | Feature | Done     | Done       | Done    | Columns + locale                      |
| ProjectCard             | `features/catalog/components/project-card.tsx`        | Catalog    | Feature | Done     | Done       | Done    | Hover lift + badge                    |
| BuilderCard             | `features/catalog/components/builder-card.tsx`        | Catalog    | Feature | Done     | Done       | Done    | Elevated card                         |
| BuilderNav              | `features/builder/components/builder-nav.tsx`         | Navigation | Feature | Done     | Done       | Done    | Lucide items                          |
| AdminNav                | `features/admin/components/admin-nav.tsx`             | Navigation | Feature | Done     | Done       | Done    | Lucide items                          |
| PartnerNav              | `features/partner/components/partner-nav.tsx`         | Navigation | Feature | Done     | Done       | Done    | Lucide items                          |
| ProfileNav              | `features/buyer/components/profile-nav.tsx`           | Navigation | Feature | Done     | Done       | Done    | Icon pills                            |
| BuyerQrCode             | `features/buyer/components/buyer-qr-code.tsx`         | Buyer      | Feature | Updated  | Done       | Done    | Exhibition-ready frame                |
| CrmDealsListPage        | `features/builder/components/crm-deals-list-page.tsx` | CRM        | Feature | Updated  | Done       | Partial | Skeleton/empty/table                  |
| FavoriteHeartIcon       | `features/buyer/components/favorite-heart-icon.tsx`   | Action     | Feature | Existing | Done       | Done    | SVG heart (consistent stroke)         |

## Feature panels still using local patterns

These continue to work and inherit global CSS tokens; primary follow-up is optional adoption of `SideSheet` / `Dialog` / `EmptyState` where panels still use ad-hoc overlays:

- Admin create/edit panels (partners, readiness, companies)
- Builder inventory forms, readiness help dialog
- Exhibition booth sheet, public visual hotspot sheet
- Buyer request form panel

## Icon library

**Single library:** `lucide-react` (stroke icons). Do not introduce a second icon set.
