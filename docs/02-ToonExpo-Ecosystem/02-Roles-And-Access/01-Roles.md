# ToonExpo Roles And Access

## Status

Confirmed 2026-07-18

## Account Model Overview

ToonExpo separates **account type** (who the user is on the platform) from **company membership** (which business organization they belong to) and **company member role** (what they can do inside that company).

```text
User.account_type          — exclusive; one account = one type
Company.type               — builder | partner | bank | service
CompanyMember.role         — company_admin | member (v1)
```

Builder, partner and bank are **not** user account types. A builder employee is `User(account_type = company_member)` linked through `CompanyMember` to `Company(type = builder)`.

## AccountType (User)

Exclusive account type. One user account has exactly one type. Mixing types on a single account is forbidden.

If a company employee also needs a buyer account, they create a separate personal buyer account.

| AccountType | Description |
|---|---|
| `buyer` | Public visitor / buyer. Self-registration allowed. |
| `platform_admin` | ToonExpo platform operator (BigProjects admin/staff). Global management access. |
| `entrance_staff` | Exhibition entrance scanner only. No company portal. |
| `company_member` | Employee of a business company (builder, partner, bank or service). Personal login; no shared company password. |

## CompanyMemberRole (v1)

Role inside a company. Applies only when `User.account_type = company_member`.

| CompanyMemberRole | Description |
|---|---|
| `company_admin` | First provisioned user; can invite/manage company team members. |
| `member` | Regular company employee with company workspace access. |

Future roles (`manager`, `sales_agent`) will be added only when there is a real permissions difference.

## Company.type

| Company.type | Meaning |
|---|---|
| `builder` | Construction / developer company |
| `partner` | Exhibition or ecosystem partner |
| `bank` | Bank partner (mortgage offers) |
| `service` | Service provider company |

Company type defines business context and default modules. It is **not** stored on `User`.

## v1 Membership Constraint

One user may belong to **at most one company** in v1.

Enforced as a hard database constraint on `CompanyMember.user_id` (unique active membership). Multi-company membership may be added later.

## No Shared Company Login

Companies do not have a shared login or password.

Provisioning flow:

```text
ToonExpo creates Company
-> creates User(account_type = company_member)
-> creates CompanyMember(role = company_admin)
-> sends set-password link via Resend
-> company_admin invites additional staff (each gets personal login)
```

Reasons: audit trail (who changed an apartment, created a deal, sent an offer), offboarding terminated staff, deal assignment.

## BuyerProfile And QR Rules

Strict v1 rules:

| AccountType | BuyerProfile | Personal QR | Public profile |
|---|:---:|:---:|:---:|
| `buyer` | Yes | Yes | No (QR is opaque token, not a public page) |
| `platform_admin` | No | No | No |
| `entrance_staff` | No | No | No |
| `company_member` | No | No | No |

## Buyer QR Resolution By Scanner

Buyer QR uses an opaque server-side token (no personal data encoded in the QR).

Resolution depends on the authenticated scanner role:

| Scanner | Result |
|---|---|
| Buyer (owner) | My QR view in buyer cabinet |
| Company member (builder company) | Minimal buyer action screen (create request / send offer) |
| Entrance staff | Check-in screen |
| Unauthenticated / unauthorized | No name, phone or email exposed |

## Deal Creation Sources

Deal/request creation is one unified backend use case. CRM, deduplication and buyer history are shared.

| Source | Flow |
|---|---|
| `buyer_project_request` | Buyer scans Project QR → project page → Request price / Get offer → Request → Deal in builder CRM |
| `builder_buyer_qr_scan` | Company member scans Buyer QR → buyer action screen → Create request / Send offer → Request → Deal |

## Future CompanyMemberRole Expansion

Add only when operationally needed:

- `manager`;
- `sales_agent`;
- partner-specific admin/editor variants if module access requires them.

Do not implement these in v1 unless a real permissions gap appears.
