# Venue Map And Booths

## Venue Map

Venue map is the 2D map/plan of the event location.

It can be:

- image;
- floor plan;
- simplified drawing;
- SVG/map later if needed.

v1 can use a ready image/plan with coordinates.

## Booth / Stand / Cell

A booth/cell is a physical location on the venue map.

Examples:

- A01;
- B12;
- Bank Zone 3;
- Sponsor Stand 5.

## Booth Data

Each booth/cell should have:

- code;
- name/label optional;
- type;
- map position;
- size/shape optional;
- assigned company/project;
- public visibility.

## Booth Types

Recommended v1:

```text
builder
bank
partner
sponsor
service
info
entrance
other
```

## Assignments

Booth can be assigned to:

- BuilderCompany;
- PartnerCompany;
- Project optional;
- Bank partner via PartnerCompany type bank.

Project assignment is useful when visitor searches for a specific project.

## Coordinate Rule

Store booth position as percentages relative to the venue map image:

```text
x_percent: 0-100
y_percent: 0-100
```

If area/shape is needed later, add shape data.

## Public Display

Public map should show:

- booth marker/cell;
- company name;
- project name if assigned;
- booth code;
- type/category.

## Fallback

If map visual is unavailable or route is not configured:

- show booth list;
- show search results;
- show booth code/location text.

Do not block visitor from finding company because route graph is incomplete.

