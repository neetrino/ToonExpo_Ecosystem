# Account Creation And Access

## Account Creation Rule

Partner accounts are not self-registered publicly in v1.

They are created by:

- BigProjects Admin/staff inside ToonExpo;
- BOS account provisioning signal after approval/payment if implemented.

## Partner User Access

Partner user can manage own profile only if enabled.

v1 can also be admin-managed only.

Recommended v1:

- BigProjects Admin can manage all partner profiles;
- partner user can edit own profile/offers only when account access is enabled.

## Bank Partner Access

Bank partner can edit own bank offer fields only if enabled.

BigProjects Admin can always create/edit/publish bank offers.

## Permissions

Partner can:

- view own profile;
- edit own profile if enabled;
- edit own offers if enabled;
- view own public page.

Partner cannot:

- edit builder projects;
- edit other partner profiles;
- manage mortgage page globally;
- access builder CRM;
- self-publish if admin approval is required.

## Login And Roles

Use standard ToonExpo account system:

- User;
- Company;
- CompanyMember;
- Role/ModuleAccess.

Do not build separate partner authentication.

## BOS Provisioning

BOS can request creation of partner account.

Minimum payload:

- company name;
- partner type;
- contact name;
- contact email;
- contact phone optional.

ToonExpo creates account/company and sends login/invitation if email exists.

