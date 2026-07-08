# Settings Languages And Dictionaries

## Purpose

Settings provide platform-level configuration for ToonExpo.

Keep v1 settings practical and limited.

## Languages

Supported languages:

- Armenian;
- Russian;
- English.

More languages can be added later.

## Translatable Content

Public-facing text should support translations:

- project descriptions;
- apartment descriptions;
- partner profiles;
- static content;
- service provider descriptions;
- readiness recommendations if shown to builder.

## Dictionaries

Admin may manage simple dictionaries:

- partner types;
- project categories optional;
- readiness categories;
- service provider categories;
- apartment feature labels optional;
- venue booth types optional.

Prefer fixed enums for technical statuses.

## Platform Settings

Possible v1 settings:

- default language;
- enabled languages;
- public site navigation flags;
- buyer registration enabled;
- partner editing enabled;
- builder publishing enabled;
- mortgage page enabled;
- service provider directory public enabled.

## Settings Safety

Important settings changes should be audited.

Avoid too many settings in v1 because they make implementation harder to reason about.

