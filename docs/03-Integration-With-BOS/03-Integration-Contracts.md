# ToonExpo Integration Contracts

## Purpose

This file defines the first integration contracts between ToonExpo Ecosystem and BigProjects BOS.

## v1 Contract Principle

Do not duplicate ToonExpo data into BOS in v1.

BigProjects admins can open ToonExpo directly when they need ToonExpo data.

The main integration is account/company provisioning from BOS to ToonExpo.

## BOS -> ToonExpo Signals

### Approved Participant Signal

Fields:

- request id;
- company id from BOS;
- company name;
- company type: builder | bank | partner | service | other;
- contact person;
- contact email;
- contact phone optional;
- approved participant status;
- requested ToonExpo access modules.

### Create ToonExpo Account Request

Fields:

- request id;
- company id from BOS;
- company name;
- company type;
- company type: builder | partner | bank | service;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- modules to enable: builder_portal, constructor_crm, readiness, partner_profile, bank_offers, analytics.

Note: `builder`, `partner` and `bank` are company types, not user account types. ToonExpo creates `User(account_type = company_member)` with `CompanyMember(role = company_admin)`.

## ToonExpo -> BOS Response

### Account Creation Result

Fields:

- request id;
- ToonExpo company id;
- primary user id;
- status: success | linked_existing | failed;
- error message if failed;
- created_at.

## Idempotency Rule

Provisioning must be safe to retry.

Use request id, BOS company id and primary contact email to avoid duplicate companies/users.

## Rule

ToonExpo remains the source of truth for ToonExpo product data.

BOS sends approved participant/account creation signals.
