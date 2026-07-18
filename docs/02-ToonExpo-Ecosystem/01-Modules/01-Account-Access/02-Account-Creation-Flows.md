# Account Creation Flows

## Buyer Self-Registration

Buyer can self-register.

Required fields:

- name;
- phone;
- email;
- password.

The password is accepted only by the NestJS API, hashed with argon2id and never stored or logged in plaintext.

After registration:

- `User(account_type = buyer)` is created;
- `BuyerProfile` is created;
- permanent QR is generated;
- a revocable DB-backed session is created and returned through a secure httpOnly cookie;
- buyer can use My QR, favorites, requests and check-in identity.

## Buyer Created By Platform Admin

Platform admin can create buyer account if needed.

Use cases:

- event entrance registration;
- support case;
- manual visitor entry.

Admin-created buyers are not given generated passwords. ToonExpo sends a single-use, expiring set-password link through Resend. QR identity may be created immediately, while interactive account access requires the buyer to set a password.

## Company Provisioning (Builder / Partner / Bank / Service)

Business companies are not public self-registered in v1.

Created by:

- platform admin;
- BOS account provisioning after approved participant flow.

Companies do **not** receive a shared login or password.

Standard provisioning flow:

```text
ToonExpo creates Company(type = builder | partner | bank | service)
-> creates User(account_type = company_member)
-> creates CompanyMember(role = company_admin)
-> sends set-password link via Resend to primary contact email
-> company_admin sets password and accesses company workspace
-> company_admin invites additional staff (each gets personal User + CompanyMember)
```

Reasons for personal logins: audit (who changed apartment / created deal / sent offer), offboarding terminated staff, deal assignment.

## Builder Company Provisioning

When `Company.type = builder`:

- Company is created;
- first user is `company_member` with `CompanyMember.role = company_admin`;
- builder company profile (`BuilderCompany`) is linked;
- default builder modules are enabled (portal, projects, CRM, readiness, etc.).

## Partner Company Provisioning

When `Company.type = partner`:

- same personal-login provisioning flow;
- `PartnerCompany` profile is linked;
- partner module access is enabled.

## Bank Company Provisioning

When `Company.type = bank`:

- same flow as partner provisioning;
- `Company.type = bank`;
- bank offers module access can be enabled.

## Service Company Provisioning

When `Company.type = service`:

- same personal-login provisioning flow;
- service provider directory linkage if applicable.

## Company Admin Inviting Staff

`company_admin` invites employees:

```text
company_admin enters staff email/name
-> ToonExpo creates User(account_type = company_member)
-> creates CompanyMember(role = member)
-> sends set-password invitation via Resend
```

Each invited employee has a personal login. v1 constraint: invited user must not already belong to another company.

## Entrance Staff Account Creation

Entrance staff accounts are created by platform admin.

```text
User(account_type = entrance_staff)
```

Entrance staff should only access:

- scanner;
- check-in result;
- recent scans if enabled.

No `BuyerProfile`, no personal QR, no company membership.

## Platform Admin Account Creation

Platform admin accounts are created internally by existing admin/support process.

```text
User(account_type = platform_admin)
```

They have global ToonExpo admin access. No `BuyerProfile`, no personal QR, no company membership required.

## Separate Buyer Account For Staff

If a company employee needs buyer features (My QR, favorites, project requests as a visitor), they create or use a separate personal buyer account. Account types must not be mixed on one user.
