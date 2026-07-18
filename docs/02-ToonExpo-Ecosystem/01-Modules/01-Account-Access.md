# ToonExpo Module: Account & Access Management

## Status

v1 — account model confirmed 2026-07-18

## Purpose

Account & Access Management is the standard account system inside ToonExpo Ecosystem.

This is not a "shared auth between separate platforms" anymore. ToonExpo is one ecosystem.

## In Scope

- users and exclusive account types;
- companies and company types;
- company members and company member roles;
- module access;
- buyer self-registration;
- buyer accounts created by platform admin if needed;
- company provisioning (builder, partner, bank, service);
- platform admin accounts;
- entrance staff accounts;
- personal logins for every company employee (no shared company credentials).

## Account Model (Confirmed 2026-07-18)

- `User.account_type`: `buyer` | `platform_admin` | `entrance_staff` | `company_member` — one account, one type;
- `Company.type`: `builder` | `partner` | `bank` | `service` — business context, not a user type;
- `CompanyMember.role`: `company_admin` | `member` in v1;
- v1 constraint: one user may belong to at most one company;
- `BuyerProfile` and personal QR only for `buyer` accounts.

## Initial Production Decisions

- buyer can self-register;
- platform admin can also create buyer accounts if needed;
- builder, partner, bank and service companies are provisioned by platform admin or BOS signal — each employee gets a personal login;
- visitor can be registered at entrance if needed;
- required buyer profile fields: name, phone, email; self-registration also requires a password;
- no phone verification;
- no email verification;
- company provisioning sends set-password link via Resend; no shared company password.

## Deep Documentation

Detailed implementation docs are split by topic:

- [Module Index](./01-Account-Access/00-Module-Index.md)
- [Definition And Boundaries](./01-Account-Access/01-Definition-And-Boundaries.md)
- [Account Creation Flows](./01-Account-Access/02-Account-Creation-Flows.md)
- [Buyer Registration And QR](./01-Account-Access/03-Buyer-Registration-And-QR.md)
- [Company Members And Module Access](./01-Account-Access/04-Company-Members-And-Module-Access.md)
- [Roles And Permissions](./01-Account-Access/05-Roles-And-Permissions.md)
- [BOS Provisioning](./01-Account-Access/06-BOS-Provisioning.md)
- [Security And Verification](./01-Account-Access/07-Security-And-Verification.md)
- [Entity Fields](./01-Account-Access/08-Entity-Fields.md)
- [Acceptance Criteria](./01-Account-Access/09-Acceptance-Criteria.md)
