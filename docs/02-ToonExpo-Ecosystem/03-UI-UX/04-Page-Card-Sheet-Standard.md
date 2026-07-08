# ToonExpo Page / Card / Sheet Standard

## Purpose

ToonExpo should use a fast UI pattern for admin, builder portal and CRM areas.

Public buyer pages may still be normal full pages when they are public browsing pages.

## Core Rule

```text
Board/list/admin page -> card/row click -> side sheet
Linked entity click -> stacked side sheet
Full page -> only for public pages or real workspaces
```

## Use Full Pages For

- public project page;
- public apartment page;
- public mortgage page;
- builder portal workspace pages;
- CRM board/list page;
- readiness dashboard;
- exhibition map page.

## Use Side Sheets For

- project editor;
- building editor;
- floor editor;
- apartment editor;
- CRM deal/request detail;
- buyer QR action detail;
- partner profile editor;
- bank offer editor;
- readiness recommendation/detail.

## Use Quick Dialogs For

- quick create request/deal;
- confirm status change;
- add short comment;
- upload one image/file;
- select apartment for deal.

## Stacked Sheet Rule

If a user opens a linked entity from inside a sheet, open another sheet above the current sheet.

Example:

```text
CRM deal sheet
↓
Click linked apartment
↓
Apartment sheet opens above deal sheet
↓
Close apartment sheet
↓
Return to deal sheet
```

Do not force the user to leave the CRM or builder portal context for inspect/edit flows.

