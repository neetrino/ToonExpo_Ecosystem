# Account Creation Flows

## Buyer Self-Registration

Buyer / ordinary visitor can self-register.

Required fields:

- name;
- phone;
- email;
- password.

The password is accepted only by the NestJS API, hashed with argon2id and never stored or logged in plaintext.

After registration:

- BuyerProfile is created;
- permanent QR is generated;
- a revocable DB-backed session is created and returned through a secure httpOnly cookie;
- buyer can use My QR, favorites, requests and check-in identity.

## Buyer Created By Admin

BigProjects Admin/staff can create buyer account if needed.

Use cases:

- event entrance registration;
- support case;
- manual visitor entry.

Admin-created buyers are not given generated passwords. ToonExpo sends a single-use, expiring set-password link through Resend. QR identity may be created immediately, while interactive account access requires the buyer to set a password.

## Builder Account Creation

Builder accounts are not public self-registered in v1.

Created by:

- BigProjects Admin/staff;
- BOS account provisioning after approved participant flow.

Builder account receives:

- Company;
- BuilderCompany profile;
- primary User;
- CompanyMember;
- Builder role/module access.

The primary user receives a single-use, expiring set-password invitation. Neither BOS nor an administrator sends or stores a plaintext password.

## Partner Account Creation

Partner accounts are not public self-registered in v1.

Created by:

- BigProjects Admin/staff;
- BOS provisioning if applicable.

Partner account receives:

- Company;
- PartnerCompany profile;
- primary User;
- CompanyMember;
- Partner role/module access.

The primary user receives the same single-use set-password invitation flow as a builder user.

## Bank Account Creation

Bank is a partner type.

Bank account creation is the same as partner creation, but:

```text
PartnerCompany type = bank
```

Bank module access can include:

- partner profile;
- mortgage / bank offers if enabled.

## Entrance Staff Account Creation

Entrance Staff accounts are created by BigProjects Admin/staff.

Entrance Staff should only access:

- scanner;
- check-in result;
- recent scans if enabled.

## BigProjects Admin Account Creation

BigProjects Admin accounts are created internally by existing admin/support process.

They have global ToonExpo admin access according to v1 role model.
