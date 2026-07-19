# ToonExpo Permissions Matrix

## v1 Account Model

Access is determined by:

- `User.account_type` — exclusive account type;
- `Company.type` — business context for `company_member` users;
- `CompanyMember.role` — `company_admin` or `member` in v1;
- enabled modules and data ownership.

Account types:

- Platform Admin (`platform_admin`);
- Company Member (`company_member`) — builder, partner, bank or service company;
- Buyer (`buyer`);
- Entrance Staff (`entrance_staff`).

Builder, partner and bank are **company types**, not user account types.

Detailed company member roles such as Sales Manager can be added in a later phase when permissions actually differ.

## Permissions

| Area | Platform Admin | Company Member (builder) | Company Member (partner/bank) | Buyer | Entrance Staff |
|---|---:|---:|---:|---:|---:|
| Public website | Manage | View own/public | View public | View | No |
| Buyer profile | View/manage if needed | Via QR scan action only | No | View own | No |
| Buyer QR | Manage/support | Scan buyer QR | No | Show own QR | Scan for check-in |
| Company profile | Full/manage | Edit own builder company | Edit own partner/bank profile | View public | No |
| Projects/buildings/apartments | Full/manage | Edit own (builder) | No | View public | No |
| Visual map/hotspots | Full/manage | Edit own (builder) | No | View public | No |
| CRM requests/deals | View all | Manage own company CRM | No in v1 | Create via project request | No |
| Constructor CRM | View/analytics | Manage own (builder) | No | No | No |
| Builder readiness | Full | View own (builder) | No | No | No |
| Partner profile/offers | Full/manage | No | Edit own | View public | No |
| Mortgage / bank offers | Full | No | Edit own if bank | View | No |
| Service provider directory | Full | View/use | View/use if enabled | View if public | No |
| Check-in | View summary | No | No | Show QR | Scan/check-in |
| Analytics | Full | Own company data | Own data if enabled | No | Check-in only |
| Settings | Full | Own company settings | Own profile settings | Own profile | No |
| Team invitations | All companies | `company_admin` invites staff | `company_admin` invites staff | No | No |

## v1 Rules

- One user account = one `AccountType`. No mixing.
- One `company_member` user = one company membership (DB constraint in v1).
- No shared company login/password.
- `BuyerProfile` and personal QR exist only for `buyer` accounts.
- Strangers scanning Buyer QR see no personal data.

## Future Expansion

If needed later:

- add `CompanyMemberRole` values (`manager`, `sales_agent`) with distinct permissions;
- split platform admin into Content Manager / Readiness Evaluator if operational need appears;
- relax single-company membership constraint.
