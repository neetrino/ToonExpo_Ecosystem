# ToonExpo Module: Account & Access Management

## Status

v1

## Purpose

Account & Access Management is the standard account system inside ToonExpo Ecosystem.

This is not a "shared auth between separate platforms" anymore. ToonExpo is one ecosystem.

## In Scope

- users;
- companies;
- company members;
- roles;
- module access;
- buyer / ordinary visitor self-registration;
- buyer accounts created by BigProjects admin/staff if needed;
- builder company accounts;
- partner accounts;
- bank partner account fields/offers;
- BigProjects admin/staff accounts;
- entrance staff accounts.

## Initial Production Decisions

- buyer / ordinary visitor can self-register;
- BigProjects admin/staff can also create buyer accounts if needed;
- builder, partner and bank accounts are created by BigProjects admin/staff or by BOS account creation signal;
- visitor can be registered at entrance if needed;
- required buyer profile fields: name, phone, email; self-registration also requires a password;
- no phone verification;
- no email verification.

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
