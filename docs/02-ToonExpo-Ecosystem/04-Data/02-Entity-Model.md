# ToonExpo Entity Model

## Purpose

This is a conceptual data model for ToonExpo Ecosystem.

It is not a final SQL schema yet.

## Account Entities

```text
User
Company
CompanyMember
Role
ModuleAccess
ProvisioningRequest
```

## Real Estate Entities

```text
BuilderCompany
Project
Building
Floor
Apartment
ApartmentStatusHistory
MediaAsset
VisualMapCanvas
VisualHotspot
```

## Buyer / Event Entities

```text
Event
VenueMap
Booth
BoothAssignment
RouteNode
RouteEdge
BuyerProfile
BuyerBuilderInteraction
Favorite
Request
QrCode
QrScanEvent
CheckInRecord
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
User 0..n CompanyMembers
Company 0..n ModuleAccess
User 0..n ModuleAccess
User 0..1 BuyerProfile
Company 0..1 BuilderCompany
Company 0..1 PartnerCompany
ProvisioningRequest 0..1 Company
ProvisioningRequest 0..1 User
BuilderCompany 1..n Projects
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
Event 0..n VenueMaps
Event 0..n Booths
VenueMap 0..n Booths
Booth 0..n BoothAssignments
BoothAssignment 0..1 BuilderCompany
BoothAssignment 0..1 PartnerCompany
BoothAssignment 0..1 Project
VenueMap 0..n RouteNodes
VenueMap 0..n RouteEdges
BuyerProfile 0..n CheckInRecords
Event 0..n CheckInRecords
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
BuilderCompany 0..n ReadinessAssessments
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
BuilderCompany 0..n AnalyticsEvents
PartnerCompany 0..n AnalyticsEvents
Project 0..n AnalyticsEvents
Apartment 0..n AnalyticsEvents
Event 0..n AnalyticsEvents
Booth 0..n AnalyticsEvents
Request 0..n AnalyticsEvents
CrmDeal 0..n AnalyticsEvents
```

## Source Of Truth

- ToonExpo public module owns public project/building/apartment presentation.
- Account & Access owns users, companies, memberships, roles, module access and provisioning requests.
- Public Web / Mobile App owns public navigation and browsing surfaces.
- Buyer / Visitor Area owns buyer profile display, favorites, My QR entry and buyer-facing request/history views.
- Constructor CRM owns apartment sales status.
- Readiness owns readiness scores/recommendations.
- Service Provider Directory owns service providers and provider categories used for readiness help.
- QR module owns QR tokens and scan logs.
- Exhibition Map & Check-in owns venue maps, booths, booth assignments, route graph and check-in records.
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
