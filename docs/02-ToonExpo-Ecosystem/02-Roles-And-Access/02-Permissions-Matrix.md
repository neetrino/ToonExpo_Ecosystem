# ToonExpo Permissions Matrix

## v1 Role Model

Keep v1 simple.

Roles:

- BigProjects Admin;
- Builder;
- Partner;
- Buyer / Visitor;
- Entrance Staff.

Detailed roles such as Builder Sales Manager, Builder Editor, Content Manager and Readiness Evaluator can be added in v2.

## Permissions

| Area | BigProjects Admin | Builder | Partner | Buyer / Visitor | Entrance Staff |
|---|---:|---:|---:|---:|---:|
| Public website | Manage | View own/public | View public | View | No |
| Buyer profile | View/manage if needed | View after QR/request | No | View own | Minimal check-in view |
| Buyer QR | Manage/support | Scan buyer QR | No | Show own QR | Scan for check-in |
| Builder company profile | Full/manage | Edit own | No | View public | No |
| Projects/buildings/apartments | Full/manage | Edit own | No | View public | No |
| Visual map/hotspots | Full/manage | Edit own | No | View public | No |
| CRM requests/deals | View all | Manage own | No in v1 | Create request | No |
| Constructor CRM | View/analytics | Manage own | No | No | No |
| Builder readiness | Full | View own | No | No | No |
| Partner profile/offers | Full/manage | No | Edit own | View public | No |
| Mortgage / bank offers | Full | No | Edit own if bank | View | No |
| Service provider directory | Full | View/use | View/use if enabled | View if public | No |
| Check-in | View summary | No | No | Show QR | Scan/check-in |
| Analytics | Full | Own data | Own data if enabled | No | Check-in only |
| Settings | Full | Own company settings | Own profile settings | Own profile | No |

## v1 Rule

Do not create many sub-roles in v1.

If needed later:

- split Builder into Owner/Admin/Sales Manager/Viewer;
- split BigProjects Admin into Platform Admin/Content Manager/Readiness Evaluator;
- split Partner into Owner/Admin/Editor.
