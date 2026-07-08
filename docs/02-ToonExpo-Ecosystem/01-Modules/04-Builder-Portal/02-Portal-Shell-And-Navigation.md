# Portal Shell And Navigation

## Purpose

The portal shell defines how builders move through their private ToonExpo workspace.

It should be simple enough for first-time participants, but structured enough to support the full workflow from setup to event activity to post-event follow-up.

## Main Sections

Recommended v1 navigation:

1. Dashboard
2. Company Profile
3. Projects
4. Apartments / Inventory
5. Visual Maps
6. CRM
7. Readiness
8. Exhibition Map
9. Analytics
10. Settings / Team

The exact labels can be adjusted in UI copy, but the separation should stay clear.

## Dashboard

Builder dashboard is a summary page, not a separate management module.

It should show:

- company/public profile publication status;
- project and apartment counts;
- readiness score/status;
- open CRM deals/requests;
- recent buyer interest;
- event booth/map placement if assigned;
- missing setup items;
- quick links to the main work areas.

## Company Switch

In v1, normal builder users usually belong to one builder company.

BigProjects Admin may manage many companies. For admin users, the shell needs a company selector/search so the admin can enter a builder workspace and manage that company's data.

## Language

The portal must support the platform languages:

- Armenian;
- Russian;
- English.

Fields that are public-facing should support multilingual content where needed. Internal operational fields can be single-language in v1 if translation is not required for the public website.

## Mobile Behavior

Builder Portal is primarily an operational workspace, but mobile must remain usable.

Rules:

- dashboards and lists should be readable on mobile;
- key actions such as checking leads, opening buyer requests and viewing readiness should work on mobile;
- heavy setup flows such as large inventory entry or hotspot editing can be optimized for desktop/tablet first;
- the public mobile app-like experience is handled by the Public Web / Mobile App module.

## Navigation Rules

- Main section navigation changes the workspace.
- Clicking an entity opens a side sheet over the current workspace.
- A full page is used only when the user enters a true workspace, such as CRM board, project management area or visual map editor.
- Related entity clicks inside a sheet open another sheet stacked over the current sheet.
- Closing the child sheet returns the user to the parent sheet and original workspace.

## Empty States

Empty states should be practical and action-oriented:

- no projects: show "Add project" / "Request admin help";
- no apartments: show "Add building/floor/apartment" after project exists;
- no CRM deals: explain that buyer requests and QR scan actions will appear here;
- no readiness assessment: show that BigProjects Admin has not evaluated yet or setup is incomplete;
- no booth assigned: show "Not assigned yet" without implying an error.

