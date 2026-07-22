# User Account UI/UX Redesign Report

**Date:** 2026-07-22  
**Scope:** Buyer / visitor account cabinet (`/[locale]/settings/*`)  
**Status:** Complete (frontend redesign; existing APIs unchanged)

## Routes reviewed

Verified from the repository (not docs alone). `/profile` permanently redirects to `/settings`.

| Route                           | Purpose                                  | Exists                     |
| ------------------------------- | ---------------------------------------- | -------------------------- |
| `/[locale]/settings`            | Overview + personal information + logout | Yes                        |
| `/[locale]/settings/password`   | Account settings (password change)       | Yes                        |
| `/[locale]/settings/qr`         | My QR + scan history                     | Yes                        |
| `/[locale]/settings/favorites`  | Favorites                                | Yes                        |
| `/[locale]/settings/requests`   | My requests                              | Yes                        |
| `/[locale]/settings/checkin`    | Check-in status + history                | Yes                        |
| `/[locale]/profile/*`           | Redirect only                            | Yes (redirect)             |
| Standalone scan-history route   | —                                        | **No** (embedded under QR) |
| Editable personal-info API/form | —                                        | **No** (read-only fields)  |
| Account deletion                | —                                        | **No**                     |

Related but out of cabinet scope: `/checkin` (staff scanner), `/qr/[token]` (public resolve).

## Sidebar structure

Dark rail (same chrome family as Admin `PortalShell` `variant="rail"`), buyer-focused items only:

**Primary**

1. Overview → `/settings`
2. My QR → `/settings/qr` (buyer)
3. Favorites → `/settings/favorites` (buyer)
4. My Requests → `/settings/requests` (buyer)
5. Check-in → `/settings/checkin` (buyer)

**Footer**

6. Account settings → `/settings/password`
7. Logout (session clear + redirect to login)

User summary in sidebar: avatar initials, name, email, localized account-type badge.

## Components changed / created

### Shared shell

- `apps/web/src/shared/ui/portal-shell.tsx` — `/settings` brand href, optional `mobileHeader`, drawer enter animation
- `apps/web/src/shared/ui/public-chrome.tsx` — treat `/settings` as portal (avoid double SiteHeader)
- `apps/web/src/app/[locale]/globals.css` — `portal-drawer-in` keyframes

### Account feature components (`features/buyer/components/account/`)

- `account-nav.tsx`
- `account-user-summary.tsx`
- `account-mobile-section-title.tsx`
- `account-page-header.tsx`
- `account-page-enter.tsx`
- `account-content-panel.tsx`
- `account-profile-field.tsx`
- `account-stat-card.tsx`
- `account-overview-stats.tsx`
- `account-empty-state.tsx`
- `account-status-badge.tsx`

### Pages / lists redesigned

- `app/[locale]/settings/layout.tsx` — PortalShell rail + AccountNav
- `app/[locale]/settings/page.tsx` — welcome overview, buyer stats, personal info, session logout
- `settings/password`, `qr`, `favorites`, `requests`, `checkin` pages — shared page chrome
- `buyer-qr-code.tsx`, `buyer-qr-page-content.tsx`, `scan-history-list.tsx`
- `buyer-favorites-list.tsx`, `favorite-apartment-card.tsx`
- `buyer-requests-list.tsx`, `buyer-checkin-status.tsx`

### Removed

- `profile-nav.tsx` (horizontal pill tabs replaced by rail sidebar)

### Utils / tests

- `account-initials.ts` + `account-initials.test.ts`

## Design decisions

- Reused Admin **rail chrome** (`PortalShell` + dark teal sticky sidebar + mobile drawer), not Admin nav destinations.
- Account rail is more personal: user summary, buyer-only groups, logout in footer.
- Content width widened vs previous `max-w-lg` narrow column so large screens stay balanced.
- Overview aggregates **live** favorites / requests / check-in / scan counts — no fake stats.
- Personal information stays read-only; password remains the only editable account setting.
- Scan history stays on My QR (no fake route).
- Status badges always include text (not color alone).
- Lucide icons only; no emojis.
- QR remains static, high-contrast on white, no overlays on the code.

## Responsive behavior

| Breakpoint intent | Behavior                                                                            |
| ----------------- | ----------------------------------------------------------------------------------- |
| &lt; md           | Menu control + current section title; left drawer with same nav; content full width |
| md+               | Sticky `w-72` dark rail; main content in `page-container`                           |
| Favorites         | 1 → 2 → 3 column grid                                                               |
| Forms / QR        | Constrained cards (`max-w-md` / `max-w-xl`) for readability                         |

Targeted layout rules cover 320–1920px ranges used in the design system (page gutters, no horizontal overflow expected). Manual visual QA in browser recommended for edge devices.

## Accessibility improvements

- Semantic headings per section; QR scan history / check-in labeled sections
- Drawer closes on route change; body scroll lock while open
- Focus-visible rings via shared button/link styles
- `aria-busy` / `aria-live` on loading skeletons
- `role="alert"` on error states
- Status communicated with text labels + tone
- Global `prefers-reduced-motion` short-circuits animations (including drawer / page-enter)

## Animations added

- Page entrance (`page-enter`)
- Mobile drawer slide/fade (`portal-drawer-in`)
- Card / list `Reveal` stagger on overview, favorites, requests, scans, check-in
- Stat-card hover lift
- QR card uses Reveal on the card chrome only — **QR SVG is not animated**

## Localization

Updated `Profile.*` keys in:

- `apps/web/messages/en.json`
- `apps/web/messages/hy.json`
- `apps/web/messages/ru.json`

New keys include overview stats, session block, account type labels, empty-state titles, secure QR badge, request created/updated labels, nav overview / portal label / badge.

## Remaining limitations

- Personal information is still **not editable** (no backend profile update API).
- No account deletion (not supported by backend).
- Request list still loads page 1 only (`pageSize` 20) — same as before.
- Scan history is not a separate sidebar item (by design: lives under My QR).
- Root `pnpm test` includes API e2e suites that can fail on local DB timeout / `WEB_ORIGIN` host mismatch; these are unrelated to this UI redesign.
- Full Playwright smoke against the new shell was not re-run in this session (unit + production build verified).

## Commands executed

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @toonexpo/web build
pnpm build
```

Also verified earlier during implementation:

```bash
pnpm --filter @toonexpo/web lint
pnpm --filter @toonexpo/web typecheck
pnpm --filter @toonexpo/web test
```

## Results

| Command                             | Result                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                         | **Pass** (`@toonexpo/web`, `@toonexpo/api`)                                                                                                      |
| `pnpm typecheck`                    | **Pass** (all packages)                                                                                                                          |
| `pnpm test`                         | **Web pass** (108 tests). API suite: 2 unrelated e2e failures (`portal.e2e` statement timeout; `qr.e2e` expects `localhost` but env uses LAN IP) |
| `pnpm --filter @toonexpo/web build` | **Pass**                                                                                                                                         |
| `pnpm build`                        | **Pass** (database + turbo packages including web & api)                                                                                         |

## Functional safety checklist

- Auth gate + platform_admin redirect preserved
- Partner company_member redirect preserved
- Buyer-only route guards preserved
- Logout (profile + sidebar) uses existing `useLogoutMutation`
- QR payload / fullscreen / scan history APIs unchanged
- Favorites add/remove mutations unchanged
- Requests / check-in queries unchanged
- Locale routing preserved
- No mock user data hardcoded in production UI
