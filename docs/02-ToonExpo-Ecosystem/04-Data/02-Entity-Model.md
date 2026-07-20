# ToonExpo Entity Model

## Purpose

This is a conceptual data model for ToonExpo Ecosystem.

It is not a final SQL schema yet.

## Account Entities

```text
User                    (account_type: buyer | platform_admin | entrance_staff | company_member)
Company                 (type: builder | partner | bank | service)
CompanyMember           (role: company_admin | member)
ModuleAccess
ProvisioningRequest
```

## Real Estate Entities

```text
Company (type = builder)   — v1: no separate BuilderCompany table
Project
Building
Floor
Apartment
ApartmentStatusHistory
MediaAsset                   — v1 catalog: cover/logo URL fields; full galleries post-v1
VisualMapCanvas
VisualHotspot
Translation                  — catalog content hy/ru/en from v1
```

## Buyer / Event Entities

```text
Event
PublicVenueMapSnapshot
PublicVenueArea
PublicVenueLandmark
MapPublicationReceipt
BuyerProfile
BuyerBuilderInteraction
Favorite
Request
QrCode
QrScanEvent
CheckInRecord (separate later module)
```

## CRM Entities

```text
Lead optional intake alias, not separate workspace
Client
CrmFollowUpActivity
CrmDeal
CrmDealApartmentLink
CrmNote
ApartmentSalesStatus
```

## Readiness Entities

```text
ReadinessAssessment
ReadinessCategory
ReadinessScore
ReadinessRecommendation
RequiredAction
InternalReadinessNote
```

## Partner Entities

```text
PartnerCompany
PartnerOffer
PartnerService
BankOffer
ServiceProvider
ServiceProviderCategory
```

## Admin / Content Entities

```text
ContentPage
ContentBlock
PlatformSetting
Translation
AuditLog
```

## Analytics Entities

```text
AnalyticsEvent
AnalyticsDailyAggregate
```

## Key Relationships

```text
Company 1..n CompanyMembers
User 0..1 CompanyMember          (v1: one company per user, hard DB constraint)
Company 0..n ModuleAccess
User 0..n ModuleAccess
User 0..1 BuyerProfile           (only when account_type = buyer)
Company 0..1 BuilderCompany      (conceptual alias when type = builder; no separate table in v1)
Company 0..1 PartnerCompany      (when type = partner or bank)
ProvisioningRequest 0..1 Company
ProvisioningRequest 0..1 User
Company(type=builder) 1..n Projects
Project 1..n Buildings
Building 1..n Floors
Floor 1..n Apartments
Apartment 0..n ApartmentStatusHistory
Project/Building/Floor 0..n VisualMapCanvases
VisualMapCanvas 0..n VisualHotspots
VisualHotspot n..1 Building/Floor/Apartment target
BuyerProfile 1..1 QrCode
BuyerProfile 1..n Favorites
BuyerProfile 1..n Requests
BuyerProfile 0..n BuyerBuilderInteractions
QrCode 0..n QrScanEvents
QrScanEvent 0..1 Request
Event 0..n PublicVenueMapSnapshots
PublicVenueMapSnapshot 1..n PublicVenueAreas
PublicVenueMapSnapshot 0..n PublicVenueLandmarks
PublicVenueArea 0..1 Company
PublicVenueArea 0..1 Project
PublicVenueMapSnapshot 1..n MapPublicationReceipts
Request 0..1 Lead
Request 0..1 CrmDeal
Lead 0..1 CrmDeal
CrmDeal 0..n CrmFollowUpActivities
CrmDeal 0..n CrmDealApartmentLinks
CrmDeal 0..n CrmNotes
CrmDealApartmentLink n..1 Apartment
CrmDeal 0..1 BuyerBuilderInteraction
CrmDeal 0..n ApartmentStatusHistory
Project 0..n ReadinessAssessments
Company(type=builder) 0..n ReadinessAssessments
ReadinessAssessment 0..n ReadinessScores
ReadinessScore n..1 ReadinessCategory
ReadinessAssessment 0..n ReadinessRecommendations
ReadinessAssessment 0..n RequiredActions
ReadinessAssessment 0..n InternalReadinessNotes
ReadinessCategory 0..1 ServiceProviderCategory
ServiceProvider 0..n ServiceProviderCategories
PartnerCompany 0..n BankOffers
PartnerCompany 0..n PartnerOffers
PartnerCompany 0..n PartnerServices
BankOffer n..1 PartnerCompany(type=bank)
ContentPage 0..n ContentBlocks
Any public entity 0..n Translations
User 0..n AuditLogs
User 0..n AnalyticsEvents
Company(type=builder) 0..n AnalyticsEvents
PartnerCompany 0..n AnalyticsEvents
Project 0..n AnalyticsEvents
Apartment 0..n AnalyticsEvents
Event 0..n AnalyticsEvents
PublicVenueArea 0..n AnalyticsEvents
Request 0..n AnalyticsEvents
CrmDeal 0..n AnalyticsEvents
```

## Source Of Truth

- ToonExpo public module owns public project/building/apartment presentation.
- Account & Access owns users, account types, companies, memberships, company member roles, module access and provisioning requests.
- Public Web / Mobile App owns public navigation and browsing surfaces.
- Buyer / Visitor Area owns buyer profile display, favorites, My QR entry and buyer-facing request/history views.
- Constructor CRM owns apartment sales status.
- Readiness owns readiness scores/recommendations.
- Service Provider Directory owns service providers and provider categories used for readiness help.
- QR module owns QR tokens and scan logs.
- Public Exhibition Map owns immutable BOS snapshot copies, public areas, landmarks, search/read models and visitor rendering.
- Check-in is a separate later ToonExpo module and is not owned by Public Exhibition Map.
- Admin / Content Management owns public content, settings and audit logs.
- Analytics owns analytics events and aggregate reporting views.

## CRM Follow-up Clarification

CrmFollowUpActivity is not a general platform task.

It means a CRM activity/reminder inside a CRM deal/request, such as:

- call buyer;
- send offer;
- follow up after event;
- add comment.

## Request / Lead Clarification

Lead is an optional intake alias for implementation convenience.

Do not create a separate Requests / Leads workspace outside Constructor CRM in v1.
