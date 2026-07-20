# ToonExpo Core Entities

## Status

Draft

## Account Entities

- user (with exclusive `AccountType`);
- company (with `Company.type`);
- company member (with `CompanyMemberRole`);
- module access;
- provisioning request.

## Public / Real Estate Entities

- company (`type = builder`) — v1 catalog owner; no separate builder company profile table;
- partner company;
- project;
- building;
- floor;
- apartment;
- apartment status history;
- media asset;
- visual map canvas;
- visual hotspot;
- partner offer;
- partner service;
- bank offer;
- service provider;
- service provider category.

## Buyer / Event Entities

- event;
- public venue map snapshot;
- public venue area;
- public venue landmark;
- map publication receipt;
- buyer profile;
- buyer builder interaction;
- favorite;
- request;
- QR code;
- QR scan event;
- check-in record (separate later module).

## CRM Entities

- lead intake alias;
- client;
- CRM follow-up activity;
- deal/opportunity;
- CRM deal apartment link;
- apartment sales status;
- CRM note.

## Readiness Entities

- readiness assessment;
- readiness category;
- score/status;
- recommendation;
- required action;
- internal note.

## Admin / Content Entities

- content page;
- content block;
- platform setting;
- translation;
- audit log.

## Analytics Entities

- analytics event;
- analytics daily aggregate.
